"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const error_handler_1 = require("../middleware/error-handler");
const plugin_manager_1 = require("../services/plugin-manager");
const router = (0, express_1.Router)();
// Get all loaded plugins
router.get('/', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const plugins = plugin_manager_1.pluginManager.getLoadedPlugins();
    res.json({
        message: 'Loaded plugins retrieved successfully',
        plugins: plugins.map(plugin => ({
            name: plugin.metadata.name,
            version: plugin.metadata.version,
            description: plugin.metadata.description,
            author: plugin.metadata.author,
            type: plugin.metadata.type,
            status: plugin.status,
            loadedAt: plugin.loadedAt,
            lastError: plugin.lastError
        }))
    });
}));
// Install plugin
router.post('/install', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const { source, version, trusted } = req.body;
    await plugin_manager_1.pluginManager.installPlugin(source, { version, trusted });
    res.json({
        message: 'Plugin installed successfully',
        source,
        version
    });
}));
// Enable plugin
router.post('/:name/enable', (0, error_handler_1.asyncHandler)(async (req, res) => {
    await plugin_manager_1.pluginManager.enablePlugin(req.params.name);
    res.json({
        message: `Plugin ${req.params.name} enabled successfully`
    });
}));
// Disable plugin
router.post('/:name/disable', (0, error_handler_1.asyncHandler)(async (req, res) => {
    await plugin_manager_1.pluginManager.disablePlugin(req.params.name);
    res.json({
        message: `Plugin ${req.params.name} disabled successfully`
    });
}));
// Unload plugin
router.delete('/:name', (0, error_handler_1.asyncHandler)(async (req, res) => {
    await plugin_manager_1.pluginManager.unloadPlugin(req.params.name);
    res.json({
        message: `Plugin ${req.params.name} unloaded successfully`
    });
}));
// Get plugin details
router.get('/:name', (0, error_handler_1.asyncHandler)(async (req, res) => {
    const plugin = plugin_manager_1.pluginManager.getPlugin(req.params.name);
    if (!plugin) {
        return res.status(404).json({
            error: 'Plugin not found',
            name: req.params.name
        });
    }
    res.json({
        message: 'Plugin details retrieved successfully',
        plugin: {
            metadata: plugin.metadata,
            status: plugin.status,
            loadedAt: plugin.loadedAt,
            lastError: plugin.lastError
        }
    });
}));
exports.default = router;
//# sourceMappingURL=plugins.js.map