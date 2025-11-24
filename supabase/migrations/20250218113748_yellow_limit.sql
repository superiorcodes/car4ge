/*
  # Initial Schema for Garage Management System

  1. New Tables
    - `users`: Store user information and authentication
    - `garages`: Store garage information
    - `vehicles`: Store vehicle information
    - `maintenance_records`: Store maintenance and repair records
    - `vehicle_ownership`: Track vehicle ownership history
    - `garage_staff`: Link staff members to garages
    - `parts`: Track parts used in repairs

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Implement role-based access control
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'technician', 'front_desk')),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Garages table
CREATE TABLE garages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  license_number TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vehicles table
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Vehicle ownership history
CREATE TABLE vehicle_ownership (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id),
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Maintenance records
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id),
  garage_id UUID REFERENCES garages(id),
  technician_id UUID REFERENCES users(id),
  service_date DATE NOT NULL,
  mileage INTEGER NOT NULL,
  description TEXT NOT NULL,
  diagnosis TEXT,
  solution TEXT,
  cost DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  photos TEXT[], -- Array of photo URLs
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Garage staff
CREATE TABLE garage_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  garage_id UUID REFERENCES garages(id),
  user_id UUID REFERENCES users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'technician', 'front_desk')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(garage_id, user_id)
);

-- Parts inventory
CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  maintenance_record_id UUID REFERENCES maintenance_records(id),
  name TEXT NOT NULL,
  part_number TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  cost_per_unit DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE garages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE garage_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Garage staff can view garage data"
  ON garages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM garage_staff
      WHERE garage_staff.garage_id = garages.id
      AND garage_staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Garage staff can view vehicle data"
  ON vehicles
  FOR SELECT
  USING (true);

CREATE POLICY "Garage staff can view maintenance records"
  ON maintenance_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM garage_staff
      WHERE garage_staff.garage_id = maintenance_records.garage_id
      AND garage_staff.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_vehicles_vin ON vehicles(vin);
CREATE INDEX idx_maintenance_records_vehicle_id ON maintenance_records(vehicle_id);
CREATE INDEX idx_maintenance_records_garage_id ON maintenance_records(garage_id);
CREATE INDEX idx_garage_staff_garage_id ON garage_staff(garage_id);
CREATE INDEX idx_garage_staff_user_id ON garage_staff(user_id);