/*
  # Create people table for data visualization

  1. New Tables
    - `people`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `count` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `people` table
    - Add policies for authenticated users to perform CRUD operations
*/

CREATE TABLE IF NOT EXISTS people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON people
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert access for authenticated users"
  ON people
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users"
  ON people
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Enable delete access for authenticated users"
  ON people
  FOR DELETE
  TO authenticated
  USING (true);