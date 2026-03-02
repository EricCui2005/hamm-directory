-- Hammarskjold Alumni Directory Schema
-- Run this in your Supabase SQL Editor

-- Create the alumni table
CREATE TABLE alumni (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_url TEXT,
  year_start INTEGER NOT NULL,
  year_end INTEGER NOT NULL,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on name for faster search
CREATE INDEX idx_alumni_name ON alumni USING gin (to_tsvector('english', name));

-- Enable Row Level Security (optional for now, but good practice)
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (since we have no auth yet)
CREATE POLICY "Allow all operations" ON alumni
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert some sample data with locations
INSERT INTO alumni (name, email, linkedin_url, year_start, year_end, location, latitude, longitude) VALUES
  ('Alice Chen', 'alice@stanford.edu', 'https://linkedin.com/in/alicechen', 2022, 2024, 'San Francisco, CA', 37.7749, -122.4194),
  ('Bob Martinez', 'bob@stanford.edu', 'https://linkedin.com/in/bobmartinez', 2021, 2023, 'New York, NY', 40.7128, -74.0060),
  ('Carol Williams', 'carol@stanford.edu', NULL, 2023, 2025, 'Seattle, WA', 47.6062, -122.3321),
  ('David Kim', 'david@stanford.edu', 'https://linkedin.com/in/davidkim', 2020, 2024, 'Austin, TX', 30.2672, -97.7431),
  ('Emma Johnson', 'emma@stanford.edu', 'https://linkedin.com/in/emmaj', 2022, 2026, 'Boston, MA', 42.3601, -71.0589),
  ('Frank Liu', 'frank@stanford.edu', 'https://linkedin.com/in/frankliu', 2019, 2021, 'Los Angeles, CA', 34.0522, -118.2437),
  ('Grace Park', 'grace@stanford.edu', NULL, 2024, 2026, 'Chicago, IL', 41.8781, -87.6298),
  ('Henry Nguyen', 'henry@stanford.edu', 'https://linkedin.com/in/henryn', 2021, 2025, 'Denver, CO', 39.7392, -104.9903),
  ('Ivy Thompson', 'ivy@stanford.edu', 'https://linkedin.com/in/ivyt', 2023, 2025, 'Portland, OR', 45.5152, -122.6784),
  ('Jack Brown', 'jack@stanford.edu', 'https://linkedin.com/in/jackbrown', 2020, 2022, 'Miami, FL', 25.7617, -80.1918);
