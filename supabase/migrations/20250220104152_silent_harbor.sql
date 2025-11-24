/*
  # Add RLS policies for garages table

  1. Security Changes
    - Add policy to allow authenticated users to insert garages
    - Add policy to allow authenticated users to view all garages
    - Add policy to allow authenticated users to update garages
    - Replace existing restrictive garage staff policy
*/

-- Drop the existing restrictive policy if it exists
DROP POLICY IF EXISTS "Garage staff can view garage data" ON garages;

-- Policy to allow authenticated users to insert garages
CREATE POLICY "Users can insert garages"
  ON garages
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy to allow authenticated users to view all garages
CREATE POLICY "Users can view all garages"
  ON garages
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow authenticated users to update garages
CREATE POLICY "Users can update garages"
  ON garages
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);