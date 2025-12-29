import { supabase } from "@/integrations/supabase/client";
import type { GitHubData, AIAnalysis } from "@/types/github";

export async function fetchGitHubData(username: string): Promise<GitHubData> {
  const { data, error } = await supabase.functions.invoke('github-data', {
    body: { username }
  });

  if (error) {
    throw new Error(error.message || 'Failed to fetch GitHub data');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as GitHubData;
}

export async function analyzeCode(githubData: GitHubData): Promise<AIAnalysis> {
  const { data, error } = await supabase.functions.invoke('analyze-code', {
    body: { githubData }
  });

  if (error) {
    throw new Error(error.message || 'Failed to analyze code');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data.analysis as AIAnalysis;
}
