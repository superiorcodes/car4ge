import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Car, Wrench, AlertTriangle, CheckCircle, TrendingUp, Award, Clock } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();

  // Mock data for demonstration
  const stats = [
    { name: 'Active Vehicles', value: '234', icon: Car },
    { name: 'Pending Services', value: '12', icon: Wrench },
    { name: 'Critical Issues', value: '3', icon: AlertTriangle },
    { name: 'Completed Today', value: '8', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Animation */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="animate-bounce">
              <Award className="h-8 w-8 text-yellow-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.email?.split('@')[0]}! 👋
              </h1>
              <p className="text-indigo-100 mt-1">Ready to manage your garage operations efficiently</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Dashboard Overview</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.name}
              className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
            >
              <div className="p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1 relative z-10">
                    <dl>
                      <dt className="text-sm font-medium text-gray-600 truncate">
                        {item.name}
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="mt-6 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {[1, 2, 3].map((item) => (
                  <li key={item} className="py-4 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-green-100 rounded-full">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Oil Change Completed
                        </p>
                        <p className="text-sm text-gray-500">
                          Toyota Camry • VIN: 1HGCM82633A123456
                        </p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✨ Completed
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Upcoming Services */}
        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow duration-300">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <Car className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Services
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className="mt-6 flow-root">
              <ul className="-my-5 divide-y divide-gray-200">
                {[1, 2, 3].map((item) => (
                  <li key={item} className="py-4 hover:bg-gray-50 rounded-lg px-2 transition-colors duration-200 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="p-2 bg-yellow-100 rounded-full">
                          <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Brake Inspection
                        </p>
                        <p className="text-sm text-gray-500">
                          Honda Civic • Tomorrow at 10:00 AM
                        </p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          📅 Scheduled
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}