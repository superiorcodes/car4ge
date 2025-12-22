/*
  # User Profiles and Role-Based Access Control

  1. New Tables
    - `profiles`: User profile information linked to Supabase auth.users
      - `id` (uuid, primary key) - matches auth.users.id
      - `email` (text) - user email
      - `full_name` (text) - user's full name
      - `role` (enum) - user role: 'admin', 'manager', 'technician', 'user'
      - `avatar_url` (text) - profile picture URL
      - `phone` (text) - contact phone
      - `created_at` (timestamp) - account creation time
      - `updated_at` (timestamp) - last update time

    - `user_garage_roles`: Relationship between users and garages with roles
      - `id` (uuid, primary key)
      - `user_id` (uuid) - references profiles.id
      - `garage_id` (uuid) - references garages.id
      - `role` (enum) - garage-specific role: 'owner', 'manager', 'technician'
      - `created_at` (timestamp)

  2. Schema Changes
    - Added `owner_id` to garages table to track garage owner
    - Added `user_id` to vehicles table for ownership tracking
    - Added `created_by` to maintenance_records for creator tracking

  3. Security
    - Enable RLS on profiles table
    - Enable RLS on user_garage_roles table
    - Add policies for self-profile access and role-based access
    - Update existing table policies to use role system
    - Users can only access data for garages they belong to
*/

-- Create role enum type
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'technician', 'user');
CREATE TYPE garage_role AS ENUM ('owner', 'manager', 'technician');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user_garage_roles table
CREATE TABLE IF NOT EXISTS user_garage_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  garage_id UUID REFERENCES garages(id) ON DELETE CASCADE NOT NULL,
  role garage_role DEFAULT 'technician' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, garage_id)
);

-- Add owner_id to garages table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'garages' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE garages ADD COLUMN owner_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add user_id to vehicles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vehicles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN user_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add created_by to maintenance_records table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'maintenance_records' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE maintenance_records ADD COLUMN created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_garage_roles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Garage managers can view garage staff profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT user_id FROM user_garage_roles ugr
      WHERE ugr.garage_id IN (
        SELECT garage_id FROM user_garage_roles
        WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
      )
    ) OR auth.uid() = id
  );

-- User garage roles policies
CREATE POLICY "Users can view their garage roles"
  ON user_garage_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Garage managers can manage team roles"
  ON user_garage_roles FOR ALL
  TO authenticated
  USING (
    garage_id IN (
      SELECT garage_id FROM user_garage_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    garage_id IN (
      SELECT garage_id FROM user_garage_roles
      WHERE user_id = auth.uid() AND role IN ('owner', 'manager')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_garage_roles_user_id ON user_garage_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_garage_roles_garage_id ON user_garage_roles(garage_id);
CREATE INDEX IF NOT EXISTS idx_user_garage_roles_role ON user_garage_roles(role);
CREATE INDEX IF NOT EXISTS idx_garages_owner_id ON garages(owner_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_created_by ON maintenance_records(created_by);
