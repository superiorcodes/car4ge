import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Plus, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { GarageForm } from '../components/GarageForm';

type Garage = Database['public']['Tables']['garages']['Row'];

import { ToastContainer } from '../components/Toast';

type Toast = { id: string; type: 'success' | 'error'; message: string };

export function Garages() {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

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
            className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
          >
            <div className="p-6 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full -mr-10 -mt-10 opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="ml-4 relative z-10">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-200">
                    {garage.name}
                  </h3>
                  <div className="flex items-center mt-1">
                    <Sparkles className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-500">Licensed Garage</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <p className="flex items-center text-sm text-gray-500">
                  <MapPin className="flex-shrink-0 mr-2 h-5 w-5 text-indigo-500" />
                  {garage.address}
                </p>
                <p className="flex items-center text-sm text-gray-500">
                  <Phone className="flex-shrink-0 mr-2 h-5 w-5 text-green-500" />
                  {garage.phone}
                </p>
                <p className="flex items-center text-sm text-gray-500">
                  <Mail className="flex-shrink-0 mr-2 h-5 w-5 text-blue-500" />
                  {garage.email}
                </p>
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    License: {garage.license_number}
                  </p>
                  <div className="flex items-center text-xs text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Verified
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <GarageForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchGarages}
        onToast={addToast}
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}