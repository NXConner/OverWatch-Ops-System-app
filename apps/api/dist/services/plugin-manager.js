"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginManager = void 0;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const promises_1 = tslib_1.__importDefault(require("fs/promises"));
const path_1 = tslib_1.__importDefault(require("path"));
const logger_1 = require("../utils/logger");
const events_1 = require("events");
class PluginManagerClass {
    constructor() {
        this.plugins = new Map();
        this.trustedSigners = new Set();
        this.pluginsDirectory = process.env.PLUGINS_DIR || './plugins';
        this.events = new events_1.EventEmitter();
        // Add trusted signer public keys
        this.initializeTrustedSigners();
    }
    initializeTrustedSigners() {
        // TODO: Load trusted public keys from configuration
        const trustedKeys = process.env.TRUSTED_PLUGIN_SIGNERS?.split(',') || [];
        trustedKeys.forEach(key => this.trustedSigners.add(key.trim()));
        logger_1.logger.info(`Initialized with ${this.trustedSigners.size} trusted plugin signers`);
    }
    async initialize() {
        try {
            logger_1.logger.info('Initializing Plugin Manager...');
            // Ensure plugins directory exists
            await promises_1.default.mkdir(this.pluginsDirectory, { recursive: true });
            // Load existing plugins
            await this.loadExistingPlugins();
            logger_1.logger.info('Plugin Manager initialized successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to initialize Plugin Manager:', error);
            throw error;
        }
    }
    async loadExistingPlugins() {
        try {
            const pluginDirs = await promises_1.default.readdir(this.pluginsDirectory);
            for (const dir of pluginDirs) {
                const pluginPath = path_1.default.join(this.pluginsDirectory, dir);
                const stats = await promises_1.default.stat(pluginPath);
                if (stats.isDirectory()) {
                    try {
                        await this.loadPluginFromDirectory(pluginPath);
                    }
                    catch (error) {
                        logger_1.logger.warn(`Failed to load plugin from ${dir}:`, error);
                    }
                }
            }
            logger_1.logger.info(`Loaded ${this.plugins.size} existing plugins`);
        }
        catch (error) {
            logger_1.logger.error('Failed to load existing plugins:', error);
        }
    }
    async loadPluginFromDirectory(pluginPath) {
        const packageJsonPath = path_1.default.join(pluginPath, 'package.json');
        const packageJson = JSON.parse(await promises_1.default.readFile(packageJsonPath, 'utf-8'));
        const pluginName = packageJson.name;
        const mainFile = path_1.default.join(pluginPath, packageJson.main || 'index.js');
        // Verify plugin signature if present
        if (packageJson.signature) {
            await this.verifyPluginSignature(pluginPath, packageJson);
        }
        await this.loadPlugin(pluginName, mainFile, packageJson);
    }
    async verifyPluginSignature(pluginPath, packageJson) {
        if (!this.trustedSigners.has(packageJson.author)) {
            throw new Error(`Plugin author ${packageJson.author} is not in trusted signers list`);
        }
        // Calculate checksum of plugin files
        const checksum = await this.calculatePluginChecksum(pluginPath);
        if (packageJson.checksum && packageJson.checksum !== checksum) {
            throw new Error('Plugin checksum verification failed');
        }
        logger_1.logger.debug(`Plugin signature verified for ${packageJson.name}`);
    }
    async calculatePluginChecksum(pluginPath) {
        const hash = crypto_1.default.createHash('sha256');
        const files = await this.getPluginFiles(pluginPath);
        for (const file of files.sort()) {
            const content = await promises_1.default.readFile(path_1.default.join(pluginPath, file));
            hash.update(content);
        }
        return hash.digest('hex');
    }
    async getPluginFiles(pluginPath) {
        const files = [];
        async function traverse(dir, basePath = '') {
            const entries = await promises_1.default.readdir(dir);
            for (const entry of entries) {
                const fullPath = path_1.default.join(dir, entry);
                const relativePath = path_1.default.join(basePath, entry);
                const stats = await promises_1.default.stat(fullPath);
                if (stats.isDirectory() && entry !== 'node_modules') {
                    await traverse(fullPath, relativePath);
                }
                else if (stats.isFile()) {
                    files.push(relativePath);
                }
            }
        }
        await traverse(pluginPath);
        return files;
    }
    async installPlugin(source, options) {
        // Simplified installation - just log for now
        logger_1.logger.info(`Plugin installation requested: ${source}`);
        logger_1.logger.warn('Plugin installation will be implemented with package manager integration');
    }
    async loadPlugin(name, mainFile, metadata) {
        try {
            logger_1.logger.info(`Loading plugin: ${name}`);
            const plugin = {
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
            logger_1.logger.info(`Plugin loaded successfully: ${name}`);
            this.events.emit('plugin:loaded', { name, metadata: plugin.metadata });
        }
        catch (error) {
            logger_1.logger.error(`Failed to load plugin ${name}:`, error);
            throw error;
        }
    }
    async loadPluginMetadata(mainFile) {
        const packageJsonPath = path_1.default.join(path_1.default.dirname(mainFile), 'package.json');
        try {
            const packageJson = JSON.parse(await promises_1.default.readFile(packageJsonPath, 'utf-8'));
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
        catch (error) {
            logger_1.logger.warn(`Could not load plugin metadata from ${packageJsonPath}:`, error);
            return {
                name: 'unknown-plugin',
                version: '1.0.0',
                description: 'Plugin loaded without metadata',
                author: 'Unknown',
                type: 'backend'
            };
        }
    }
    createPluginContext(pluginName) {
        return {
            logger: {
                info: (message, meta) => {
                    logger_1.logger.info(`[${pluginName}] ${message}`, meta);
                    return logger_1.logger;
                },
                error: (message, meta) => {
                    logger_1.logger.error(`[${pluginName}] ${message}`, meta);
                    return logger_1.logger;
                },
                warn: (message, meta) => {
                    logger_1.logger.warn(`[${pluginName}] ${message}`, meta);
                    return logger_1.logger;
                },
                debug: (message, meta) => {
                    logger_1.logger.debug(`[${pluginName}] ${message}`, meta);
                    return logger_1.logger;
                }
            },
            database: null, // TODO: Provide restricted database access
            config: {},
            events: this.events
        };
    }
    async unloadPlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin ${name} not found`);
        }
        try {
            logger_1.logger.info(`Unloading plugin: ${name}`);
            plugin.status = 'inactive';
            this.plugins.delete(name);
            logger_1.logger.info(`Plugin unloaded: ${name}`);
            this.events.emit('plugin:unloaded', { name });
        }
        catch (error) {
            logger_1.logger.error(`Failed to unload plugin ${name}:`, error);
            plugin.status = 'error';
            plugin.lastError = error.message;
            throw error;
        }
    }
    async enablePlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin ${name} not found`);
        }
        plugin.status = 'active';
        this.events.emit('plugin:enabled', { name });
    }
    async disablePlugin(name) {
        const plugin = this.plugins.get(name);
        if (!plugin) {
            throw new Error(`Plugin ${name} not found`);
        }
        plugin.status = 'inactive';
        this.events.emit('plugin:disabled', { name });
    }
    getLoadedPlugins() {
        return Array.from(this.plugins.values());
    }
    getPlugin(name) {
        return this.plugins.get(name);
    }
    getPluginApi(name) {
        const plugin = this.plugins.get(name);
        if (!plugin || plugin.status !== 'active') {
            return null;
        }
        return plugin.instance.getApi ? plugin.instance.getApi() : plugin.instance;
    }
    async shutdown() {
        logger_1.logger.info('Shutting down Plugin Manager...');
        for (const [name, plugin] of this.plugins) {
            try {
                await this.unloadPlugin(name);
            }
            catch (error) {
                logger_1.logger.error(`Error unloading plugin ${name} during shutdown:`, error);
            }
        }
        logger_1.logger.info('Plugin Manager shutdown complete');
    }
}
exports.pluginManager = new PluginManagerClass();
//# sourceMappingURL=plugin-manager.js.map