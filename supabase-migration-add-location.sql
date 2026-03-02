-- Migration: Add location fields to alumni table
-- Run this in your Supabase SQL Editor

ALTER TABLE alumni
ADD COLUMN location TEXT,
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION;

-- Optional: Update sample data with locations
UPDATE alumni SET location = 'San Francisco, CA', latitude = 37.7749, longitude = -122.4194 WHERE name = 'Alice Chen';
UPDATE alumni SET location = 'New York, NY', latitude = 40.7128, longitude = -74.0060 WHERE name = 'Bob Martinez';
UPDATE alumni SET location = 'Seattle, WA', latitude = 47.6062, longitude = -122.3321 WHERE name = 'Carol Williams';
UPDATE alumni SET location = 'Austin, TX', latitude = 30.2672, longitude = -97.7431 WHERE name = 'David Kim';
UPDATE alumni SET location = 'Boston, MA', latitude = 42.3601, longitude = -71.0589 WHERE name = 'Emma Johnson';
UPDATE alumni SET location = 'Los Angeles, CA', latitude = 34.0522, longitude = -118.2437 WHERE name = 'Frank Liu';
UPDATE alumni SET location = 'Chicago, IL', latitude = 41.8781, longitude = -87.6298 WHERE name = 'Grace Park';
UPDATE alumni SET location = 'Denver, CO', latitude = 39.7392, longitude = -104.9903 WHERE name = 'Henry Nguyen';
UPDATE alumni SET location = 'Portland, OR', latitude = 45.5152, longitude = -122.6784 WHERE name = 'Ivy Thompson';
UPDATE alumni SET location = 'Miami, FL', latitude = 25.7617, longitude = -80.1918 WHERE name = 'Jack Brown';
