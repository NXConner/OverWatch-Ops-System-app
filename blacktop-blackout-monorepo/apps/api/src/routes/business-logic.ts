import { Router } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { pool } from '../config/database';

const router = Router();

// Get all business rules
router.get('/rules', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { category, active } = req.query;
    
    let query = `
      SELECT 
        id, name, category, type, value, description, 
        is_active, last_modified, modified_by, dependencies, version
      FROM business_rules
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    if (category && category !== 'all') {
      query += ' AND category = $' + (params.length + 1);
      params.push(category);
    }
    
    if (active !== undefined) {
      query += ' AND is_active = $' + (params.length + 1);
      params.push(active === 'true');
    }
    
    query += ' ORDER BY category, name';
    
    const result = await client.query(query, params);
    
    const rules = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      type: row.type,
      value: typeof row.value === 'string' ? 
        (row.value.startsWith('{') || row.value.startsWith('[') ? 
          JSON.parse(row.value) : row.value) : row.value,
      description: row.description,
      isActive: row.is_active,
      lastModified: row.last_modified,
      modifiedBy: row.modified_by,
      dependencies: row.dependencies ? JSON.parse(row.dependencies) : [],
      version: row.version
    }));
    
    res.json({
      success: true,
      data: rules
    });
    
  } finally {
    client.release();
  }
}));

// Create new business rule
router.post('/rules', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      name, category, type, value, description,
      isActive = true, dependencies = [], version = '1.0'
    } = req.body;
    
    const valueJson = typeof value === 'object' ? JSON.stringify(value) : value.toString();
    const dependenciesJson = JSON.stringify(dependencies);
    
    const result = await client.query(`
      INSERT INTO business_rules 
      (name, category, type, value, description, is_active, dependencies, version, created_at, last_modified, modified_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9)
      RETURNING id
    `, [name, category, type, valueJson, description, isActive, dependenciesJson, version, 'API User']);
    
    res.json({
      success: true,
      data: { id: result.rows[0].id }
    });
    
  } finally {
    client.release();
  }
}));

// Update business rule
router.put('/rules/:id', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const {
      name, category, type, value, description,
      isActive, dependencies, version
    } = req.body;
    
    const valueJson = typeof value === 'object' ? JSON.stringify(value) : value.toString();
    const dependenciesJson = JSON.stringify(dependencies || []);
    
    await client.query(`
      UPDATE business_rules 
      SET 
        name = $1, category = $2, type = $3, value = $4, 
        description = $5, is_active = $6, dependencies = $7, 
        version = $8, last_modified = NOW(), modified_by = $9
      WHERE id = $10
    `, [name, category, type, valueJson, description, isActive, dependenciesJson, version, 'API User', id]);
    
    res.json({
      success: true,
      message: 'Business rule updated successfully'
    });
    
  } finally {
    client.release();
  }
}));

// Delete business rule
router.delete('/rules/:id', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    await client.query('DELETE FROM business_rules WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Business rule deleted successfully'
    });
    
  } finally {
    client.release();
  }
}));

// Get all API configurations
router.get('/apis', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT 
        id, name, type, endpoint, api_key, headers, parameters,
        rate_limit, timeout, is_active, last_tested, test_status
      FROM api_configurations
      ORDER BY name
    `);
    
    const apis = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      endpoint: row.endpoint,
      apiKey: row.api_key,
      headers: row.headers ? JSON.parse(row.headers) : {},
      parameters: row.parameters ? JSON.parse(row.parameters) : {},
      rateLimit: row.rate_limit,
      timeout: row.timeout,
      isActive: row.is_active,
      lastTested: row.last_tested,
      testStatus: row.test_status
    }));
    
    res.json({
      success: true,
      data: apis
    });
    
  } finally {
    client.release();
  }
}));

// Create new API configuration
router.post('/apis', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      name, type, endpoint, apiKey, headers = {},
      parameters = {}, rateLimit, timeout, isActive = true
    } = req.body;
    
    const headersJson = JSON.stringify(headers);
    const parametersJson = JSON.stringify(parameters);
    
    const result = await client.query(`
      INSERT INTO api_configurations 
      (name, type, endpoint, api_key, headers, parameters, rate_limit, timeout, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING id
    `, [name, type, endpoint, apiKey, headersJson, parametersJson, rateLimit, timeout, isActive]);
    
    res.json({
      success: true,
      data: { id: result.rows[0].id }
    });
    
  } finally {
    client.release();
  }
}));

// Update API configuration
router.put('/apis/:id', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const {
      name, type, endpoint, apiKey, headers,
      parameters, rateLimit, timeout, isActive
    } = req.body;
    
    const headersJson = JSON.stringify(headers || {});
    const parametersJson = JSON.stringify(parameters || {});
    
    await client.query(`
      UPDATE api_configurations 
      SET 
        name = $1, type = $2, endpoint = $3, api_key = $4,
        headers = $5, parameters = $6, rate_limit = $7,
        timeout = $8, is_active = $9, updated_at = NOW()
      WHERE id = $10
    `, [name, type, endpoint, apiKey, headersJson, parametersJson, rateLimit, timeout, isActive, id]);
    
    res.json({
      success: true,
      message: 'API configuration updated successfully'
    });
    
  } finally {
    client.release();
  }
}));

// Test API configuration
router.post('/apis/:id/test', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    // Get API configuration
    const apiResult = await client.query(
      'SELECT * FROM api_configurations WHERE id = $1',
      [id]
    );
    
    if (apiResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'API configuration not found'
      });
    }
    
    const api = apiResult.rows[0];
    
    // Update test status to pending
    await client.query(
      'UPDATE api_configurations SET test_status = $1 WHERE id = $2',
      ['pending', id]
    );
    
    // Simulate API test (in real implementation, make actual HTTP request)
    const testSuccess = Math.random() > 0.3; // 70% success rate simulation
    
    // Update test results
    await client.query(
      'UPDATE api_configurations SET test_status = $1, last_tested = NOW() WHERE id = $2',
      [testSuccess ? 'success' : 'failed', id]
    );
    
    res.json({
      success: true,
      data: {
        testStatus: testSuccess ? 'success' : 'failed',
        message: testSuccess ? 'API test successful' : 'API test failed - check configuration'
      }
    });
    
  } finally {
    client.release();
  }
}));

// Delete API configuration
router.delete('/apis/:id', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    
    await client.query('DELETE FROM api_configurations WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'API configuration deleted successfully'
    });
    
  } finally {
    client.release();
  }
}));

// Export business logic (backup)
router.get('/export', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const [rulesResult, apisResult] = await Promise.all([
      client.query('SELECT * FROM business_rules ORDER BY category, name'),
      client.query('SELECT * FROM api_configurations ORDER BY name')
    ]);
    
    const exportData = {
      businessRules: rulesResult.rows.map(row => ({
        name: row.name,
        category: row.category,
        type: row.type,
        value: typeof row.value === 'string' && 
               (row.value.startsWith('{') || row.value.startsWith('[')) ?
               JSON.parse(row.value) : row.value,
        description: row.description,
        isActive: row.is_active,
        dependencies: row.dependencies ? JSON.parse(row.dependencies) : [],
        version: row.version
      })),
      apiConfigurations: apisResult.rows.map(row => ({
        name: row.name,
        type: row.type,
        endpoint: row.endpoint,
        headers: row.headers ? JSON.parse(row.headers) : {},
        parameters: row.parameters ? JSON.parse(row.parameters) : {},
        rateLimit: row.rate_limit,
        timeout: row.timeout,
        isActive: row.is_active
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    res.json({
      success: true,
      data: exportData
    });
    
  } finally {
    client.release();
  }
}));

// Import business logic
router.post('/import', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { businessRules = [], apiConfigurations = [] } = req.body;
    
    let importedRules = 0;
    let importedApis = 0;
    
    // Import business rules
    for (const rule of businessRules) {
      const valueJson = typeof rule.value === 'object' ? 
        JSON.stringify(rule.value) : rule.value.toString();
      const dependenciesJson = JSON.stringify(rule.dependencies || []);
      
      await client.query(`
        INSERT INTO business_rules 
        (name, category, type, value, description, is_active, dependencies, version, created_at, last_modified, modified_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), $9)
        ON CONFLICT (name) DO UPDATE SET
          category = EXCLUDED.category,
          type = EXCLUDED.type,
          value = EXCLUDED.value,
          description = EXCLUDED.description,
          is_active = EXCLUDED.is_active,
          dependencies = EXCLUDED.dependencies,
          version = EXCLUDED.version,
          last_modified = NOW(),
          modified_by = EXCLUDED.modified_by
      `, [
        rule.name, rule.category, rule.type, valueJson, rule.description,
        rule.isActive, dependenciesJson, rule.version || '1.0', 'Import'
      ]);
      
      importedRules++;
    }
    
    // Import API configurations
    for (const api of apiConfigurations) {
      const headersJson = JSON.stringify(api.headers || {});
      const parametersJson = JSON.stringify(api.parameters || {});
      
      await client.query(`
        INSERT INTO api_configurations 
        (name, type, endpoint, api_key, headers, parameters, rate_limit, timeout, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        ON CONFLICT (name) DO UPDATE SET
          type = EXCLUDED.type,
          endpoint = EXCLUDED.endpoint,
          headers = EXCLUDED.headers,
          parameters = EXCLUDED.parameters,
          rate_limit = EXCLUDED.rate_limit,
          timeout = EXCLUDED.timeout,
          is_active = EXCLUDED.is_active,
          updated_at = NOW()
      `, [
        api.name, api.type, api.endpoint, api.apiKey || '',
        headersJson, parametersJson, api.rateLimit, api.timeout, api.isActive
      ]);
      
      importedApis++;
    }
    
    res.json({
      success: true,
      data: {
        importedRules,
        importedApis,
        message: `Successfully imported ${importedRules} rules and ${importedApis} API configurations`
      }
    });
    
  } finally {
    client.release();
  }
}));

export default router;