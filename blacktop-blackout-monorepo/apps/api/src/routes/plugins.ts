import { Router } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { pluginManager } from '../services/plugin-manager';

const router = Router();

// Get all loaded plugins
router.get('/', asyncHandler(async (req, res) => {
  const plugins = pluginManager.getLoadedPlugins();
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
router.post('/install', asyncHandler(async (req, res) => {
  const { source, version, trusted } = req.body;
  
  await pluginManager.installPlugin(source, { version, trusted });
  
  res.json({
    message: 'Plugin installed successfully',
    source,
    version
  });
}));

// Enable plugin
router.post('/:name/enable', asyncHandler(async (req, res) => {
  await pluginManager.enablePlugin(req.params.name);
  
  res.json({
    message: `Plugin ${req.params.name} enabled successfully`
  });
}));

// Disable plugin
router.post('/:name/disable', asyncHandler(async (req, res) => {
  await pluginManager.disablePlugin(req.params.name);
  
  res.json({
    message: `Plugin ${req.params.name} disabled successfully`
  });
}));

// Unload plugin
router.delete('/:name', asyncHandler(async (req, res) => {
  await pluginManager.unloadPlugin(req.params.name);
  
  res.json({
    message: `Plugin ${req.params.name} unloaded successfully`
  });
}));

// Get plugin details
router.get('/:name', asyncHandler(async (req, res) => {
  const plugin = pluginManager.getPlugin(req.params.name);
  
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

export default router;