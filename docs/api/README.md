# Blacktop Blackout API Documentation

## Overview

The Blacktop Blackout API is a RESTful service built with Node.js, Express, and TypeScript that provides comprehensive backend functionality for asphalt maintenance and sealcoating management operations.

## Base URL

- **Development**: `http://localhost:3333`
- **Production**: `https://your-domain.com/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **Admin**: Full system access
- **Manager**: Project and team management
- **Operator**: Field operations and data entry

## API Endpoints

### Authentication

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@blacktopsolutions.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@blacktopsolutions.com",
    "name": "System Administrator",
    "role": "admin",
    "companyId": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

#### POST /auth/refresh
Refresh an expired token.

#### POST /auth/logout
Logout and invalidate token.

### Users

#### GET /users
Get all users (Admin/Manager only).

#### POST /users
Create a new user (Admin only).

#### GET /users/:id
Get user by ID.

#### PUT /users/:id
Update user information.

#### DELETE /users/:id
Delete user (Admin only).

### Projects

#### GET /projects
Get all projects for the authenticated user's company.

**Query Parameters:**
- `status`: Filter by project status (pending, active, completed, cancelled)
- `limit`: Number of results per page (default: 10)
- `offset`: Pagination offset (default: 0)

#### POST /projects
Create a new project.

**Request Body:**
```json
{
  "name": "Parking Lot Sealcoating",
  "description": "Annual sealcoating for shopping center",
  "clientName": "ABC Shopping Center",
  "clientAddress": "123 Main St, City, State",
  "estimatedCost": 5000.00,
  "scheduledDate": "2024-08-15T09:00:00Z",
  "coordinates": {
    "lat": 36.123456,
    "lng": -80.654321
  }
}
```

#### GET /projects/:id
Get project details by ID.

#### PUT /projects/:id
Update project information.

#### DELETE /projects/:id
Delete project (Admin/Manager only).

### Pavement Scans

#### GET /scans
Get all pavement scans.

#### POST /scans
Upload a new pavement scan.

**Request Body (multipart/form-data):**
- `projectId`: UUID of the associated project
- `scanFile`: 3D scan file (PLY, OBJ, or custom format)
- `images[]`: Associated photos
- `notes`: Optional scan notes

#### GET /scans/:id
Get scan details and analysis results.

#### PUT /scans/:id
Update scan information.

#### DELETE /scans/:id
Delete scan and associated files.

### Cost Estimation

#### POST /estimates/calculate
Calculate project cost estimate using AI.

**Request Body:**
```json
{
  "projectType": "sealcoating",
  "area": 5000,
  "areaUnit": "sqft",
  "surface": {
    "condition": "good",
    "age": 5,
    "crackDensity": "low"
  },
  "materials": [
    {
      "type": "PMM_SEALCOAT",
      "quantity": 50,
      "unit": "gallon"
    }
  ],
  "labor": {
    "hours": 16,
    "workers": 2
  }
}
```

**Response:**
```json
{
  "estimateId": "uuid",
  "totalCost": 4850.00,
  "breakdown": {
    "materials": 1900.00,
    "labor": 1600.00,
    "equipment": 800.00,
    "overhead": 550.00
  },
  "confidence": 0.94,
  "recommendedMargin": 0.25
}
```

### Weather Intelligence

#### GET /weather/current
Get current weather conditions for a location.

**Query Parameters:**
- `lat`: Latitude
- `lng`: Longitude

#### GET /weather/forecast
Get weather forecast for optimal work scheduling.

#### GET /weather/suitability
Get sealcoating suitability analysis based on weather conditions.

### Inventory

#### GET /inventory
Get current inventory levels.

#### POST /inventory
Add inventory item.

#### PUT /inventory/:id
Update inventory item.

#### GET /inventory/usage
Get material usage analytics.

### Business Logic

#### GET /business-logic
Get current business rules and pricing models.

#### POST /business-logic/rules
Create or update business rules (Admin only).

#### GET /business-logic/materials
Get current material pricing.

### Plugins

#### GET /plugins
Get available plugins.

#### POST /plugins/install
Install a new plugin (Admin only).

#### PUT /plugins/:id/toggle
Enable/disable a plugin.

#### GET /plugins/:id/status
Get plugin status and health.

## Error Handling

The API uses standard HTTP status codes and returns errors in the following format:

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  }
}
```

### Common Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **409**: Conflict
- **422**: Validation Error
- **500**: Internal Server Error

## Rate Limiting

API requests are limited to:
- **Authenticated users**: 1000 requests per hour
- **Admin users**: 5000 requests per hour

## Data Formats

### Dates
All dates are in ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`

### Coordinates
Geographic coordinates use WGS84 decimal degrees:
```json
{
  "lat": 36.123456,
  "lng": -80.654321
}
```

### File Uploads
- **Maximum file size**: 10MB
- **Supported formats**: JPG, PNG, PDF, DXF, DWG, PLY, OBJ
- **Scan files**: Up to 100MB for 3D models

## WebSocket Events

Real-time updates are available via WebSocket connection at `/ws`.

### Events

- `scan_progress`: 3D scan processing updates
- `weather_alert`: Critical weather condition changes
- `project_update`: Project status changes
- `system_notification`: System-wide notifications

## SDK and Libraries

- **JavaScript/TypeScript**: `@blacktop/api-client`
- **Flutter/Dart**: `blacktop_api`
- **Python**: `blacktop-py`

## Support

For API support, contact:
- **Email**: api-support@blacktopsolutions.com
- **Documentation**: https://docs.blacktopsolutions.com
- **Status**: https://status.blacktopsolutions.com