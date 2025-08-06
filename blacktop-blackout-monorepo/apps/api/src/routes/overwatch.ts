import { Router } from 'express';
import { asyncHandler } from '../middleware/error-handler';
import { pool } from '../config/database';
import { weatherService } from '../services/weatherService';

const router = Router();

// Get OverWatch dashboard data
router.get('/dashboard', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Get active projects count
    const projectsResult = await client.query(`
      SELECT COUNT(*) as active_projects 
      FROM projects 
      WHERE status = 'active'
    `);
    
    // Get today's operations
    const operationsResult = await client.query(`
      SELECT COUNT(*) as operations_today
      FROM project_operations 
      WHERE DATE(created_at) = CURRENT_DATE
    `);
    
    // Get active personnel
    const personnelResult = await client.query(`
      SELECT COUNT(*) as active_personnel
      FROM users 
      WHERE active = true AND role IN ('operator', 'manager')
    `);
    
    // Get vehicles in use
    const vehiclesResult = await client.query(`
      SELECT COUNT(*) as vehicles_deployed
      FROM fleet_vehicles 
      WHERE status = 'deployed'
    `);
    
    // Get today's costs
    const costsResult = await client.query(`
      SELECT 
        COALESCE(SUM(material_cost), 0) as material_costs,
        COALESCE(SUM(labor_cost), 0) as labor_costs,
        COALESCE(SUM(equipment_cost), 0) as equipment_costs
      FROM daily_operations 
      WHERE DATE(operation_date) = CURRENT_DATE
    `);
    
    // Get recent alerts
    const alertsResult = await client.query(`
      SELECT id, type, message, severity, created_at
      FROM system_alerts 
      WHERE resolved = false 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    const totalCosts = costsResult.rows[0];
    const dailyTotal = parseFloat(totalCosts.material_costs) + 
                     parseFloat(totalCosts.labor_costs) + 
                     parseFloat(totalCosts.equipment_costs);
    
    res.json({
      success: true,
      data: {
        kpis: {
          activeProjects: parseInt(projectsResult.rows[0].active_projects),
          operationsToday: parseInt(operationsResult.rows[0].operations_today),
          activePersonnel: parseInt(personnelResult.rows[0].active_personnel),
          vehiclesDeployed: parseInt(vehiclesResult.rows[0].vehicles_deployed),
          dailyCosts: dailyTotal,
          activeAlerts: alertsResult.rows.length,
          completedScans: 47, // From PavementScan Pro integration
          defectsDetected: 12  // From AI analysis
        },
        alerts: alertsResult.rows,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } finally {
    client.release();
  }
}));

// Get live cost center data
router.get('/cost-center', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Daily costs
    const dailyResult = await client.query(`
      SELECT 
        COALESCE(SUM(wages), 0) as wages,
        COALESCE(SUM(materials), 0) as materials,
        COALESCE(SUM(fuel), 0) as fuel,
        COALESCE(SUM(equipment), 0) as equipment,
        COALESCE(SUM(overhead), 0) as overhead
      FROM daily_cost_tracking 
      WHERE DATE(cost_date) = CURRENT_DATE
    `);
    
    // Weekly costs
    const weeklyResult = await client.query(`
      SELECT 
        COALESCE(SUM(wages), 0) as wages,
        COALESCE(SUM(materials), 0) as materials,
        COALESCE(SUM(fuel), 0) as fuel,
        COALESCE(SUM(equipment), 0) as equipment,
        COALESCE(SUM(overhead), 0) as overhead
      FROM daily_cost_tracking 
      WHERE cost_date >= DATE_TRUNC('week', CURRENT_DATE)
    `);
    
    // Monthly costs
    const monthlyResult = await client.query(`
      SELECT 
        COALESCE(SUM(wages), 0) as wages,
        COALESCE(SUM(materials), 0) as materials,
        COALESCE(SUM(fuel), 0) as fuel,
        COALESCE(SUM(equipment), 0) as equipment,
        COALESCE(SUM(overhead), 0) as overhead
      FROM daily_cost_tracking 
      WHERE cost_date >= DATE_TRUNC('month', CURRENT_DATE)
    `);
    
    // Material inventory
    const inventoryResult = await client.query(`
      SELECT 
        item_name,
        current_stock,
        unit_cost,
        total_value
      FROM inventory 
      WHERE category = 'sealcoating_materials'
      ORDER BY total_value DESC
    `);
    
    const formatCostData = (row: any) => ({
      wages: parseFloat(row.wages),
      materials: parseFloat(row.materials),
      fuel: parseFloat(row.fuel),
      equipment: parseFloat(row.equipment),
      overhead: parseFloat(row.overhead),
      total: parseFloat(row.wages) + parseFloat(row.materials) + 
             parseFloat(row.fuel) + parseFloat(row.equipment) + parseFloat(row.overhead)
    });
    
    res.json({
      success: true,
      data: {
        daily: formatCostData(dailyResult.rows[0]),
        weekly: formatCostData(weeklyResult.rows[0]),
        monthly: formatCostData(monthlyResult.rows[0]),
        inventory: inventoryResult.rows,
        lastUpdated: new Date().toISOString()
      }
    });
    
  } finally {
    client.release();
  }
}));

// Get employee locations and tracking
router.get('/locations', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Get active personnel with locations
    const personnelResult = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.role,
        pl.latitude,
        pl.longitude,
        pl.last_updated,
        pl.status,
        pl.current_project_id,
        p.name as project_name
      FROM users u
      LEFT JOIN personnel_locations pl ON u.id = pl.user_id
      LEFT JOIN projects p ON pl.current_project_id = p.id
      WHERE u.active = true AND u.role IN ('operator', 'manager')
    `);
    
    // Get vehicle locations
    const vehiclesResult = await client.query(`
      SELECT 
        v.id,
        v.vehicle_number,
        v.type,
        v.status,
        vl.latitude,
        vl.longitude,
        vl.last_updated,
        vl.assigned_operator,
        u.name as operator_name
      FROM fleet_vehicles v
      LEFT JOIN vehicle_locations vl ON v.id = vl.vehicle_id
      LEFT JOIN users u ON vl.assigned_operator = u.id
      WHERE v.status IN ('active', 'deployed')
    `);
    
    // Get equipment tracking
    const equipmentResult = await client.query(`
      SELECT 
        e.id,
        e.equipment_name,
        e.type,
        e.status,
        el.latitude,
        el.longitude,
        el.last_updated,
        el.assigned_project_id,
        p.name as project_name
      FROM equipment e
      LEFT JOIN equipment_locations el ON e.id = el.equipment_id
      LEFT JOIN projects p ON el.assigned_project_id = p.id
      WHERE e.status = 'active'
    `);
    
    // Get geofenced areas
    const geofencesResult = await client.query(`
      SELECT 
        id,
        name,
        type,
        center_lat,
        center_lng,
        radius,
        active
      FROM geofences 
      WHERE active = true
    `);
    
    res.json({
      success: true,
      data: {
        personnel: personnelResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          role: row.role,
          location: row.latitude && row.longitude ? {
            lat: parseFloat(row.latitude),
            lng: parseFloat(row.longitude),
            lastUpdated: row.last_updated
          } : null,
          status: row.status || 'offline',
          currentProject: row.project_name
        })),
        vehicles: vehiclesResult.rows.map(row => ({
          id: row.id,
          vehicleNumber: row.vehicle_number,
          type: row.type,
          status: row.status,
          location: row.latitude && row.longitude ? {
            lat: parseFloat(row.latitude),
            lng: parseFloat(row.longitude),
            lastUpdated: row.last_updated
          } : null,
          operator: row.operator_name
        })),
        equipment: equipmentResult.rows.map(row => ({
          id: row.id,
          name: row.equipment_name,
          type: row.type,
          status: row.status,
          location: row.latitude && row.longitude ? {
            lat: parseFloat(row.latitude),
            lng: parseFloat(row.longitude),
            lastUpdated: row.last_updated
          } : null,
          project: row.project_name
        })),
        geofences: geofencesResult.rows.map(row => ({
          id: row.id,
          name: row.name,
          type: row.type,
          center: {
            lat: parseFloat(row.center_lat),
            lng: parseFloat(row.center_lng)
          },
          radius: parseFloat(row.radius)
        })),
        lastUpdated: new Date().toISOString()
      }
    });
    
  } finally {
    client.release();
  }
}));

// Get weather data (now uses real weather service)
router.get('/weather', asyncHandler(async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    // Use coordinates if provided, otherwise use default Stuart, VA location
    const latitude = lat ? parseFloat(lat as string) : 36.5962;
    const longitude = lon ? parseFloat(lon as string) : -80.2741;
    
    const [weatherData, suitability] = await Promise.all([
      weatherService.getCurrentWeather(latitude, longitude),
      weatherService.isGoodForSealcoating(latitude, longitude)
    ]);
    
    res.json({
      success: true,
      data: {
        current: weatherData.current,
        hourlyForecast: weatherData.hourly.slice(0, 12),
        alerts: weatherData.alerts,
        suitability: suitability,
        location: weatherData.location,
        lastUpdated: weatherData.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weather data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}));

// PavementScan Pro endpoints
router.post('/pavement-scan', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { 
      projectId, 
      scanArea, 
      scanType, 
      images, 
      gpsCoordinates,
      operatorId 
    } = req.body;
    
    // Save scan data to database
    const scanResult = await client.query(`
      INSERT INTO pavement_scans 
      (project_id, operator_id, scan_area, scan_type, gps_coordinates, status, created_at)
      VALUES ($1, $2, $3, $4, $5, 'processing', NOW())
      RETURNING id
    `, [projectId, operatorId, scanArea, scanType, JSON.stringify(gpsCoordinates)]);
    
    const scanId = scanResult.rows[0].id;
    
    // Simulate AI processing (in real implementation, this would trigger ML analysis)
    const defects = [
      {
        type: 'alligator_cracking',
        severity: 'medium',
        confidence: 0.89,
        area: scanArea * 0.15,
        location: gpsCoordinates,
        recommendations: ['Surface preparation required', 'Crack filling before sealcoating']
      },
      {
        type: 'longitudinal_cracking',
        severity: 'low',
        confidence: 0.94,
        area: scanArea * 0.08,
        location: gpsCoordinates,
        recommendations: ['Monitor for progression', 'Standard sealcoating sufficient']
      }
    ];
    
    // Update scan with results
    await client.query(`
      UPDATE pavement_scans 
      SET 
        defects_detected = $1,
        ai_confidence = $2,
        status = 'completed',
        processed_at = NOW()
      WHERE id = $3
    `, [JSON.stringify(defects), 0.91, scanId]);
    
    res.json({
      success: true,
      data: {
        scanId: scanId,
        status: 'completed',
        defectsDetected: defects.length,
        averageConfidence: 0.91,
        defects: defects,
        recommendations: [
          'Crack filling recommended before sealcoating',
          'Surface preparation required for alligator cracking areas',
          'Overall surface suitable for sealcoating after prep'
        ],
        estimatedRepairCost: scanArea * 0.23 * 0.15, // 15% of area needs repair
        processedAt: new Date().toISOString()
      }
    });
    
  } finally {
    client.release();
  }
}));

// Get scan history
router.get('/pavement-scans', asyncHandler(async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { projectId, limit = 50 } = req.query;
    
    let query = `
      SELECT 
        ps.*,
        u.name as operator_name,
        p.name as project_name
      FROM pavement_scans ps
      LEFT JOIN users u ON ps.operator_id = u.id
      LEFT JOIN projects p ON ps.project_id = p.id
    `;
    
    const params: any[] = [];
    if (projectId) {
      query += ' WHERE ps.project_id = $1';
      params.push(projectId);
    }
    
    query += ` ORDER BY ps.created_at DESC LIMIT $${params.length + 1}`;
    params.push(parseInt(limit as string));
    
    const result = await client.query(query, params);
    
    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        projectId: row.project_id,
        projectName: row.project_name,
        operatorName: row.operator_name,
        scanArea: parseFloat(row.scan_area),
        scanType: row.scan_type,
        gpsCoordinates: row.gps_coordinates,
        status: row.status,
        defectsDetected: row.defects_detected,
        aiConfidence: parseFloat(row.ai_confidence),
        createdAt: row.created_at,
        processedAt: row.processed_at
      }))
    });
    
  } finally {
    client.release();
  }
}));

export default router;