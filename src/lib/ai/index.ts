/**
 * AI 服务统一入口
 * 根据配置自动选择 AI 提供商
 */

import { supabase } from '@/integrations/supabase/client'
import type { AIAnalysis, GitHubData } from '@/types/github'
import { type AIProvider, getAIConfig } from './config'
import { analyzeCodeWithOpenRouter } from './openrouter'

// 导出配置相关
export * from './config'

/**
 * 通过 Supabase Edge Functions 分析代码
 * @param githubData GitHub 数据
 * @returns AI 分析结果
 */
const analyzeCodeWithSupabase = async (githubData: GitHubData): Promise<AIAnalysis> => {
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
const providerHandlers: Record<AIProvider, (githubData: GitHubData) => Promise<AIAnalysis>> = {
	supabase: analyzeCodeWithSupabase,
	openrouter: analyzeCodeWithOpenRouter,
}

/**
 * 分析代码（统一入口）
 * 根据当前配置自动选择 AI 提供商
 * @param githubData GitHub 数据
 * @returns AI 分析结果
 */
export const analyzeCode = async (githubData: GitHubData): Promise<AIAnalysis> => {
	const config = getAIConfig()
	const handler = providerHandlers[config.provider]

	if (!handler) {
		throw new Error(`不支持的 AI 提供商: ${config.provider}`)
	}

	// 1. 检查前端会话缓存
	const username = githubData.user?.login
	const cacheKey = `ai_analysis_${username}`
	if (username && typeof window !== 'undefined') {
		const cached = sessionStorage.getItem(cacheKey)
		if (cached) {
			console.log('[Cache Hit] Returning AI analysis from frontend session')
			return JSON.parse(cached) as AIAnalysis
		}
	}

	const result = await handler(githubData)

	// 写入缓存
	if (username && typeof window !== 'undefined') {
		sessionStorage.setItem(cacheKey, JSON.stringify(result))
	}
	return result
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
