# User Onboarding Guide

Welcome to CAR4GE! This guide will help you get started with our garage management platform.

## Table of Contents

1. [Creating Your Account](#creating-your-account)
2. [Setting Up Your First Garage](#setting-up-your-first-garage)
3. [Adding Your Vehicles](#adding-your-vehicles)
4. [Managing Maintenance](#managing-maintenance)
5. [Dashboard Overview](#dashboard-overview)
6. [Team Management](#team-management)
7. [API Integration (Optional)](#api-integration-optional)

---

## Creating Your Account

### Step 1: Sign Up

1. Visit [car4ge.com](https://car4ge.com)
2. Click the **"Sign Up"** button
3. Enter your email address and create a secure password
4. Click **"Create Account"**

### Step 2: Verify Your Email

1. Check your email inbox for a verification message
2. Click the **"Verify Email"** link
3. You're now ready to set up your garage!

### Step 3: Complete Your Profile

1. After verification, you'll be prompted to fill in your profile
2. Enter your full name
3. (Optional) Add a profile photo
4. Click **"Save Profile"**

---

## Setting Up Your First Garage

### What is a Garage?

A garage is your workspace in CAR4GE. You can manage one or multiple garages, including:
- Fleet information
- Vehicle records
- Maintenance schedules
- Team members

### Creating a Garage

1. From your dashboard, click **"Create New Garage"** or **"+ Add Garage"**
2. Fill in the garage details:
   - **Garage Name** - e.g., "Downtown Service Center"
   - **Location** - Full address
   - **Phone Number** - Contact number
   - **Email** - Support email
3. Click **"Create Garage"**

### Garage Settings

Once created, you can edit garage settings by:
1. Opening the garage
2. Clicking **Settings** (gear icon)
3. Updating information as needed
4. Click **"Save Changes"**

---

## Adding Your Vehicles

### Add Individual Vehicle

1. Go to your garage dashboard
2. Click the **"Vehicles"** tab
3. Click **"+ Add Vehicle"**
4. Fill in the vehicle information:
   - **Make** - e.g., "Toyota"
   - **Model** - e.g., "Camry"
   - **Year** - e.g., "2020"
   - **License Plate** - e.g., "ABC123"
   - **VIN (Optional)** - Vehicle Identification Number
   - **Current Mileage (Optional)**
5. Click **"Add Vehicle"**

### Bulk Import Vehicles

If you have many vehicles, you can import them in bulk:

1. Click **"Vehicles"** → **"Import Vehicles"**
2. Download the CSV template
3. Fill in your vehicle data using the template
4. Upload the CSV file
5. Click **"Import"**

**CSV Template Format:**
```
make,model,year,license_plate,vin,mileage
Toyota,Camry,2020,ABC123,4T1BF1AK5CU123456,45000
Honda,Civic,2019,XYZ789,2HGCV52606H123456,62000
```

### Vehicle Details

Each vehicle shows:
- **Make & Model**
- **License Plate**
- **VIN**
- **Current Mileage**
- **Last Service Date**
- **Maintenance History**

---

## Managing Maintenance

### Schedule Maintenance

1. Click on a vehicle from your fleet
2. Click **"+ Schedule Service"** or **"Maintenance"** tab
3. Select service type:
   - Oil Change
   - Tire Rotation
   - Inspection
   - Repair
   - Custom
4. Fill in details:
   - **Service Type** - What service needed
   - **Description** - Details about the work
   - **Scheduled Date** - When to perform service
   - **Estimated Cost** - Budget amount
   - **Notes** - Additional information
5. Click **"Schedule"**

### Track Service Progress

Each service shows status:
- **Pending** ⏳ - Scheduled, not started
- **In Progress** 🔧 - Currently being serviced
- **Completed** ✓ - Service finished
- **Cancelled** ❌ - Service cancelled

To update status:
1. Click on the service record
2. Click the status dropdown
3. Select new status
4. If completed, enter actual cost
5. Click **"Update"**

### View Maintenance History

All maintenance records are stored and searchable:
1. Go to **Maintenance** section
2. Filter by:
   - Vehicle
   - Status
   - Date range
   - Service type
3. Click any record to view full details

---

## Dashboard Overview

### Main Dashboard Features

**Quick Stats:**
- Total vehicles in fleet
- Pending services due
- Completed services today
- Total maintenance cost

**Recent Activity:**
- Latest service completions
- Upcoming services
- New vehicles added

**Quick Actions:**
- Add new vehicle
- Schedule maintenance
- View maintenance history

### Navigation Menu

- **🚗 Vehicles** - Manage your fleet
- **🔧 Maintenance** - Service history and scheduling
- **🏢 Garages** - Manage multiple locations
- **👥 Team** - Add team members
- **📊 Reports** - Analytics and statistics
- **⚙️ Settings** - Account and garage settings
- **🔔 Notifications** - Service alerts and reminders

---

## Team Management

### Invite Team Members

1. Go to **Settings** → **Team**
2. Click **"Invite Member"**
3. Enter their email address
4. Select their role:
   - **Manager** - Full access, can invite others
   - **Technician** - Can create and update services
   - **Viewer** - Read-only access
5. Click **"Send Invite"**

### Team Member Roles

| Role | Can View | Can Create | Can Edit | Can Delete | Can Manage Team |
|------|----------|-----------|---------|-----------|-----------------|
| Manager | ✓ | ✓ | ✓ | ✓ | ✓ |
| Technician | ✓ | ✓ | ✓ | ✗ | ✗ |
| Viewer | ✓ | ✗ | ✗ | ✗ | ✗ |

### Manage Team Members

1. Go to **Settings** → **Team**
2. View all team members
3. To edit: Click the member → adjust role → **Save**
4. To remove: Click the trash icon → **Confirm**

---

## API Integration (Optional)

### For Developers

If you want to integrate CAR4GE with your own systems:

1. Go to **Settings** → **API Keys**
2. Click **"Generate New API Key"**
3. Name your key (e.g., "Mobile App")
4. Select permissions:
   - **Read** - Access vehicle and maintenance data
   - **Write** - Create and update records
   - **Delete** - Remove records
5. Click **"Create"**
6. Copy and save your key securely

### Using Your API Key

Use your API key to access the CAR4GE API:

```bash
curl https://api.car4ge.com/v1/vehicles \
  -H "Authorization: Bearer YOUR_API_KEY"
```

See the [Developer Guide](../guides/DEVELOPER_GUIDE.md) for complete instructions.

---

## Common Tasks

### Change Your Password

1. Go to **Settings** → **Account**
2. Click **"Change Password"**
3. Enter current password
4. Enter new password (twice)
5. Click **"Update"**

### Update Account Info

1. Go to **Settings** → **Account**
2. Edit your name or email
3. Click **"Save"**

### Export Data

1. Go to **Settings** → **Export**
2. Select what to export:
   - All vehicles
   - Maintenance records
   - Reports
3. Choose format: CSV or PDF
4. Click **"Export"**

### Notifications & Reminders

1. Go to **Settings** → **Notifications**
2. Enable notifications for:
   - Upcoming services
   - Maintenance completed
   - Team invitations
   - System updates
3. Choose notification method:
   - Email
   - In-app
   - Both
4. Click **"Save"**

---

## Tips & Best Practices

### 1. Regular Updates
Keep vehicle mileage updated. Enter current mileage when adding maintenance records.

### 2. Service Reminders
CAR4GE tracks service intervals and sends reminders before services are due.

### 3. Documentation
Add notes and photos to maintenance records for complete service history.

### 4. Team Collaboration
Invite your team members to keep everyone updated on vehicle status.

### 5. Backup Data
Regularly export your data as backup. Go to Settings → Export.

### 6. Security
- Never share your API keys
- Use strong passwords
- Enable two-factor authentication (Settings → Security)

---

## Troubleshooting

### "I forgot my password"
1. Go to the login page
2. Click **"Forgot Password?"**
3. Enter your email
4. Check your email for reset link
5. Follow the link to create a new password

### "Team member didn't receive invite"
1. Check that you entered the correct email
2. Have them check spam/junk folder
3. Resend the invite from Settings → Team

### "Vehicle not showing in list"
1. Refresh the page
2. Check that you're viewing the correct garage
3. Check vehicle filters are not hiding it

### "Can't edit maintenance record"
1. Check your team role has edit permissions
2. Completed services cannot be edited (create new record instead)

### "API request not working"
1. Verify API key is correct
2. Check authorization header format: `Authorization: Bearer KEY`
3. Verify endpoint is spelled correctly
4. See [Developer Guide](../guides/DEVELOPER_GUIDE.md) for more help

---

## Getting Help

### Contact Support

- **Email**: support@car4ge.com
- **Live Chat**: Available in the app (click the chat icon)
- **Help Center**: [help.car4ge.com](https://help.car4ge.com)

### Community Forum

Join our community at [forum.car4ge.com](https://forum.car4ge.com) to:
- Ask questions
- Share best practices
- Connect with other garage owners

### Status & Updates

Check system status and follow updates:
- **Status Page**: [status.car4ge.com](https://status.car4ge.com)
- **Blog**: [car4ge.com/blog](https://car4ge.com/blog)

---

## Next Steps

Now that you're set up, you can:

1. ✅ Add more vehicles to your fleet
2. ✅ Invite your team members
3. ✅ Schedule regular maintenance
4. ✅ (Optional) Set up API integration for custom integrations
5. ✅ Enable notifications for service reminders

Welcome to the CAR4GE family! 🚗
