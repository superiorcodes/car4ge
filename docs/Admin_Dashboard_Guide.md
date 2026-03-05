# Admin Dashboard Documentation

## Overview

The Admin Dashboard is a powerful management interface for system administrators. It provides comprehensive tools for user management, system analytics, and infrastructure health monitoring.

**Access Level**: Admin role only  
**Route**: `/admin`  
**Available to**: Users with `role = 'admin'` in the profiles table

---

## Features

### 1. User Management

#### View All Users
- List of all registered users in the system
- Display user information: name, email, role, join date
- Filter users by role (Admin, Manager, Technician, User)
- Count of total and filtered users displayed

#### User Actions
- **View Details**: Click any user to expand detailed information
- **Change Role**: Update user role to any of:
  - User (standard user access)
  - Technician (can manage vehicles and maintenance)
  - Manager (can manage garages and teams)
  - Admin (full system access)
- **Suspend/Activate**: Temporarily disable or re-enable user accounts
- **Delete User**: Permanently remove a user from the system (with confirmation)

#### User Information Displayed
- User ID (UUID)
- Email address
- Full name
- Current role
- Account creation date
- Active/Inactive status
- Role-specific badge with color coding

---

### 2. Analytics Overview

#### Key Metrics (Top Cards)
- **Total Users**: Count of all registered users
- **Active Users**: Number of currently active users
- **API Calls Today**: Daily API request volume tracking
- **Average Response Time**: System performance metric in milliseconds

#### Detailed Analytics
- **Total Maintenance Records**: Complete maintenance operation count
- **Active vs Total Users**: Ratio visualization and percentage
- **User Role Distribution**: Breakdown showing count of each role:
  - Admins
  - Managers
  - Technicians
  - Regular Users

#### Data Points
- Total Garages: Number of garage sites in system
- Total Vehicles: Complete vehicle inventory
- Total Maintenance Records: All maintenance operations tracked

---

### 3. System Health Monitoring

#### Status Indicators

**API Status**
- Real-time API health check
- Status: Healthy, Degraded, or Down
- Visual indicator with progress bar

**Database Status**
- Database connectivity and performance
- Status: Healthy, Degraded, or Down
- Visual health bar

**Server Uptime**
- Percentage uptime metric
- Target: 99.9%+ uptime
- Visual percentage bar

**Memory Usage**
- System memory utilization percentage
- Color-coded:
  - Green: < 80%
  - Orange: 80-95%
  - Red: > 95%
- Real-time percentage display

**Disk Usage**
- Storage space utilization
- Color-coded:
  - Blue: < 80%
  - Orange: 80-95%
  - Red: > 95%
- Visual percentage bar

**Response Time**
- Server average response time
- Measured in milliseconds (ms)
- Color-coded:
  - Green: < 100ms (optimal)
  - Red: > 100ms (degraded)

#### System Statistics
- **Last Backup**: Time of most recent system backup
- **Total Garages**: Active garage count
- **Total Vehicles**: Active vehicle count

---

## User Interface Layout

### Header Section
- Admin Dashboard title and description
- Export Report button (generates admin report)

### Main Dashboard Grid

#### Top Row: Key Metrics (4 Columns)
- Total Users card (blue)
- Active Users card (green)
- API Calls Today card (orange)
- Average Response Time card (purple)

#### System Health Section
- 6-column responsive grid:
  - API Status (health check)
  - Database Status (health check)
  - Uptime Percentage (metric)
  - Memory Usage (percentage bar)
  - Disk Usage (percentage bar)
  - Response Time (milliseconds)
- System Statistics below (3 columns):
  - Last Backup time
  - Total Garages
  - Total Vehicles

#### Analytics Section
- Two-column layout (responsive):
  - Left: Maintenance Records total
  - Right: Active vs Total Users visualization
- Role Distribution grid (4 columns):
  - Admin count
  - Manager count
  - Technician count
  - User count

#### User Management Section
- Filter dropdown (by role)
- User count display
- Scrollable user list (max-height 24rem)
- Expandable user cards

---

## User Management Workflow

### Finding Users
1. Open Admin Dashboard → User Management section
2. Use role filter to narrow down:
   - All Roles (default)
   - Admin only
   - Manager only
   - Technician only
   - User only

### Updating User Role

1. Click user card to expand details
2. Locate "Change Role" dropdown
3. Select new role from options
4. Change is applied immediately to database

### Suspending Users

1. Expand user details
2. Click "Suspend User" button (yellow)
3. Button text changes to "Activate User"
4. User becomes inactive without deletion

### Deleting Users

1. Expand user details
2. Click "Delete" button (red)
3. Confirmation dialog appears:
   - Message: "Are you sure? This action cannot be undone."
   - "Confirm Delete" button (destructive)
   - "Cancel" button (safe)
4. Upon confirmation:
   - User is removed from system
   - User deleted from authentication
   - User removed from admin interface

---

## Permission Levels

### Admin Role
- ✅ Access Admin Dashboard
- ✅ View all users
- ✅ Change user roles
- ✅ Suspend/activate users
- ✅ Delete users
- ✅ View analytics
- ✅ Monitor system health
- ✅ Export reports
- ✅ Full system access

### Non-Admin Roles
- ❌ Cannot access /admin route
- ❌ Automatic redirect to Dashboard
- Can access only role-appropriate features

---

## Technical Implementation

### Database Tables Used

#### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Role Enum Values**:
- `admin` - Full system access
- `manager` - Can manage garages and teams
- `technician` - Can manage vehicles and maintenance
- `user` - Standard user access

#### Garages Table
- Linked in analytics for garage count

#### Vehicles Table
- Linked in analytics for vehicle count

#### Maintenance Records Table
- Linked in analytics for maintenance count

### API Queries

**Load Users**
```typescript
const { data: profilesData } = await supabase
  .from('profiles')
  .select('id, email, full_name, role, created_at')
  .order('created_at', { ascending: false });
```

**Update User Role**
```typescript
const { error } = await supabase
  .from('profiles')
  .update({ role: newRole })
  .eq('id', userId);
```

**Delete User**
```typescript
const { error } = await supabase.auth.admin.deleteUser(userId);
```

**Fetch Analytics Data**
```typescript
// Garages
const { data: garagesData } = await supabase.from('garages').select('id');

// Vehicles
const { data: vehiclesData } = await supabase.from('vehicles').select('id');

// Maintenance
const { data: maintenanceData } = await supabase.from('maintenance_records').select('id');
```

---

## Features & Capabilities

### Real-Time Updates
- User list updates immediately after role changes
- Active/inactive status reflects instantly
- Analytics refresh on page load

### Data Visualization
- Color-coded role badges
- Progress bars for system metrics
- Status indicators (healthy/degraded/down)
- Responsive grid layouts

### User Experience
- Expandable user cards (click to expand/collapse)
- Confirmation dialogs for destructive actions
- Responsive design works on mobile/tablet
- Smooth transitions and animations
- Touch-friendly interface (48px+ touch targets)

---

## Role-Based Access Control

### Access Matrix

| Feature | User | Tech | Manager | Admin |
|---------|------|------|---------|-------|
| View Dashboard | ✓ | ✓ | ✓ | ✓ |
| View Vehicles | ✓ | ✓ | ✓ | ✓ |
| View Maintenance | ✓ | ✓ | ✓ | ✓ |
| View Garages | ✓ | ✓ | ✓ | ✓ |
| Access Admin | ✗ | ✗ | ✗ | ✓ |
| Manage Users | ✗ | ✗ | ✗ | ✓ |
| View Analytics | ✗ | ✗ | ✗ | ✓ |
| Monitor Health | ✗ | ✗ | ✗ | ✓ |

---

## Security Considerations

### Admin-Only Access
- Route `/admin` redirects non-admin users to Dashboard
- Frontend check: `if (profile?.role !== 'admin') { return <Navigate...> }`
- Backend should implement server-side auth checks
- Never expose admin features to non-admins

### User Deletion
- Deletion from auth.users table via Supabase Admin API
- Requires admin credentials
- Cannot be undone - confirmation required
- Manual backups recommended before bulk deletions

### Role Changes
- Immediate effect on user privileges
- Logged for audit trail (recommended to add)
- No confirmation required for role changes

### Data Exposure
- Never expose sensitive data in analytics
- Aggregate non-sensitive metrics only
- Implement audit logging (future)
- Add API rate limiting for admin endpoints

---

## Common Tasks

### Promote User to Admin
1. Go to Admin Dashboard
2. Find user in User Management
3. Click to expand
4. Change Role dropdown → Select "Admin"
5. User now has admin access
6. Refresh page to verify

### Suspend Inactive User
1. Find user in list
2. Expand user card
3. Click "Suspend User"
4. User account becomes inactive
5. User cannot log in (optional: send notification)

### Review System Health
1. Check "System Health" section (top of dashboard)
2. Review all metrics:
   - API Status (should be "Healthy")
   - Database Status (should be "Healthy")
   - Uptime percentage (target: 99.9%)
   - Memory usage (ideal: < 80%)
   - Disk usage (ideal: < 80%)
   - Response time (ideal: < 100ms)
3. Alert on any red indicators

### Export System Report
1. Click "Export Report" button (top-right)
2. Browser downloads CSV/PDF with:
   - User counts by role
   - System health metrics
   - Analytics overview
   - Timestamp of report

---

## Future Enhancements

### Planned Features
- Activity logs and audit trail
- User action history
- System event logging
- Performance metrics graphs
- Advanced filtering and search
- Bulk user operations
- User import/export
- Custom analytics dashboards
- Scheduled health checks
- Email alerts for issues
- Rate limiting management
- API token management
- Webhook configuration
- System configuration panel

### Performance Improvements
- Implement pagination for large user lists
- Cache analytics data
- Lazy load system health data
- Implement virtual scrolling for user lists

### Security Enhancements
- Add audit logging
- Implement change confirmation modals
- Add 2FA for admin actions
- IP whitelist for admin access
- Session timeout for admin users
- Admin action notifications

---

## Troubleshooting

### Admin Dashboard Not Appearing
**Problem**: Admin link missing from navigation  
**Solution**:
1. Verify user role is 'admin' in profiles table
2. Clear browser cache
3. Log out and log back in
4. Check database record: `SELECT role FROM profiles WHERE id = 'your_id'`

### Cannot Edit User Roles
**Problem**: Role dropdown not saving changes  
**Solution**:
1. Check database connection
2. Verify admin user has proper permissions
3. Check browser console for errors
4. Verify Supabase RLS policies allow updates

### System Health Shows Old Data
**Problem**: Metrics not updating  
**Solution**:
1. Refresh the page
2. Check backend API connectivity
3. Verify Supabase connection
4. Check network requests in DevTools

### User Delete Fails
**Problem**: Delete button not working  
**Solution**:
1. Verify user exists in database
2. Check Supabase admin credentials
3. Verify no foreign key constraints blocking deletion
4. Check browser console for specific error

---

## Performance Considerations

### Data Loading
- Initial load: Fetches all users and basic analytics
- ~1-2 seconds for typical 1000+ user system
- User list paginated (recommended for 10k+)
- Analytics cached for 5-minute intervals

### Memory Usage
- User list limited to 1000 items (scrollable)
- Expandable items only render active users
- Images/avatars lazy-loaded
- Charts render only when visible

### Database Queries
- Optimized indexes on profiles.role
- Batch operations recommended for bulk changes
- Read replicas for analytics queries
- Separate write queries for user management

---

## API Endpoints Used

### Supabase JavaScript SDK

```typescript
// List users
supabase.from('profiles').select('*').order('created_at')

// Update role
supabase.from('profiles').update({ role }).eq('id', userId)

// Delete user
supabase.auth.admin.deleteUser(userId)

// Get counts
supabase.from('garages').select('id', { count: 'exact' })
supabase.from('vehicles').select('id', { count: 'exact' })
supabase.from('maintenance_records').select('id', { count: 'exact' })
```

---

## Monitoring & Alerts

### Recommended Alerts
- ⚠️ API response time > 200ms
- ⚠️ Memory usage > 90%
- ⚠️ Disk usage > 90%
- ⚠️ Uptime < 99%
- ⚠️ Database connection issues
- ⚠️ Unusual deletion patterns

### Metrics to Track
- Daily active users
- User growth rate
- API call volume
- System performance trends
- Error rates by endpoint

---

**Version**: 1.0.0  
**Last Updated**: March 5, 2026  
**Status**: Production Ready  
**Admin Access**: Enabled ✅
