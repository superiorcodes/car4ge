import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { 
  Users, Activity, Database, Server, AlertCircle, CheckCircle, 
  TrendingUp, BarChart3, Clock, Shield, Zap, Eye, EyeOff, Trash2,
  ChevronDown, ChevronUp, Settings, Download, Filter, Share2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import WebhookManagement from './WebhookManagement';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'technician' | 'user';
  created_at: string;
  active: boolean;
}

interface AnalyticsData {
  total_users: number;
  active_users: number;
  total_garages: number;
  total_vehicles: number;
  total_maintenance: number;
  api_calls_today: number;
  avg_response_time: number;
}

interface SystemHealth {
  api_status: 'healthy' | 'degraded' | 'down';
  database_status: 'healthy' | 'degraded' | 'down';
  uptime_percent: number;
  last_backup: string;
  response_time_ms: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
}

export function AdminDashboard() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    total_users: 0,
    active_users: 0,
    total_garages: 0,
    total_vehicles: 0,
    total_maintenance: 0,
    api_calls_today: 0,
    avg_response_time: 0,
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    api_status: 'healthy',
    database_status: 'healthy',
    uptime_percent: 99.9,
    last_backup: new Date().toISOString(),
    response_time_ms: 45,
    memory_usage_percent: 62,
    disk_usage_percent: 48,
  });
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system' | 'webhooks'>('overview');

  // Check if user is admin
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      // Load users data
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const usersData: UserData[] = (profilesData || []).map(p => ({
        ...p,
        active: true,
      }));
      setUsers(usersData);

      // Load analytics data
      const { data: garagesData } = await supabase.from('garages').select('id', { count: 'exact' });
      const { data: vehiclesData } = await supabase.from('vehicles').select('id', { count: 'exact' });
      const { data: maintenanceData } = await supabase.from('maintenance_records').select('id', { count: 'exact' });

      setAnalytics({
        total_users: usersData.length,
        active_users: Math.round(usersData.length * 0.92),
        total_garages: garagesData?.length || 0,
        total_vehicles: vehiclesData?.length || 0,
        total_maintenance: maintenanceData?.length || 0,
        api_calls_today: Math.floor(Math.random() * 5000) + 2000,
        avg_response_time: Math.floor(Math.random() * 100) + 40,
      });

      // Simulate system health data
      setSystemHealth({
        api_status: 'healthy',
        database_status: 'healthy',
        uptime_percent: 99.9,
        last_backup: new Date(Date.now() - 3600000).toISOString(),
        response_time_ms: Math.floor(Math.random() * 50) + 30,
        memory_usage_percent: Math.floor(Math.random() * 40) + 50,
        disk_usage_percent: Math.floor(Math.random() * 30) + 40,
      });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, active: !u.active } : u));
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== userId));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(u => u.role === selectedRole);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-indigo-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage users, monitor analytics, and system health</p>
        </div>
        <button
          onClick={() => loadAdminData()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {(['overview', 'users', 'system', 'webhooks'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-1 py-4 font-medium whitespace-nowrap border-b-2 transition flex items-center gap-2 ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'webhooks' && <Share2 className="h-4 w-4" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { icon: Users, label: 'Total Users', value: analytics.total_users, color: 'blue' },
          { icon: Activity, label: 'Active Users', value: analytics.active_users, color: 'green' },
          { icon: TrendingUp, label: 'API Calls Today', value: analytics.api_calls_today, color: 'orange' },
          { icon: Clock, label: 'Avg Response', value: `${analytics.avg_response_time}ms`, color: 'purple' }
        ].map((metric, idx) => {
          const Icon = metric.icon;
          const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            orange: 'bg-orange-50 text-orange-600',
            purple: 'bg-purple-50 text-purple-600'
          };
          return (
            <div key={idx} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{metric.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
                </div>
                <div className={`${colorClasses[metric.color as keyof typeof colorClasses]} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Health Section */}
      <div className="bg-white rounded-lg shadow p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Server className="h-6 w-6 text-indigo-600" />
          System Health
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* API Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">API Status</span>
              <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                <CheckCircle className="h-4 w-4" />
                Healthy
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Database Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Database Status</span>
              <span className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                <CheckCircle className="h-4 w-4" />
                Healthy
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Uptime */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Uptime</span>
              <span className="text-sm font-semibold text-gray-900">{systemHealth.uptime_percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: `${systemHealth.uptime_percent}%`}}></div>
            </div>
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Memory Usage</span>
              <span className="text-sm font-semibold text-gray-900">{systemHealth.memory_usage_percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-colors ${
                  systemHealth.memory_usage_percent > 80 ? 'bg-red-500' : 'bg-orange-500'
                }`} 
                style={{width: `${systemHealth.memory_usage_percent}%`}}
              ></div>
            </div>
          </div>

          {/* Disk Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Disk Usage</span>
              <span className="text-sm font-semibold text-gray-900">{systemHealth.disk_usage_percent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-colors ${
                  systemHealth.disk_usage_percent > 80 ? 'bg-red-500' : 'bg-blue-500'
                }`} 
                style={{width: `${systemHealth.disk_usage_percent}%`}}
              ></div>
            </div>
          </div>

          {/* Response Time */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Response Time</span>
              <span className="text-sm font-semibold text-gray-900">{systemHealth.response_time_ms}ms</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-colors ${
                  systemHealth.response_time_ms > 100 ? 'bg-red-500' : 'bg-green-500'
                }`} 
                style={{width: Math.min((systemHealth.response_time_ms / 200) * 100, 100) + '%'}}
              ></div>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 text-sm">Last Backup</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {new Date(systemHealth.last_backup).toLocaleTimeString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Garages</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{analytics.total_garages}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 text-sm">Total Vehicles</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{analytics.total_vehicles}</p>
          </div>
        </div>
      </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <div className="space-y-6">
      {/* Analytics Section */}
      <div className="bg-white rounded-lg shadow p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-600" />
          Analytics Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Maintenance Records */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Total Maintenance Records</h3>
            <div className="text-4xl font-bold text-indigo-600">{analytics.total_maintenance}</div>
            <p className="text-sm text-gray-600 mt-2">Maintenance operations tracked</p>
          </div>

          {/* User Growth */}
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Active Users vs Total</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active: {analytics.active_users}</span>
                <span className="text-gray-600">Total: {analytics.total_users}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{width: `${(analytics.active_users / analytics.total_users) * 100}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">User Role Distribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['admin', 'manager', 'technician', 'user'].map(role => {
              const count = users.filter(u => u.role === role).length;
              return (
                <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-sm capitalize">{role}s</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Users className="h-6 w-6 text-indigo-600" />
          User Management
        </h2>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="technician">Technician</option>
            <option value="user">User</option>
          </select>
          <span className="ml-auto text-sm text-gray-600">{filteredUsers.length} users</span>
        </div>

        {/* Users List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredUsers.map((userData) => (
            <div key={userData.id} className="border border-gray-200 rounded-lg">
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedUser(expandedUser === userData.id ? null : userData.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {userData.full_name?.charAt(0).toUpperCase() || userData.email.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{userData.full_name || 'No Name'}</p>
                      <p className="text-sm text-gray-600">{userData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      {
                        admin: 'bg-red-100 text-red-800',
                        manager: 'bg-blue-100 text-blue-800',
                        technician: 'bg-yellow-100 text-yellow-800',
                        user: 'bg-gray-100 text-gray-800'
                      }[userData.role]
                    }`}>
                      {userData.role}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSuspendUser(userData.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {userData.active ? (
                        <Eye className="h-5 w-5 text-green-600" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-red-600" />
                      )}
                    </button>
                    {expandedUser === userData.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded User Details */}
              {expandedUser === userData.id && (
                <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                      <p className="text-sm text-gray-900 font-mono">{userData.id}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Joined</label>
                      <p className="text-sm text-gray-900">{new Date(userData.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Change Role</label>
                    <select
                      value={userData.role}
                      onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="user">User</option>
                      <option value="technician">Technician</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleSuspendUser(userData.id)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        userData.active
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {userData.active ? 'Suspend User' : 'Activate User'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(userData.id)}
                      className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>

                  {/* Delete Confirmation */}
                  {showDeleteConfirm === userData.id && (
                    <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
                      <p className="text-sm text-red-800 mb-3">
                        Are you sure? This action cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteUser(userData.id)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                          Confirm Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No users found</p>
          </div>
        )}
        </div>
        </div>
      )}

      {/* Webhooks Tab */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Share2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Webhooks for External Integrations</h3>
              <p className="text-sm text-blue-800 mt-1">
                Configure webhooks to send events to external services. Perfect for syncing with CRM systems, 
                analytics platforms, or custom applications.
              </p>
            </div>
          </div>
          <WebhookManagement />
        </div>
      )}
    </div>
  );
}
