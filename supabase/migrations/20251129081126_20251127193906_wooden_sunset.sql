/*
  # Initial Schema for Garage Management System

  1. New Tables
    - `garages`: Store garage information with contact details and licensing
    - `vehicles`: Store vehicle information including VIN, make, model, and specifications
    - `maintenance_records`: Store maintenance and repair records with status tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to perform CRUD operations
    - Ensure data security while allowing necessary access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Garages table
CREATE TABLE IF NOT EXISTS garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  license_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vin TEXT UNIQUE NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  engine_type TEXT,
  transmission TEXT,
  mileage INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  garage_id UUID REFERENCES garages(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL,
  service_date DATE NOT NULL,
  mileage INTEGER NOT NULL,
  description TEXT NOT NULL,
  diagnosis TEXT,
  solution TEXT,
  cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  photos TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Garages policies
DROP POLICY IF EXISTS "Users can insert garages" ON garages;
CREATE POLICY "Users can insert garages"
  ON garages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view all garages" ON garages;
CREATE POLICY "Users can view all garages"
  ON garages
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update garages" ON garages;
CREATE POLICY "Users can update garages"
  ON garages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete garages" ON garages;
CREATE POLICY "Users can delete garages"
  ON garages
  FOR DELETE
  TO authenticated
  USING (true);

-- Vehicles policies
DROP POLICY IF EXISTS "Users can insert vehicles" ON vehicles;
CREATE POLICY "Users can insert vehicles"
  ON vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view all vehicles" ON vehicles;
CREATE POLICY "Users can view all vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update vehicles" ON vehicles;
CREATE POLICY "Users can update vehicles"
  ON vehicles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete vehicles" ON vehicles;
CREATE POLICY "Users can delete vehicles"
  ON vehicles
  FOR DELETE
  TO authenticated
  USING (true);

-- Maintenance records policies
DROP POLICY IF EXISTS "Users can insert maintenance records" ON maintenance_records;
CREATE POLICY "Users can insert maintenance records"
  ON maintenance_records
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view all maintenance records" ON maintenance_records;
CREATE POLICY "Users can view all maintenance records"
  ON maintenance_records
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update maintenance records" ON maintenance_records;
CREATE POLICY "Users can update maintenance records"
  ON maintenance_records
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete maintenance records" ON maintenance_records;
CREATE POLICY "Users can delete maintenance records"
  ON maintenance_records
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_vehicle_id ON maintenance_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_garage_id ON maintenance_records(garage_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_status ON maintenance_records(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_service_date ON maintenance_records(service_date);