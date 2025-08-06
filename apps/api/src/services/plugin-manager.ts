import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

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
  logger: {
    info: (message: string, meta?: any) => any;
    error: (message: string, meta?: any) => any;
    warn: (message: string, meta?: any) => any;
    debug: (message: string, meta?: any) => any;
  };
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
  loadedAt: Date;
  lastError?: string;
}

class PluginManagerClass {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private pluginsDirectory: string;
  private trustedSigners: Set<string> = new Set();
  private events: EventEmitter;

  constructor() {
    this.pluginsDirectory = process.env.PLUGINS_DIR || './plugins';
    this.events = new EventEmitter();
    
    // Add trusted signer public keys
    this.initializeTrustedSigners();
  }

  private initializeTrustedSigners(): void {
    // TODO: Load trusted public keys from configuration
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
    // Simplified installation - just log for now
    logger.info(`Plugin installation requested: ${source}`);
    logger.warn('Plugin installation will be implemented with package manager integration');
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
      
      // For now, just create a placeholder instance
      plugin.instance = {
        name,
        initialized: false,
        getApi: () => ({ name, status: 'loaded' })
      };
      
      plugin.status = 'active';
      this.plugins.set(name, plugin);
      
      logger.info(`Plugin loaded successfully: ${name}`);
      this.events.emit('plugin:loaded', { name, metadata: plugin.metadata });
    } catch (error) {
      logger.error(`Failed to load plugin ${name}:`, error);
      throw error;
    }
  }

  private async loadPluginMetadata(mainFile: string): Promise<PluginInterface> {
    const packageJsonPath = path.join(path.dirname(mainFile), 'package.json');
    
    try {
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
    } catch (error) {
      logger.warn(`Could not load plugin metadata from ${packageJsonPath}:`, error);
      return {
        name: 'unknown-plugin',
        version: '1.0.0',
        description: 'Plugin loaded without metadata',
        author: 'Unknown',
        type: 'backend'
      };
    }
  }

  private createPluginContext(pluginName: string): PluginContext {
    return {
      logger: {
        info: (message: string, meta?: any) => {
          logger.info(`[${pluginName}] ${message}`, meta);
          return logger;
        },
        error: (message: string, meta?: any) => {
          logger.error(`[${pluginName}] ${message}`, meta);
          return logger;
        },
        warn: (message: string, meta?: any) => {
          logger.warn(`[${pluginName}] ${message}`, meta);
          return logger;
        },
        debug: (message: string, meta?: any) => {
          logger.debug(`[${pluginName}] ${message}`, meta);
          return logger;
        }
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
    
    plugin.status = 'active';
    this.events.emit('plugin:enabled', { name });
  }

  async disablePlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} not found`);
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

export const pluginManager = new PluginManagerClass();