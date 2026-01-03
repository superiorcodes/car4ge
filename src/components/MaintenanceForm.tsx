import React, { useState, useEffect } from 'react';
import { X, Wrench, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../lib/notificationService';
import { format } from 'date-fns';

type MaintenanceRecord = Database['public']['Tables']['maintenance_records']['Insert'];
type Vehicle = Database['public']['Tables']['vehicles']['Row'];
type Garage = Database['public']['Tables']['garages']['Row'];

interface MaintenanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onToast?: (type: 'success' | 'error', message: string) => void;
}

export function MaintenanceForm({ isOpen, onClose, onSuccess, onToast }: MaintenanceFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [garages, setGarages] = useState<Garage[]>([]);

  const [formData, setFormData] = useState<MaintenanceRecord>({
    vehicle_id: '',
    garage_id: '',
    technician_id: user?.id || '',
    service_date: format(new Date(), 'yyyy-MM-dd'),
    mileage: 0,
    description: '',
    cost: 0,
    status: 'pending'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [vehiclesResponse, garagesResponse] = await Promise.all([
          supabase.from('vehicles').select('*').order('make'),
          supabase.from('garages').select('*').order('name')
        ]);

        if (vehiclesResponse.error) throw vehiclesResponse.error;
        if (garagesResponse.error) throw garagesResponse.error;

        setVehicles(vehiclesResponse.data);
        setGarages(garagesResponse.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
    }

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: submitError } = await supabase
        .from('maintenance_records')
        .insert([formData])
        .select();

      if (submitError) throw submitError;

      if (user && data && data.length > 0) {
        const maintenanceId = data[0].id;
        const selectedVehicle = vehicles.find(v => v.id === formData.vehicle_id);

        await notificationService.createNotification(
          user.id,
          'maintenance_scheduled',
          'New Service Scheduled',
          `Service scheduled for ${selectedVehicle?.make} ${selectedVehicle?.model} on ${format(new Date(formData.service_date), 'MMM d, yyyy')}`,
          maintenanceId
        );
      }

      onToast?.('success', 'Service record created successfully!');
      onSuccess();
      onClose();
      setFormData({
        vehicle_id: '',
        garage_id: '',
        technician_id: user?.id || '',
        service_date: format(new Date(), 'yyyy-MM-dd'),
        mileage: 0,
        description: '',
        cost: 0,
        status: 'pending'
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create maintenance record';
      setError(message);
      onToast?.('error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mileage' || name === 'cost' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />

        <div className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-full bg-gray-100 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-200 transition-all duration-200 transform hover:scale-110"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 w-full text-center sm:mt-0 sm:text-left">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    New Service Record
                  </h3>
                  <p className="text-sm text-gray-500">Create a maintenance record</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="vehicle_id" className="block text-sm font-medium text-gray-700">
                    Vehicle
                  </label>
                  <select
                    id="vehicle_id"
                    name="vehicle_id"
                    required
                    value={formData.vehicle_id}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.make} {vehicle.model} ({vehicle.year}) - {vehicle.vin}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="garage_id" className="block text-sm font-medium text-gray-700">
                    Garage
                  </label>
                  <select
                    id="garage_id"
                    name="garage_id"
                    required
                    value={formData.garage_id}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a garage</option>
                    {garages.map(garage => (
                      <option key={garage.id} value={garage.id}>
                        {garage.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="service_date" className="block text-sm font-medium text-gray-700">
                    Service Date
                  </label>
                  <input
                    type="date"
                    id="service_date"
                    name="service_date"
                    required
                    value={formData.service_date}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">
                    Current Mileage
                  </label>
                  <input
                    type="number"
                    id="mileage"
                    name="mileage"
                    required
                    min="0"
                    value={formData.mileage}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Service Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="cost" className="block text-sm font-medium text-gray-700">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    required
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full justify-center items-center space-x-2 rounded-lg border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-medium text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Create Record</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200 hover:shadow-md"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}