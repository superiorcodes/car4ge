import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { GarageForm } from '../components/GarageForm';

type Garage = Database['public']['Tables']['garages']['Row'];

export function Garages() {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchGarages = async () => {
    try {
      const { data, error } = await supabase
        .from('garages')
        .select('*')
        .order('name');

      if (error) throw error;
      setGarages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGarages();
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
        <p>Error loading garages: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Garages</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Garage
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {garages.map((garage) => (
          <div
            key={garage.id}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {garage.name}
                  </h3>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <p className="flex items-center text-sm text-gray-500">
                  <MapPin className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                  {garage.address}
                </p>
                <p className="flex items-center text-sm text-gray-500">
                  <Phone className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                  {garage.phone}
                </p>
                <p className="flex items-center text-sm text-gray-500">
                  <Mail className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                  {garage.email}
                </p>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">
                  License: {garage.license_number}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <GarageForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchGarages}
      />
    </div>
  );
}