-- Create a table to cache AI analysis data
CREATE TABLE public.ai_analysis_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    analysis_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add unique index for fast lookups and to prevent duplicates
CREATE UNIQUE INDEX idx_ai_analysis_cache_username ON public.ai_analysis_cache(username);
CREATE INDEX idx_ai_analysis_cache_updated_at ON public.ai_analysis_cache(updated_at);

-- Enable Row Level Security
ALTER TABLE public.ai_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cache
CREATE POLICY "Anyone can read ai cache"
ON public.ai_analysis_cache
FOR SELECT
USING (true);

-- Allow service role to insert cache
CREATE POLICY "Service role can insert ai cache"
ON public.ai_analysis_cache
FOR INSERT
WITH CHECK (true);

-- Allow service role to update cache
CREATE POLICY "Service role can update ai cache"
ON public.ai_analysis_cache
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Create updated_at trigger function if it doesn't exist, and trigger
CREATE OR REPLACE FUNCTION public.update_ai_analysis_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_analysis_cache_updated_at
BEFORE UPDATE ON public.ai_analysis_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_analysis_cache_updated_at();
