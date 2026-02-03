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
 * 自定义错误类，用于表示 GitHub API Rate Limit 超限
 */
export class GitHubRateLimitError extends Error {
	public readonly resetTime?: Date
	public readonly remaining?: number

	constructor(message: string, resetTime?: Date, remaining?: number) {
		super(message)
		this.name = 'GitHubRateLimitError'
		this.resetTime = resetTime
		this.remaining = remaining

		// 修复 Error 类的原型链，确保 instanceof 检查正常工作
		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, GitHubRateLimitError)
		}
	}
}

/**
 * 获取 GitHub 用户数据
 * @param username GitHub 用户名
 * @returns GitHub 数据
 */
export async function fetchGitHubData(username: string): Promise<GitHubData> {
	// 调用 Supabase Edge Function 'github-data'
	const { data, error } = await supabase.functions.invoke('github-data', {
		body: { username },
	})

	// 处理调用过程中的网络或配置错误
	if (error) {
		console.error('[GitHub] 调用 Edge Function 失败:', error)
		throw new Error(error.message || 'Failed to fetch GitHub data')
	}

	// 检查响应体中是否包含业务逻辑错误
	if (data?.error) {
		console.error('[GitHub] API 返回业务错误:', data.error)

		// 尝试解析 Rate Limit 相关的错误信息
		// Edge Function 可能在错误响应中返回 rateLimitReset 等字段
		if (data.rateLimitRemaining !== undefined && data.rateLimitReset !== undefined) {
			const resetTime = new Date(Number(data.rateLimitReset) * 1000)
			const rateLimitMessage = data.message || `GitHub API Rate limit exceeded. Resets at ${resetTime.toLocaleString()}`

			throw new GitHubRateLimitError(rateLimitMessage, resetTime, data.rateLimitRemaining)
		}

		throw new Error(data.error)
	}

	// 返回成功获取的数据
	return data as GitHubData
}
