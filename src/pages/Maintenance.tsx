import React, { useState, useEffect } from 'react';
import { Wrench, Calendar, Clock, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { MaintenanceForm } from '../components/MaintenanceForm';

type MaintenanceRecord = Database['public']['Tables']['maintenance_records']['Row'] & {
  vehicles: Database['public']['Tables']['vehicles']['Row'];
  garages: Database['public']['Tables']['garages']['Row'];
};

export function Maintenance() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchMaintenanceRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select(`
          *,
          vehicles (*),
          garages (*)
        `)
        .order('service_date', { ascending: false });

      if (error) throw error;
      setRecords(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceRecords();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error loading maintenance records: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Maintenance Records</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Service Record
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul className="divide-y divide-gray-200">
          {records.map((record) => (
            <li key={record.id} className="p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 transform hover:scale-[1.01] rounded-lg mx-2 my-1 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Wrench className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{record.description}</p>
                    <p className="text-sm text-gray-500">
                      {record.vehicles.make} {record.vehicles.model} • VIN: {record.vehicles.vin}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : record.status === 'pending'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {record.status === 'completed' && '✅ '}
                    {record.status === 'in_progress' && '🔧 '}
                    {record.status === 'pending' && '⏳ '}
                    {record.status === 'cancelled' && '❌ '}
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex sm:space-x-6">
                  <p className="flex items-center text-sm text-gray-500">
                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-indigo-500" />
                    {new Date(record.service_date).toLocaleDateString()}
                  </p>
                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-green-500" />
                    {record.garages.name}
                  </p>
                </div>
                <div className="mt-2 flex items-center text-base font-bold text-indigo-600 sm:mt-0">
                  💰 ${record.cost.toFixed(2)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <MaintenanceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchMaintenanceRecords}
      />
    </div>
  );
}