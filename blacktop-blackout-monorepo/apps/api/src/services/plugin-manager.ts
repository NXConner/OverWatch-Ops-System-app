import { PluginManager } from 'live-plugin-manager';
import ivm from 'isolated-vm';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';

export interface PluginInterface {
  name: string;
  version: string;
  description: string;
  author: string;
  type: 'backend' | 'frontend' | 'hybrid';
  dependencies?: string[];
  permissions?: string[];
  signature?: string;
  checksum?: string;
  initialize?(context: PluginContext): Promise<void>;
  activate?(): Promise<void>;
  deactivate?(): Promise<void>;
  destroy?(): Promise<void>;
  getApi?(): any;
}

export interface PluginContext {
  logger: typeof logger;
  database: any;
  config: any;
  events: EventEmitter;
  io?: any;
}

export interface LoadedPlugin {
  metadata: PluginInterface;
  instance: any;
  context: PluginContext;
  status: 'loading' | 'active' | 'inactive' | 'error';
  isolate?: ivm.Isolate;
  loadedAt: Date;
  lastError?: string;
}

class PluginManagerClass {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private npm: PluginManager;
  private pluginsDirectory: string;
  private trustedSigners: Set<string> = new Set();
  private events: EventEmitter;

  constructor() {
    this.pluginsDirectory = process.env.PLUGINS_DIR || './plugins';
    this.npm = new PluginManager({
      pluginsPath: this.pluginsDirectory,
      npmPath: process.env.NPM_PATH || 'npm',
      npmInstallMode: 'noOptional'
    });
    this.events = new EventEmitter();
    
    // Add trusted signer public keys
    this.initializeTrustedSigners();
  }

  private initializeTrustedSigners(): void {
    // TODO: Load trusted public keys from configuration
    // These would be the public keys of trusted plugin developers
    const trustedKeys = process.env.TRUSTED_PLUGIN_SIGNERS?.split(',') || [];
    trustedKeys.forEach(key => this.trustedSigners.add(key.trim()));
    
    logger.info(`Initialized with ${this.trustedSigners.size} trusted plugin signers`);
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Plugin Manager...');
      
      // Ensure plugins directory exists
      await fs.mkdir(this.pluginsDirectory, { recursive: true });
      
      // Load existing plugins
      await this.loadExistingPlugins();
      
      logger.info('Plugin Manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Plugin Manager:', error);
      throw error;
    }
  }

  private async loadExistingPlugins(): Promise<void> {
    try {
      const pluginDirs = await fs.readdir(this.pluginsDirectory);
      
      for (const dir of pluginDirs) {
        const pluginPath = path.join(this.pluginsDirectory, dir);
        const stats = await fs.stat(pluginPath);
        
        if (stats.isDirectory()) {
          try {
            await this.loadPluginFromDirectory(pluginPath);
          } catch (error) {
            logger.warn(`Failed to load plugin from ${dir}:`, error);
          }
        }
      }
      
      logger.info(`Loaded ${this.plugins.size} existing plugins`);
    } catch (error) {
      logger.error('Failed to load existing plugins:', error);
    }
  }

  private async loadPluginFromDirectory(pluginPath: string): Promise<void> {
    const packageJsonPath = path.join(pluginPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    const pluginName = packageJson.name;
    const mainFile = path.join(pluginPath, packageJson.main || 'index.js');
    
    // Verify plugin signature if present
    if (packageJson.signature) {
      await this.verifyPluginSignature(pluginPath, packageJson);
    }
    
    await this.loadPlugin(pluginName, mainFile, packageJson);
  }

  private async verifyPluginSignature(pluginPath: string, packageJson: any): Promise<void> {
    if (!this.trustedSigners.has(packageJson.author)) {
      throw new Error(`Plugin author ${packageJson.author} is not in trusted signers list`);
    }
    
    // Calculate checksum of plugin files
    const checksum = await this.calculatePluginChecksum(pluginPath);
    
    if (packageJson.checksum && packageJson.checksum !== checksum) {
      throw new Error('Plugin checksum verification failed');
    }
    
    // TODO: Implement full digital signature verification
    logger.debug(`Plugin signature verified for ${packageJson.name}`);
  }

  private async calculatePluginChecksum(pluginPath: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    const files = await this.getPluginFiles(pluginPath);
    
    for (const file of files.sort()) {
      const content = await fs.readFile(path.join(pluginPath, file));
      hash.update(content);
    }
    
    return hash.digest('hex');
  }

  private async getPluginFiles(pluginPath: string): Promise<string[]> {
    const files: string[] = [];
    
    async function traverse(dir: string, basePath: string = '') {
      const entries = await fs.readdir(dir);
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const relativePath = path.join(basePath, entry);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory() && entry !== 'node_modules') {
          await traverse(fullPath, relativePath);
        } else if (stats.isFile()) {
          files.push(relativePath);
        }
      }
    }
    
    await traverse(pluginPath);
    return files;
  }

  async installPlugin(source: string, options?: { version?: string; trusted?: boolean }): Promise<void> {
    try {
      logger.info(`Installing plugin from: ${source}`);
      
      // Install via npm
      const info = await this.npm.install(source, options?.version);
      logger.info(`Plugin installed: ${info.name}@${info.version}`);
      
      // Load the plugin
      await this.loadPlugin(info.name, info.location);
      
      this.events.emit('plugin:installed', { name: info.name, version: info.version });
    } catch (error) {
      logger.error(`Failed to install plugin ${source}:`, error);
      throw error;
    }
  }

  async loadPlugin(name: string, mainFile: string, metadata?: any): Promise<void> {
    try {
      logger.info(`Loading plugin: ${name}`);
      
      const plugin: LoadedPlugin = {
        metadata: metadata || await this.loadPluginMetadata(mainFile),
        instance: null,
        context: this.createPluginContext(name),
        status: 'loading',
        loadedAt: new Date()
      };
      
      // Create isolated environment for untrusted plugins
      if (!metadata?.trusted) {
        plugin.isolate = await this.createSecureIsolate();
        plugin.instance = await this.loadPluginInIsolate(plugin.isolate, mainFile);
      } else {
        // Load trusted plugins directly
        delete require.cache[require.resolve(mainFile)];
        const PluginClass = require(mainFile);
        plugin.instance = new PluginClass();
      }
      
      // Initialize plugin
      if (plugin.instance.initialize) {
        await plugin.instance.initialize(plugin.context);
      }
      
      plugin.status = 'active';
      this.plugins.set(name, plugin);
      
      logger.info(`Plugin loaded successfully: ${name}`);
      this.events.emit('plugin:loaded', { name, metadata: plugin.metadata });
    } catch (error) {
      logger.error(`Failed to load plugin ${name}:`, error);
      throw error;
    }
  }

  private async createSecureIsolate(): Promise<ivm.Isolate> {
    const isolate = new ivm.Isolate({
      memoryLimit: 128, // 128MB limit
      inspector: false
    });
    
    const context = await isolate.createContext();
    const jail = context.global;
    
    // Set up limited global environment
    await jail.set('global', jail.derefInto());
    await jail.set('console', {
      log: (...args: any[]) => logger.info('Plugin:', ...args),
      error: (...args: any[]) => logger.error('Plugin:', ...args),
      warn: (...args: any[]) => logger.warn('Plugin:', ...args),
      info: (...args: any[]) => logger.info('Plugin:', ...args)
    });
    
    // Restrict dangerous globals
    await context.eval(`
      delete global.process;
      delete global.require;
      delete global.__dirname;
      delete global.__filename;
    `);
    
    return isolate;
  }

  private async loadPluginInIsolate(isolate: ivm.Isolate, mainFile: string): Promise<any> {
    const context = isolate.getContext();
    const code = await fs.readFile(mainFile, 'utf-8');
    
    // Wrap plugin code in a safe execution environment
    const wrappedCode = `
      (function() {
        ${code}
        return typeof module !== 'undefined' && module.exports ? module.exports : exports;
      })();
    `;
    
    const result = await context.eval(wrappedCode, { timeout: 10000 });
    return result;
  }

  private async loadPluginMetadata(mainFile: string): Promise<PluginInterface> {
    const packageJsonPath = path.join(path.dirname(mainFile), 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description || '',
      author: packageJson.author || 'Unknown',
      type: packageJson.pluginType || 'backend',
      dependencies: packageJson.pluginDependencies || [],
      permissions: packageJson.pluginPermissions || []
    };
  }

  private createPluginContext(pluginName: string): PluginContext {
    return {
      logger: {
        ...logger,
        info: (message: string, meta?: any) => logger.info(`[${pluginName}] ${message}`, meta),
        error: (message: string, meta?: any) => logger.error(`[${pluginName}] ${message}`, meta),
        warn: (message: string, meta?: any) => logger.warn(`[${pluginName}] ${message}`, meta),
        debug: (message: string, meta?: any) => logger.debug(`[${pluginName}] ${message}`, meta)
      },
      database: null, // TODO: Provide restricted database access
      config: {},
      events: this.events
    };
  }

  async unloadPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    
    try {
      logger.info(`Unloading plugin: ${name}`);
      
      // Deactivate plugin
      if (plugin.instance.deactivate) {
        await plugin.instance.deactivate();
      }
      
      // Destroy plugin
      if (plugin.instance.destroy) {
        await plugin.instance.destroy();
      }
      
      // Dispose isolate if present
      if (plugin.isolate) {
        plugin.isolate.dispose();
      }
      
      plugin.status = 'inactive';
      this.plugins.delete(name);
      
      logger.info(`Plugin unloaded: ${name}`);
      this.events.emit('plugin:unloaded', { name });
    } catch (error) {
      logger.error(`Failed to unload plugin ${name}:`, error);
      plugin.status = 'error';
      plugin.lastError = error.message;
      throw error;
    }
  }

  async enablePlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    
    if (plugin.instance.activate) {
      await plugin.instance.activate();
    }
    
    plugin.status = 'active';
    this.events.emit('plugin:enabled', { name });
  }

  async disablePlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
    }
    
    if (plugin.instance.deactivate) {
      await plugin.instance.deactivate();
    }
    
    plugin.status = 'inactive';
    this.events.emit('plugin:disabled', { name });
  }

  getLoadedPlugins(): LoadedPlugin[] {
    return Array.from(this.plugins.values());
  }

  getPlugin(name: string): LoadedPlugin | undefined {
    return this.plugins.get(name);
  }

  getPluginApi(name: string): any {
    const plugin = this.plugins.get(name);
    if (!plugin || plugin.status !== 'active') {
      return null;
    }
    
    return plugin.instance.getApi ? plugin.instance.getApi() : plugin.instance;
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down Plugin Manager...');
    
    for (const [name, plugin] of this.plugins) {
      try {
        await this.unloadPlugin(name);
      } catch (error) {
        logger.error(`Error unloading plugin ${name} during shutdown:`, error);
      }
    }
    
    logger.info('Plugin Manager shutdown complete');
  }
}

// Import EventEmitter
import { EventEmitter } from 'events';

export const pluginManager = new PluginManagerClass();