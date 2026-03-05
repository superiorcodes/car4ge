import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, Wrench, AlertTriangle, CheckCircle, TrendingUp, Award, Clock, Hand, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type MaintenanceRecord = Database['public']['Tables']['maintenance_records']['Row'] & {
  vehicles: Database['public']['Tables']['vehicles']['Row'];
  garages: Database['public']['Tables']['garages']['Row'];
};

export function Dashboard() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState(0);
  const [garages, setGarages] = useState(0);
  const [pendingServices, setPendingServices] = useState(0);
  const [completedToday, setCompletedToday] = useState(0);
  const [recentActivity, setRecentActivity] = useState<MaintenanceRecord[]>([]);
  const [upcomingServices, setUpcomingServices] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [vehiclesRes, garagesRes, maintenanceRes] = await Promise.all([
          supabase.from('vehicles').select('id'),
          supabase.from('garages').select('id'),
          supabase.from('maintenance_records').select(`
            *,
            vehicles (*),
            garages (*)
          `).order('service_date', { ascending: false }).limit(10)
        ]);

        if (vehiclesRes.error) throw vehiclesRes.error;
        if (garagesRes.error) throw garagesRes.error;
        if (maintenanceRes.error) throw maintenanceRes.error;

        setVehicles(vehiclesRes.data?.length || 0);
        setGarages(garagesRes.data?.length || 0);

        const records = maintenanceRes.data || [];
        const today = new Date().toDateString();
        const todayCompleted = records.filter(r =>
          new Date(r.created_at).toDateString() === today && r.status === 'completed'
        ).length;
        const pending = records.filter(r => r.status === 'pending').length;

        setPendingServices(pending);
        setCompletedToday(todayCompleted);
        setRecentActivity(records.slice(0, 3));
        setUpcomingServices(records.filter(r => r.status !== 'completed').slice(0, 3));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const stats = [
    { name: 'Active Vehicles', value: vehicles.toString(), icon: Car },
    { name: 'Pending Services', value: pendingServices.toString(), icon: Wrench },
    { name: 'Garages', value: garages.toString(), icon: AlertTriangle },
    { name: 'Completed Today', value: completedToday.toString(), icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Animation */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="animate-bounce flex-shrink-0">
              <Award className="h-6 md:h-8 w-6 md:w-8 text-yellow-300" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2 flex-wrap">
                Welcome back, {user?.email?.split('@')[0]}!
                <Hand className="h-5 md:h-6 w-5 md:w-6 text-yellow-300 rotate-45 flex-shrink-0" />
              </h1>
              <p className="text-xs md:text-sm text-indigo-100 mt-1">Ready to manage your garage operations efficiently</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-white/5 rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16"></div>
        <div className="absolute bottom-0 left-0 w-16 md:w-24 h-16 md:h-24 bg-white/5 rounded-full -ml-8 md:-ml-12 -mb-8 md:-mb-12"></div>
      </div>

      <div className="flex justify-between items-center px-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 md:h-6 w-5 md:w-6 text-indigo-600 flex-shrink-0" />
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">Dashboard Overview</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group active:scale-95"
            >
              <div className="p-4 md:p-6 relative">
                <div className="absolute top-0 right-0 w-16 md:w-20 h-16 md:h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full -mr-8 md:-mr-10 -mt-8 md:-mt-10 opacity-50"></div>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-2 md:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <Icon className="h-5 md:h-6 w-5 md:w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <dl>
                      <dt className="text-xs md:text-sm font-medium text-gray-600 truncate">
                        {item.name}
                      </dt>
                      <dd className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                        {item.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600 flex-shrink-0" />
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
          </div>
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="mt-4 md:mt-6 flow-root">
                <ul className="-my-3 md:-my-5 divide-y divide-gray-200">
                  {recentActivity.map((item) => (
                    <li key={item.id} className="py-3 md:py-4 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200 cursor-pointer active:bg-gray-100">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="flex-shrink-0 pt-1">
                          <div className={`p-1.5 md:p-2 rounded-full ${
                            item.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            <CheckCircle className={`h-4 md:h-5 w-4 md:w-5 ${
                              item.status === 'completed' ? 'text-green-600' : 'text-blue-600'
                            }`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                            {item.description}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500 truncate">
                            {item.vehicles.make} {item.vehicles.model} • VIN: {item.vehicles.vin}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                            item.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.status === 'completed' ? '✨ Completed' : '⏳ Pending'}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Services */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div className="p-4 md:p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-indigo-600 flex-shrink-0" />
              <h3 className="text-base md:text-lg font-semibold text-gray-900">
              Upcoming Services
              </h3>
            </div>
          </div>
          <div className="p-4 md:p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : upcomingServices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming services</p>
            ) : (
              <div className="mt-4 md:mt-6 flow-root">
                <ul className="-my-3 md:-my-5 divide-y divide-gray-200">
                  {upcomingServices.map((item) => (
                    <li key={item.id} className="py-3 md:py-4 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200 cursor-pointer active:bg-gray-100">
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="flex-shrink-0 pt-1">
                          <div className="p-1.5 md:p-2 bg-yellow-100 rounded-full">
                            <Clock className="h-4 md:h-5 w-4 md:w-5 text-yellow-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                            {item.description}
                          </p>
                          <p className="text-xs md:text-sm text-gray-500 truncate">
                            {item.vehicles.make} {item.vehicles.model} • {new Date(item.service_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 gap-1 whitespace-nowrap">
                            <CalendarIcon className="h-3 w-3 flex-shrink-0" />
                            <span>{item.status}</span>
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}