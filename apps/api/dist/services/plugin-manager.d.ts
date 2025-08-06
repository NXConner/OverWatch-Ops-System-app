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
declare class PluginManagerClass {
    private plugins;
    private pluginsDirectory;
    private trustedSigners;
    private events;
    constructor();
    private initializeTrustedSigners;
    initialize(): Promise<void>;
    private loadExistingPlugins;
    private loadPluginFromDirectory;
    private verifyPluginSignature;
    private calculatePluginChecksum;
    private getPluginFiles;
    installPlugin(source: string, options?: {
        version?: string;
        trusted?: boolean;
    }): Promise<void>;
    loadPlugin(name: string, mainFile: string, metadata?: any): Promise<void>;
    private loadPluginMetadata;
    private createPluginContext;
    unloadPlugin(name: string): Promise<void>;
    enablePlugin(name: string): Promise<void>;
    disablePlugin(name: string): Promise<void>;
    getLoadedPlugins(): LoadedPlugin[];
    getPlugin(name: string): LoadedPlugin | undefined;
    getPluginApi(name: string): any;
    shutdown(): Promise<void>;
}
export declare const pluginManager: PluginManagerClass;
export {};
//# sourceMappingURL=plugin-manager.d.ts.map