import { supabase } from '@/integrations/supabase/client'
import type { GitHubData } from '@/types/github'

// 导出 AI 分析相关函数（从统一入口导入）
export {
	analyzeCode,
	analyzeCodeWith,
	getAIConfig,
	setAIConfig,
	switchAIProvider,
} from './ai'
export type { AIConfig, AIProvider, OpenRouterModel } from './ai/config'

/**
 * 获取 GitHub 用户数据
 * @param username GitHub 用户名
 * @returns GitHub 数据
 */
export async function fetchGitHubData(username: string): Promise<GitHubData> {
	const { data, error } = await supabase.functions.invoke('github-data', {
		body: { username },
	})

	if (error) {
		throw new Error(error.message || 'Failed to fetch GitHub data')
	}

	if (data.error) {
		throw new Error(data.error)
	}

	return data as GitHubData
}
