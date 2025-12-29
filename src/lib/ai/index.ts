/**
 * AI 服务统一入口
 * 根据配置自动选择 AI 提供商
 */

import type { GitHubData, AIAnalysis } from '@/types/github'
import { supabase } from '@/integrations/supabase/client'
import { getAIConfig, type AIProvider } from './config'
import { analyzeCodeWithOpenRouter } from './openrouter'

// 导出配置相关
export * from './config'

/**
 * 通过 Supabase Edge Functions 分析代码
 * @param githubData GitHub 数据
 * @returns AI 分析结果
 */
const analyzeCodeWithSupabase = async (
	githubData: GitHubData
): Promise<AIAnalysis> => {
	const { data, error } = await supabase.functions.invoke('analyze-code', {
		body: { githubData },
	})

	if (error) {
		throw new Error(error.message || 'Supabase 分析服务调用失败')
	}

	if (data.error) {
		throw new Error(data.error)
	}

	return data.analysis as AIAnalysis
}

/** 提供商分析函数映射 */
const providerHandlers: Record<
	AIProvider,
	(githubData: GitHubData) => Promise<AIAnalysis>
> = {
	supabase: analyzeCodeWithSupabase,
	openrouter: analyzeCodeWithOpenRouter,
}

/**
 * 分析代码（统一入口）
 * 根据当前配置自动选择 AI 提供商
 * @param githubData GitHub 数据
 * @returns AI 分析结果
 */
export const analyzeCode = async (
	githubData: GitHubData
): Promise<AIAnalysis> => {
	const config = getAIConfig()
	const handler = providerHandlers[config.provider]

	if (!handler) {
		throw new Error(`不支持的 AI 提供商: ${config.provider}`)
	}

	return handler(githubData)
}

/**
 * 使用指定提供商分析代码
 * @param provider AI 提供商
 * @param githubData GitHub 数据
 * @returns AI 分析结果
 */
export const analyzeCodeWith = async (
	provider: AIProvider,
	githubData: GitHubData
): Promise<AIAnalysis> => {
	const handler = providerHandlers[provider]

	if (!handler) {
		throw new Error(`不支持的 AI 提供商: ${provider}`)
	}

	return handler(githubData)
}
