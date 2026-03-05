# Developer Guide

This guide helps developers integrate CAR4GE into their applications.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Making Your First Request](#making-your-first-request)
4. [Error Handling](#error-handling)
5. [Common Patterns](#common-patterns)
6. [Best Practices](#best-practices)

## Getting Started

### Prerequisites

- An active CAR4GE account
- An API key (generate from dashboard)
- Basic knowledge of REST APIs and your preferred programming language

### Installation

We provide SDKs for popular languages:

#### JavaScript/Node.js

```bash
npm install car4ge
```

```javascript
import { CarGage } from 'car4ge';

const client = new CarGage('YOUR_API_KEY');
```

#### Python

```bash
pip install car4ge
```

```python
from car4ge import CarGage

client = CarGage('YOUR_API_KEY')
```

#### cURL (No installation required)

```bash
curl https://api.car4ge.com/v1/vehicles \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Authentication

### API Key Authentication

All requests require an `Authorization` header with your API key:

```
Authorization: Bearer YOUR_API_KEY
```

### Getting Your API Key

1. **Sign In** to your CAR4GE dashboard
2. **Navigate** to Settings → API Keys
3. **Click** "Generate New API Key"
4. **Enter** a name for your key (e.g., "Mobile App", "Integration Server")
5. **Select** permissions (read, write, delete)
6. **Copy** and store securely

### Managing API Keys

**Key Rotation** (recommended):
- Generate a new key
- Update your application
- Delete the old key

**Revoking Keys**:
- Go to Settings → API Keys
- Click the trash icon next to the key
- Confirm deletion

**Permissions**:
- `read` - Access to list and get operations
- `write` - Create and update operations
- `delete` - Delete operations

## Making Your First Request

### Using JavaScript/Node.js

```javascript
const response = await fetch('https://api.car4ge.com/v1/vehicles', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### Using Python

```python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.car4ge.com/v1/vehicles',
    headers=headers
)

data = response.json()
print(data)
```

### Using cURL

```bash
curl https://api.car4ge.com/v1/vehicles \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

## Error Handling

### Understanding Error Responses

All errors follow a standard format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field",
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

### HTTP Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Success | Request succeeded |
| 201 | Created | Resource created successfully |
| 204 | No Content | Success, no response body |
| 400 | Bad Request | Fix request parameters |
| 401 | Unauthorized | Check API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 429 | Rate Limited | (Note: Free tier has no limits) |
| 500 | Server Error | Contact support |

### Error Handling Examples

**JavaScript/Node.js**:

```javascript
async function createVehicle(vehicleData) {
  try {
    const response = await fetch('https://api.car4ge.com/v1/vehicles', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(vehicleData)
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Handle specific errors
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 400) {
        const details = error.error.details.map(d => `${d.field}: ${d.message}`);
        throw new Error(`Validation errors: ${details.join(', ')}`);
      } else {
        throw new Error(error.error.message);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create vehicle:', error);
    throw error;
  }
}
```

**Python**:

```python
import requests
from requests.exceptions import RequestException

def create_vehicle(vehicle_data):
    try:
        response = requests.post(
            'https://api.car4ge.com/v1/vehicles',
            headers={
                'Authorization': 'Bearer YOUR_API_KEY',
                'Content-Type': 'application/json'
            },
            json=vehicle_data
        )
        
        if response.status_code == 401:
            raise Exception('Invalid API key')
        elif response.status_code == 400:
            error = response.json()
            details = [f"{d['field']}: {d['message']}" for d in error['error']['details']]
            raise Exception(f"Validation errors: {', '.join(details)}")
        elif not response.ok:
            error = response.json()
            raise Exception(error['error']['message'])
        
        return response.json()
    except RequestException as e:
        print(f'Failed to create vehicle: {e}')
        raise
```

## Common Patterns

### Listing with Pagination

```javascript
async function getAllVehicles(garageId) {
  const vehicles = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://api.car4ge.com/v1/vehicles?garage_id=${garageId}&limit=${limit}&offset=${offset}`,
      {
        headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
      }
    );

    const data = await response.json();
    vehicles.push(...data.data);

    if (data.data.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
  }

  return vehicles;
}
```

### Creating Resources in Batch

```javascript
async function createMultipleVehicles(vehicles) {
  const results = [];
  
  for (const vehicleData of vehicles) {
    try {
      const response = await fetch('https://api.car4ge.com/v1/vehicles', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicleData)
      });

      const data = await response.json();
      results.push({ success: true, data: data.data });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
  }

  return results;
}
```

### Polling for Updates

```javascript
async function pollMaintenance(maintenanceId, maxAttempts = 60) {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const response = await fetch(
      `https://api.car4ge.com/v1/maintenance/${maintenanceId}`,
      {
        headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
      }
    );

    const data = await response.json();

    if (data.data.status === 'completed') {
      return data.data;
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
  }

  throw new Error('Timeout waiting for maintenance to complete');
}
```

### Caching

```javascript
class CachedCarGageClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  async getVehicle(vehicleId) {
    const cacheKey = `vehicle_${vehicleId}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheDuration) {
        return cached.data;
      }
    }

    // Fetch from API
    const response = await fetch(
      `https://api.car4ge.com/v1/vehicles/${vehicleId}`,
      {
        headers: { 'Authorization': 'Bearer ' + this.apiKey }
      }
    );

    const data = await response.json();

    // Store in cache
    this.cache.set(cacheKey, {
      data: data.data,
      timestamp: Date.now()
    });

    return data.data;
  }

  clearCache() {
    this.cache.clear();
  }
}
```

## Best Practices

### 1. Environment Variables

Never hardcode API keys. Use environment variables:

```javascript
// ✅ Good
const apiKey = process.env.CAR4GE_API_KEY;

// ❌ Bad
const apiKey = 'sk_live_abc123...';
```

### 2. Timeouts

Always set request timeouts to prevent hanging:

```javascript
// JavaScript with timeout
const timeout = (ms) => new Promise((_, reject) =>
  setTimeout(() => reject(new Error('Timeout')), ms)
);

const response = await Promise.race([
  fetch('https://api.car4ge.com/v1/vehicles', {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  }),
  timeout(5000) // 5 second timeout
]);
```

### 3. Retry Logic

Implement exponential backoff for transient errors:

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  let delay = 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      if (response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response; // Don't retry client errors
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
}
```

### 4. Logging

Implement comprehensive logging for debugging:

```javascript
function logRequest(method, url, status, duration) {
  console.log(`[${new Date().toISOString()}] ${method} ${url} - ${status} (${duration}ms)`);
}

function logError(error, request_id) {
  console.error(`[ERROR] Request ${request_id}: ${error.message}`);
}
```

### 5. Rate Limit Handling

Though the free tier has no rate limits, prepare for future changes:

```javascript
async function handleRateLimit(response) {
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After') || 60;
    console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    
    await new Promise(resolve => 
      setTimeout(resolve, retryAfter * 1000)
    );
    
    return fetch(response.url, response);
  }
  return response;
}
```

### 6. Type Safety (TypeScript)

```typescript
interface Vehicle {
  id: string;
  garage_id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
}

interface ApiResponse<T> {
  data: T;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
  };
}

async function getVehicles(): Promise<Vehicle[]> {
  const response = await fetch('https://api.car4ge.com/v1/vehicles', {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  });

  const data: ApiResponse<Vehicle[]> = await response.json();
  return data.data;
}
```

## More Resources

- [API Reference](./API_REFERENCE.md)
- [Tutorials](../tutorials/)
- [OpenAPI Specification](./openapi.yaml)
- [Support](https://support.car4ge.com)
