# API Tutorials

Practical guides for common integration scenarios.

## Table of Contents

1. [Create a Garage and Add Vehicles](#create-a-garage-and-add-vehicles)
2. [Track Vehicle Maintenance](#track-vehicle-maintenance)
3. [Build a Vehicle Dashboard](#build-a-vehicle-dashboard)
4. [Bulk Import Vehicles](#bulk-import-vehicles)
5. [Sync Data Between Systems](#sync-data-between-systems)

---

## Create a Garage and Add Vehicles

This tutorial shows how to set up a new garage and add your first vehicles to the CAR4GE system.

### Step 1: Create a Garage

```bash
curl -X POST https://api.car4ge.com/v1/garages \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Service Center",
    "location": "123 Service St, Springfield, IL 62701",
    "phone": "+1-217-555-0100",
    "email": "service@example.com"
  }'
```

**Response:**
```json
{
  "data": {
    "id": "garage_xyz789",
    "name": "Main Service Center",
    "location": "123 Service St, Springfield, IL 62701",
    "phone": "+1-217-555-0100",
    "email": "service@example.com",
    "owner_id": "user_abc123",
    "created_at": "2026-03-05T10:30:00Z",
    "updated_at": "2026-03-05T10:30:00Z"
  }
}
```

Save the `garage_id` - you'll need it for subsequent requests.

### Step 2: Add Your First Vehicle

```bash
curl -X POST https://api.car4ge.com/v1/vehicles \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "garage_id": "garage_xyz789",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "license_plate": "ABC123",
    "vin": "4T1BF1AK5CU123456",
    "mileage": 45000
  }'
```

**Response:**
```json
{
  "data": {
    "id": "vehicle_m3n5k2",
    "garage_id": "garage_xyz789",
    "make": "Toyota",
    "model": "Camry",
    "year": 2020,
    "license_plate": "ABC123",
    "vin": "4T1BF1AK5CU123456",
    "mileage": 45000,
    "last_service_date": null,
    "created_at": "2026-03-05T10:30:00Z",
    "updated_at": "2026-03-05T10:30:00Z"
  }
}
```

### JavaScript Example

```javascript
async function setupGarageWithVehicles() {
  const apiKey = process.env.CAR4GE_API_KEY;
  const baseUrl = 'https://api.car4ge.com/v1';

  try {
    // Step 1: Create garage
    const garageResponse = await fetch(`${baseUrl}/garages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Main Service Center',
        location: '123 Service St, Springfield, IL 62701',
        phone: '+1-217-555-0100',
        email: 'service@example.com'
      })
    });

    const garageData = await garageResponse.json();
    const garageId = garageData.data.id;
    console.log(`✓ Created garage: ${garageId}`);

    // Step 2: Add vehicles
    const vehicles = [
      {
        garage_id: garageId,
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        license_plate: 'ABC123',
        vin: '4T1BF1AK5CU123456',
        mileage: 45000
      },
      {
        garage_id: garageId,
        make: 'Honda',
        model: 'Civic',
        year: 2019,
        license_plate: 'XYZ789',
        vin: '2HGCV52606H123456',
        mileage: 62000
      }
    ];

    for (const vehicle of vehicles) {
      const vehicleResponse = await fetch(`${baseUrl}/vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(vehicle)
      });

      const vehicleData = await vehicleResponse.json();
      console.log(`✓ Added vehicle: ${vehicleData.data.make} ${vehicleData.data.model}`);
    }

    return { garageId, vehicleCount: vehicles.length };
  } catch (error) {
    console.error('Error setting up garage:', error);
    throw error;
  }
}

// Run setup
setupGarageWithVehicles();
```

---

## Track Vehicle Maintenance

Learn how to create, update, and track maintenance records for your fleet.

### Create a Maintenance Record

```bash
curl -X POST https://api.car4ge.com/v1/maintenance \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_id": "vehicle_m3n5k2",
    "garage_id": "garage_xyz789",
    "service_type": "Oil Change",
    "description": "Regular oil change and filter replacement",
    "status": "pending",
    "service_date": "2026-03-10T14:00:00Z",
    "cost": 75.00,
    "notes": "Use synthetic 5W-30 oil"
  }'
```

### Update Maintenance Status

```bash
curl -X PUT https://api.car4ge.com/v1/maintenance/maintenance_456 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

### Mark as Completed

```bash
curl -X PUT https://api.car4ge.com/v1/maintenance/maintenance_456 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "cost": 85.50
  }'
```

### Maintenance Tracking Example (JavaScript)

```javascript
class MaintenanceTracker {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.car4ge.com/v1';
  }

  async scheduleMaintenance(vehicleId, garageId, service) {
    const response = await fetch(`${this.baseUrl}/maintenance`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        vehicle_id: vehicleId,
        garage_id: garageId,
        service_type: service.type,
        description: service.description,
        status: 'pending',
        service_date: service.date,
        cost: service.estimatedCost,
        notes: service.notes
      })
    });

    const data = await response.json();
    return data.data;
  }

  async updateStatus(maintenanceId, newStatus) {
    const response = await fetch(
      `${this.baseUrl}/maintenance/${maintenanceId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      }
    );

    return await response.json();
  }

  async completeService(maintenanceId, actualCost) {
    return this.updateStatus(maintenanceId, 'completed');
  }

  async getVehicleHistory(vehicleId) {
    const response = await fetch(
      `${this.baseUrl}/maintenance?vehicle_id=${vehicleId}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );

    const data = await response.json();
    return data.data;
  }
}

// Usage
const tracker = new MaintenanceTracker(process.env.CAR4GE_API_KEY);

// Schedule oil change
const maintenance = await tracker.scheduleMaintenance(
  'vehicle_m3n5k2',
  'garage_xyz789',
  {
    type: 'Oil Change',
    description: 'Regular oil change',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedCost: 75.00,
    notes: 'Synthetic oil'
  }
);

console.log(`Scheduled maintenance: ${maintenance.id}`);

// Mark as in progress
await tracker.updateStatus(maintenance.id, 'in_progress');

// Complete service
await tracker.completeService(maintenance.id, 85.50);

// Get vehicle history
const history = await tracker.getVehicleHistory('vehicle_m3n5k2');
console.log(`Service history:`, history);
```

---

## Build a Vehicle Dashboard

Create a real-time dashboard showing your fleet status.

```javascript
class FleetDashboard {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.car4ge.com/v1';
    this.vehicles = [];
    this.maintenance = [];
  }

  async loadFleetData(garageId) {
    // Fetch all vehicles
    const vehiclesResponse = await fetch(
      `${this.baseUrl}/vehicles?garage_id=${garageId}&limit=100`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    this.vehicles = (await vehiclesResponse.json()).data;

    // Fetch pending maintenance
    const maintenanceResponse = await fetch(
      `${this.baseUrl}/maintenance?status=pending&limit=100`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    this.maintenance = (await maintenanceResponse.json()).data;

    return {
      totalVehicles: this.vehicles.length,
      pendingMaintenance: this.maintenance.length
    };
  }

  getSummary() {
    return {
      totalVehicles: this.vehicles.length,
      totalMaintenance: this.maintenance.length,
      vehicles: this.vehicles.map(v => ({
        id: v.id,
        name: `${v.year} ${v.make} ${v.model}`,
        plate: v.license_plate,
        mileage: v.mileage
      })),
      upcomingServices: this.maintenance
        .filter(m => m.status !== 'completed')
        .map(m => ({
          id: m.id,
          type: m.service_type,
          daysUntil: Math.ceil((new Date(m.service_date) - new Date()) / (24 * 60 * 60 * 1000)),
          cost: m.cost
        }))
        .sort((a, b) => a.daysUntil - b.daysUntil)
    };
  }
}

// HTML Template
function renderDashboard(dashboard) {
  const summary = dashboard.getSummary();

  return `
    <div class="dashboard">
      <h1>Fleet Dashboard</h1>
      
      <div class="cards">
        <div class="card">
          <h3>Total Vehicles</h3>
          <p class="big">${summary.totalVehicles}</p>
        </div>
        
        <div class="card">
          <h3>Pending Maintenance</h3>
          <p class="big">${summary.totalMaintenance}</p>
        </div>
      </div>

      <h2>Upcoming Services</h2>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Days</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          ${summary.upcomingServices.map(s => `
            <tr>
              <td>${s.type}</td>
              <td>${s.daysUntil}</td>
              <td>$${s.cost.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
```

---

## Bulk Import Vehicles

Import multiple vehicles at once from an external system.

```javascript
async function bulkImportVehicles(garageId, csvFile) {
  const apiKey = process.env.CAR4GE_API_KEY;
  const baseUrl = 'https://api.car4ge.com/v1';
  
  // Parse CSV
  const vehicles = parseCSV(csvFile);
  
  const results = {
    successful: [],
    failed: []
  };

  // Import with rate limiting
  const batchSize = 10;
  for (let i = 0; i < vehicles.length; i += batchSize) {
    const batch = vehicles.slice(i, i + batchSize);
    
    const promises = batch.map(vehicle =>
      fetch(`${baseUrl}/vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          garage_id: garageId,
          ...vehicle
        })
      })
    );

    const responses = await Promise.all(promises);

    for (let j = 0; j < responses.length; j++) {
      const response = responses[j];
      try {
        const data = await response.json();
        if (response.ok) {
          results.successful.push(data.data);
        } else {
          results.failed.push({
            vehicle: batch[j],
            error: data.error.message
          });
        }
      } catch (error) {
        results.failed.push({
          vehicle: batch[j],
          error: error.message
        });
      }
    }

    console.log(`Progress: ${Math.min(i + batchSize, vehicles.length)}/${vehicles.length}`);
  }

  return results;
}

// Usage
const results = await bulkImportVehicles('garage_xyz789', './vehicles.csv');
console.log(`Imported successfully: ${results.successful.length}`);
console.log(`Failed: ${results.failed.length}`);
```

---

## Sync Data Between Systems

Keep CAR4GE synchronized with your existing garage management system.

```javascript
class SyncManager {
  constructor(apiKey, localDatabase) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.car4ge.com/v1';
    this.localDb = localDatabase;
    this.lastSyncTime = null;
  }

  async syncVehicles(garageId) {
    // Get local vehicles
    const localVehicles = this.localDb.query('SELECT * FROM vehicles WHERE garage_id = ?', [garageId]);

    // Get remote vehicles
    const response = await fetch(
      `${this.baseUrl}/vehicles?garage_id=${garageId}`,
      {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      }
    );
    const remoteData = await response.json();
    const remoteVehicles = remoteData.data;

    // Find new vehicles (local only)
    const newVehicles = localVehicles.filter(
      local => !remoteVehicles.find(remote => remote.vin === local.vin)
    );

    // Upload new vehicles
    for (const vehicle of newVehicles) {
      await fetch(`${this.baseUrl}/vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          garage_id: garageId,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          license_plate: vehicle.license_plate,
          vin: vehicle.vin,
          mileage: vehicle.mileage
        })
      });
    }

    // Download remote updates
    for (const remoteVehicle of remoteVehicles) {
      const localVehicle = localVehicles.find(v => v.vin === remoteVehicle.vin);
      if (localVehicle && remoteVehicle.updated_at > localVehicle.updated_at) {
        this.localDb.update(
          'UPDATE vehicles SET ? WHERE id = ?',
          [remoteVehicle, localVehicle.id]
        );
      }
    }

    this.lastSyncTime = new Date();
    return { synced: newVehicles.length + remoteVehicles.length };
  }
}
```

---

## More Help

- [API Reference](../api/API_REFERENCE.md)
- [Developer Guide](../guides/DEVELOPER_GUIDE.md)
- Support: support@car4ge.com
