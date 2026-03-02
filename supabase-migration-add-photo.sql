-- Migration: Add photo_url field to alumni table
-- Run this in your Supabase SQL Editor

ALTER TABLE alumni ADD COLUMN photo_url TEXT;
