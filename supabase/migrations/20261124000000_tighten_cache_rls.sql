-- Tighten RLS policies on public cache and unused social tables.
-- Edge Functions use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS,
-- so public/anon roles must not have unrestricted INSERT/UPDATE access.

-- 1. public.github_cache: keep public SELECT, drop unrestricted INSERT/UPDATE policies
DROP POLICY IF EXISTS "Service role can insert cache" ON public.github_cache;
DROP POLICY IF EXISTS "Service role can update cache" ON public.github_cache;

-- 2. public.ai_analysis_cache: keep public SELECT, drop unrestricted INSERT/UPDATE policies
DROP POLICY IF EXISTS "Service role can insert ai cache" ON public.ai_analysis_cache;
DROP POLICY IF EXISTS "Service role can update ai cache" ON public.ai_analysis_cache;

-- 3. public.profile_views & public.profile_likes: unused in application code and expose viewer_ip/liker_ip.
-- Drop anonymous/public INSERT and SELECT policies until routed through a hardened Edge Function.
DROP POLICY IF EXISTS "Allow public insert on profile_views" ON public.profile_views;
DROP POLICY IF EXISTS "Allow public select on profile_views" ON public.profile_views;
DROP POLICY IF EXISTS "Allow public insert on profile_likes" ON public.profile_likes;
DROP POLICY IF EXISTS "Allow public select on profile_likes" ON public.profile_likes;
