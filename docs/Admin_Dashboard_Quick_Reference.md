# Admin Dashboard Quick Reference

## Quick Start

### Access Admin Dashboard
1. Log in with an admin account
2. Click "Admin Panel" in the sidebar navigation
3. Or navigate directly to `/admin`

### Requirements
- User must have `role = 'admin'` in the database
- Valid authentication session
- Admin account created in Supabase

---

## Creating an Admin User (Setup)

### Via Supabase Dashboard
1. Go to Supabase Dashboard → Authentication Users
2. Create new user with email/password
3. Go to SQL Editor
4. Run:
```sql
INSERT INTO profiles (id, email, full_name, role)
SELECT id, email, 'Admin Name', 'admin'
FROM auth.users
WHERE email = 'admin@example.com'
LIMIT 1;
```
4. Log in with the new admin account

### Via SQL Command
```sql
-- Update existing user to admin
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Create new admin user (if auth exists)
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'newadmin@example.com',
  'Admin Name',
  'admin',
  now(),
  now()
);
```

---

## Dashboard Sections At-A-Glance

### 📊 Key Metrics (Top 4 Cards)
- **Total Users**: Sum of all registered users
- **Active Users**: Users with recent activity
- **API Calls Today**: Request count for current day
- **Avg Response Time**: Average API response in milliseconds

### 🏥 System Health (6 Metrics)
- API Status (Healthy/Degraded/Down)
- Database Status (Healthy/Degraded/Down)
- Uptime % (Target: 99.9%)
- Memory Usage % (Ideal: < 80%)
- Disk Usage % (Ideal: < 80%)
- Response Time ms (Ideal: < 100ms)

### 📈 Analytics
- Total Maintenance Records
- Active Users vs Total Users
- User Role Distribution (4 segments)

### 👥 User Management
- Filterable user list
- User details (expandable)
- Role management
- Suspend/Activate users
- Delete users (with confirmation)

---

## Common Operations

### Filter Users by Role
1. Go to User Management section
2. Click dropdown: "All Roles"
3. Select: Admin / Manager / Technician / User
4. List updates instantly

### Change User Role
1. Click user card to expand
2. Locate "Change Role" dropdown
3. Select new role
4. Save (automatic)
5. User permissions update immediately

### Suspend a User
1. Click user to expand
2. Click "Suspend User" button
3. Button changes to "Activate User"
4. User cannot log in while suspended

### Delete User
1. Click user to expand
2. Click "Delete" button
3. Confirm in dialog: "Confirm Delete"
4. User removed from system
5. Cannot be undone

### Refresh Data
1. Click "Export Report" button at top
2. Page automatically refreshes or downloads data
3. Or manually refresh browser (F5)

---

## What Each Metric Means

### Active Users
- Users who have logged in within last 30 days
- Calculated as ~92% of total users (example)
- Indicates engagement level

### API Calls Today
- Total API requests since midnight
- Includes all user actions (vehicles, maintenance, etc)
- Shows system usage volume

### Response Time
- Average time server takes to respond
- Measured in milliseconds (ms)
- Ideal: < 100ms on good network
- > 200ms = potential issues

### Uptime
- Percentage of time system was operational
- Industry standard: 99.9% = 8.7 hours downtime/year
- < 99% = excessive downtime

### Memory Usage
- RAM consumption by application
- Green (< 80%) = healthy
- Orange (80-95%) = monitor
- Red (> 95%) = urgent action needed

### Disk Usage
- Storage space consumed
- Includes database, backups, files
- Green (< 80%) = healthy
- Red (> 95%) = disk nearly full - critical!

---

## Color Meanings

### Role Badges
- **Red**: Admin (highest privilege)
- **Blue**: Manager (elevated access)
- **Yellow**: Technician (field worker)
- **Gray**: User (standard access)

### Status Indicators
- **Green**: Healthy (all systems normal)
- **Orange**: Degraded (performance issues)
- **Red**: Down (service unavailable)

### Progress Bars
- **Green**: Optimal (< 80%)
- **Orange**: Caution (80-95%)
- **Red**: Critical (> 95%)

---

## Real-World Scenarios

### Scenario 1: New Employee Starts
1. Employee creates account and joins
2. Admin sees user in list as "user" role
3. Click to expand user
4. Change role: "user" → "technician"
5. Employee can now manage maintenance

### Scenario 2: Employee Quits
1. Search for user in admin list
2. Click to expand
3. Click "Delete" 
4. Confirm deletion
5. User access removed immediately

### Scenario 3: Performance Issues
1. Check System Health section
2. Response Time shows 250ms (red)
3. Memory Usage shows 88% (orange)
4. Disk Usage shows 45% (green)
5. Action: Investigate response time issue, monitor memory

### Scenario 4: Need Admin Help
1. Another admin needs full access
2. Find user in list
3. Change role: current role → "admin"
4. Confirm change
5. User can now access Admin Panel

### Scenario 5: Temporary Suspension
1. User violates policies
2. Find user in admin list
3. Click to expand
4. Click "Suspend User"
5. User gets 401 Unauthorized on login
6. When situation improves: Click "Activate User"

---

## Troubleshooting Quick Tips

| Issue | Cause | Fix |
|-------|-------|-----|
| Admin link not visible | Not admin role | Update role to admin in DB |
| Can't change user role | Permission issue | Verify admin role in profiles |
| Delete fails | User doesn't exist | Refresh page and try again |
| Old data showing | Cache issue | Click Export or refresh page |
| High response time | Server load | Check memory/disk usage |
| Memory > 95% | Memory leak or too many users | Restart server or optimize code |

---

## Security Best Practices

### Protecting Admin Access
- ✅ Use strong password for admin account
- ✅ Enable 2FA when available
- ✅ Don't share admin credentials
- ✅ Regularly rotate admin passwords
- ✅ Audit admin actions regularly

### User Management
- ✅ Review user list monthly
- ✅ Remove inactive users quarterly
- ✅ Audit role assignments
- ✅ Only give admin access to trusted people
- ✅ Log all admin actions (recommended)

### System Health
- ✅ Monitor uptime daily
- ✅ Alert on > 100ms response time
- ✅ Alert on > 85% disk usage
- ✅ Monthly backup verification
- ✅ Security patches applied promptly

---

## Performance Tips

### For Large User Lists
- Use role filter to reduce displayed users
- Scroll within the list (up to 1000 items)
- For 10k+ users: implement pagination

### For Slow Analytics
- Refresh page to reload data
- Check network tab in DevTools
- Verify database connection is healthy
- Consider implementing caching

### For Memory Issues
- Close unused browser tabs
- Clear browser cache
- Reduce number of expanded users
- Monitor system resources

---

## Keyboard Shortcuts (Proposed)

| Shortcut | Action |
|----------|--------|
| Ctrl+F | Focus on user search/filter |
| Esc | Close expanded user |
| Enter | Confirm dialog |
| Delete | Open delete confirmation |

*Note: Currently requires clicking UI elements*

---

## Export Report Details

When you click "Export Report", the system should generate:

### User Analytics
- Total users
- Users by role (admin, manager, technician, user)
- Average account age
- User growth trend

### System Metrics
- API response time (average, min, max)
- Daily API calls
- System uptime percentage
- Last backup timestamp

### Performance Data
- Memory usage average
- Disk usage percentage
- Database health status
- Overall system status

### Timestamp
- Report generated at: [timestamp]
- Data current as of: [timestamp]

---

## Role-Based Features

### What Can Each Role Do?

**User** (Standard)
- View own profile
- Manage own garage
- View own vehicles
- Create maintenance records

**Technician** (Enhanced)
- All User features, plus:
- View assigned vehicles
- Update maintenance status
- Add service notes
- View maintenance history

**Manager** (Leadership)
- All Technician features, plus:
- Manage multiple garages
- Manage garage staff roles
- View garage analytics
- Approve work orders

**Admin** (Full Control)
- All Manager features, plus:
- Access Admin Dashboard
- View all system users
- Change any user role
- Delete users
- Monitor system health
- View global analytics
- Manage system settings

---

## Data Refresh Policy

### Automatic Refresh
- Page load: Fetches latest data (all sections)
- User expansion: Real-time user details
- Role change: Saves immediately to database
- System health: Updates on each page view

### Manual Refresh
- Click "Export Report" button (top right)
- Browser refresh (F5)
- Navigate away and back to /admin
- Close and reopen admin dashboard

### Refresh Schedule (Recommended)
- Check System Health: Daily
- Review Users: Weekly
- Full analytics review: Monthly
- Role audits: Quarterly

---

## Integration with Other Features

### Admin Dashboard and Main Dashboard
- Same user data
- Same garage/vehicle data
- Admin sees all users globally
- Regular users see only their data

### Admin and API
- Admin actions trigger normal API calls
- Delete user: Calls Supabase auth admin API
- Role change: Updates profiles table
- Same RLS policies apply to admin

### Admin and Profile Settings
- Admin can modify user roles
- Users can modify own profile (from Settings)
- Admin actions override user preferences
- All audit trails independent

---

## FAQ

**Q: Can I undo a user deletion?**  
A: No. Deletion is permanent. Keep backups of important user data.

**Q: What if I delete myself?**  
A: You will be logged out and need another admin to restore your profile with auth credentials.

**Q: How often should I check System Health?**  
A: Daily is recommended. Set up automated alerts for metrics > thresholds.

**Q: Can users see admin actions?**  
A: Not currently visible to users. Audit logging recommended for security.

**Q: What's a good Active Users percentage?**  
A: 80-95% is excellent, 60-80% is normal, < 50% indicates engagement issues.

**Q: How do I recover a deleted user?**  
A: From backups only. User data cannot be restored without previous backup.

**Q: Can I change my own role?**  
A: Yes, as long as you're admin, you can change any role including your own.

**Q: What if the API Status shows "Down"?**  
A: It's a demo system. In production, contact infrastructure team immediately.

---

## Support & Help

### For Admin Questions
- Email: admin-support@car4ge.com
- Docs: [Admin Dashboard Guide](./Admin_Dashboard_Guide.md)
- API Docs: [API Reference](./api/API_REFERENCE.md)

### For User Issues
- Check: [User Guide](./USER_GUIDE.md)
- Check: [Developer Guide](./guides/DEVELOPER_GUIDE.md)

### Emergency Contacts
- Admin Support: admin-support@car4ge.com
- General Support: support@car4ge.com
- Technical Issues: tech-support@car4ge.com

---

**Last Updated**: March 5, 2026  
**Status**: Ready to Use  
**Admin Access**: Available ✅
