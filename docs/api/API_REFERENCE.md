# CAR4GE API Reference

Welcome to the CAR4GE API documentation. The CAR4GE API allows you to integrate your garage management system with our unified database infrastructure.

## Base URL

```
https://api.car4ge.com/v1
```

For development/testing:
```
http://localhost:3000/v1
```

## Authentication

All API requests require authentication using an API Key. Include your API key in the `Authorization` header with the `Bearer` scheme:

```bash
curl https://api.car4ge.com/v1/vehicles \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Getting Your API Key

1. Log in to your CAR4GE dashboard
2. Go to Settings → API Keys
3. Click "Generate New API Key"
4. Save your key securely (you won't see it again)

## Rate Limiting

The free tier includes:
- **Unlimited API requests** - No rate limiting
- **Real-time data sync** - Changes propagate instantly
- **99.9% uptime SLA** - Enterprise-grade reliability

## Response Format

All responses are in JSON format.

### Success Response (2xx)

```json
{
  "data": {
    "id": "vehicle_123",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020
  },
  "meta": {
    "timestamp": "2026-03-05T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

### Error Response (4xx, 5xx)

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: garage_id",
    "details": [
      {
        "field": "garage_id",
        "message": "This field is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-03-05T10:30:00Z",
    "request_id": "req_abc123"
  }
}
```

## Pagination

List endpoints support pagination:

```bash
curl https://api.car4ge.com/v1/vehicles?limit=20&offset=0 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "limit": 20,
    "offset": 0,
    "pages": 8
  }
}
```

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Invalid or missing API key |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| INVALID_REQUEST | 400 | Invalid request parameters |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Rate limit exceeded |
| SERVER_ERROR | 500 | Internal server error |

## Vehicles Endpoints

### List Vehicles

```http
GET /vehicles
```

Query Parameters:
- `garage_id` (string, optional) - Filter by garage
- `limit` (integer, optional, default: 20) - Results per page
- `offset` (integer, optional, default: 0) - Pagination offset

Example:
```bash
curl "https://api.car4ge.com/v1/vehicles?garage_id=garage_123&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response:
```json
{
  "data": [
    {
      "id": "vehicle_123",
      "garage_id": "garage_123",
      "make": "Toyota",
      "model": "Camry",
      "year": 2020,
      "license_plate": "ABC123",
      "vin": "JTDKN3AU1L3123456",
      "mileage": 45000,
      "last_service_date": "2026-02-15T10:00:00Z",
      "created_at": "2026-01-10T14:30:00Z",
      "updated_at": "2026-02-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 10,
    "offset": 0
  }
}
```

### Create Vehicle

```http
POST /vehicles
Content-Type: application/json
```

Request Body:
```json
{
  "garage_id": "garage_123",
  "make": "Toyota",
  "model": "Camry",
  "year": 2020,
  "license_plate": "ABC123",
  "vin": "JTDKN3AU1L3123456",
  "mileage": 45000
}
```

Response (201 Created):
```json
{
  "data": {
    "id": "vehicle_123",
    "garage_id": "garage_123",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "license_plate": "ABC123",
    "vin": "JTDKN3AU1L3123456",
    "mileage": 45000,
    "last_service_date": null,
    "created_at": "2026-03-05T10:30:00Z",
    "updated_at": "2026-03-05T10:30:00Z"
  }
}
```

### Get Vehicle

```http
GET /vehicles/:id
```

Example:
```bash
curl https://api.car4ge.com/v1/vehicles/vehicle_123 \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Update Vehicle

```http
PUT /vehicles/:id
Content-Type: application/json
```

Request Body (any field):
```json
{
  "mileage": 50000,
  "last_service_date": "2026-03-05T10:00:00Z"
}
```

### Delete Vehicle

```http
DELETE /vehicles/:id
```

Response (204 No Content):
```
(empty body)
```

## Maintenance Endpoints

### List Maintenance Records

```http
GET /maintenance
```

Query Parameters:
- `vehicle_id` (string, optional) - Filter by vehicle
- `status` (string, optional) - `pending`, `in_progress`, `completed`, `cancelled`
- `limit` (integer, optional, default: 20)
- `offset` (integer, optional, default: 0)

Example:
```bash
curl "https://api.car4ge.com/v1/maintenance?vehicle_id=vehicle_123&status=pending" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Create Maintenance Record

```http
POST /maintenance
Content-Type: application/json
```

Request Body:
```json
{
  "vehicle_id": "vehicle_123",
  "garage_id": "garage_123",
  "service_type": "Oil Change",
  "description": "Regular oil change and filter replacement",
  "status": "pending",
  "service_date": "2026-03-10T10:00:00Z",
  "cost": 75.00,
  "notes": "Use synthetic oil, 5W-30"
}
```

Response (201 Created):
```json
{
  "data": {
    "id": "maintenance_456",
    "vehicle_id": "vehicle_123",
    "garage_id": "garage_123",
    "service_type": "Oil Change",
    "description": "Regular oil change and filter replacement",
    "status": "pending",
    "service_date": "2026-03-10T10:00:00Z",
    "cost": 75.00,
    "notes": "Use synthetic oil, 5W-30",
    "created_at": "2026-03-05T10:30:00Z",
    "updated_at": "2026-03-05T10:30:00Z"
  }
}
```

### Update Maintenance Record

```http
PUT /maintenance/:id
Content-Type: application/json
```

Example - Mark as completed:
```json
{
  "status": "completed",
  "cost": 85.50
}
```

### Get Maintenance Record

```http
GET /maintenance/:id
```

## Garages Endpoints

### List Garages

```http
GET /garages
```

Returns all garages you have access to.

### Create Garage

```http
POST /garages
Content-Type: application/json
```

Request Body:
```json
{
  "name": "Mike's Auto Repair",
  "location": "123 Main St, Springfield, IL",
  "phone": "+1-217-555-0123",
  "email": "contact@mikesauto.com"
}
```

### Update Garage

```http
PUT /garages/:id
Content-Type: application/json
```

### Delete Garage

```http
DELETE /garages/:id
```

## Webhooks (Coming Soon)

Subscribe to real-time events:

```http
POST /webhooks
Content-Type: application/json
```

Request Body:
```json
{
  "url": "https://yourapp.com/webhooks/car4ge",
  "events": [
    "vehicle.created",
    "vehicle.updated",
    "maintenance.completed"
  ]
}
```

Events:
- `vehicle.created` - New vehicle added
- `vehicle.updated` - Vehicle information changed
- `vehicle.deleted` - Vehicle removed
- `maintenance.created` - New maintenance record
- `maintenance.updated` - Maintenance status changed
- `maintenance.completed` - Maintenance marked as completed

## Best Practices

### 1. Secure Your API Key
- Never commit API keys to version control
- Use environment variables
- Rotate keys regularly

### 2. Error Handling
Always handle error responses gracefully:

```javascript
const response = await fetch('https://api.car4ge.com/v1/vehicles', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});

if (!response.ok) {
  const error = await response.json();
  console.error('API Error:', error.error.message);
  // Handle error appropriately
}

const data = await response.json();
```

### 3. Pagination
For large datasets, always use pagination:

```bash
# Bad - Could timeout with large datasets
curl https://api.car4ge.com/v1/vehicles

# Good - Paginated requests
curl https://api.car4ge.com/v1/vehicles?limit=100&offset=0
curl https://api.car4ge.com/v1/vehicles?limit=100&offset=100
```

### 4. Idempotency
Include an `Idempotency-Key` header for create operations to ensure duplicate requests don't create duplicate records:

```bash
curl -X POST https://api.car4ge.com/v1/vehicles \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Idempotency-Key: unique-key-12345" \
  -d '{...}'
```

## Support

- **Documentation**: https://docs.car4ge.com
- **API Status**: https://status.car4ge.com
- **Email Support**: support@car4ge.com
- **Community Forum**: https://forum.car4ge.com
