/*
  # Add RLS policies for vehicles table

  1. Security Changes
    - Add policy to allow authenticated users to insert vehicles
    - Add policy to allow authenticated users to view all vehicles
    - Add policy to allow authenticated users to update vehicles
*/

-- Policy to allow authenticated users to insert vehicles
CREATE POLICY "Users can insert vehicles"
  ON vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy to allow authenticated users to view all vehicles
CREATE POLICY "Users can view all vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy to allow authenticated users to update vehicles
CREATE POLICY "Users can update vehicles"
  ON vehicles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);