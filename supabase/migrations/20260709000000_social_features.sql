-- Migration: Add social features (views and likes)
-- Ensure citext extension exists for case-insensitive username handling if needed,
-- but here we enforce lowercase explicitly.

-- Create table for tracking profile views
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL CHECK (username = lower(username)),
  viewer_ip TEXT, -- Must be hashed/anonymized by client/edge function before insert
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for tracking likes/rockets
CREATE TABLE IF NOT EXISTS profile_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL CHECK (username = lower(username)),
  liker_ip TEXT, -- Must be hashed/anonymized by client/edge function before insert
  liked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (username, liker_ip)
);

-- Index for faster aggregation
CREATE INDEX IF NOT EXISTS idx_profile_views_username ON profile_views(username);
CREATE INDEX IF NOT EXISTS idx_profile_likes_username ON profile_likes(username);

-- Enable Row Level Security
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_likes ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Allow anyone to insert (anon or authenticated)
CREATE POLICY "Allow public insert on profile_views" ON profile_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on profile_likes" ON profile_likes FOR INSERT WITH CHECK (true);

-- Allow public to read if they need to, or rely on Edge Function. We'll allow public select for now.
CREATE POLICY "Allow public select on profile_views" ON profile_views FOR SELECT USING (true);
CREATE POLICY "Allow public select on profile_likes" ON profile_likes FOR SELECT USING (true);

-- Create a view for leaderboard (Views ignore RLS by default when queried by superuser, but respect it if queried by anon unless security invoker is set)
CREATE OR REPLACE VIEW profile_stats AS
SELECT 
  username,
  (SELECT COUNT(*) FROM profile_views v WHERE v.username = p.username) as view_count,
  (SELECT COUNT(*) FROM profile_likes l WHERE l.username = p.username) as like_count
FROM (
  SELECT DISTINCT username FROM profile_views
  UNION
  SELECT DISTINCT username FROM profile_likes
) p;
