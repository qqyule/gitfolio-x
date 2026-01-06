/**
 * AI 服务配置
 * 支持多种 AI 提供商：Supabase Edge Functions、OpenRouter
 */

/** AI 提供商类型 */
export type AIProvider = 'supabase' | 'openrouter'

/** OpenRouter 支持的模型列表 */
export type OpenRouterModel =
	| 'google/gemini-2.0-flash-001'
	| 'google/gemini-pro'
	| 'google/gemini-flash-1.5'
	| 'anthropic/claude-3-haiku'
	| 'openai/gpt-4o-mini'

/** AI 配置接口 */
export interface AIConfig {
	/** 当前使用的 AI 提供商 */
	provider: AIProvider
	/** OpenRouter 配置 */
	openrouter?: {
		/** API Key */
		apiKey: string
		/** 使用的模型 */
		model: OpenRouterModel
		/** API 基础 URL */
		baseUrl: string
	}
}

/** 默认 AI 配置 */
const defaultConfig: AIConfig = {
	provider: (import.meta.env.VITE_AI_PROVIDER as AIProvider) || 'supabase',
	openrouter: {
		apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
		model:
			(import.meta.env.VITE_OPENROUTER_MODEL as OpenRouterModel) || 'google/gemini-2.0-flash-001',
		baseUrl: 'https://openrouter.ai/api/v1',
	},
}

/** 当前 AI 配置（运行时可修改） */
let currentConfig: AIConfig = { ...defaultConfig }

/**
 * 获取当前 AI 配置
 * @returns 当前 AI 配置
 */
export const getAIConfig = (): AIConfig => currentConfig

/**
 * 设置 AI 配置
 * @param config 部分配置，将与当前配置合并
 */
export const setAIConfig = (config: Partial<AIConfig>): void => {
	currentConfig = {
		...currentConfig,
		...config,
		openrouter: {
			...currentConfig.openrouter,
			...config.openrouter,
		} as AIConfig['openrouter'],
	}
}

/**
 * 重置为默认配置
 */
export const resetAIConfig = (): void => {
	currentConfig = { ...defaultConfig }
}

/**
 * 切换 AI 提供商
 * @param provider 提供商类型
 */
export const switchAIProvider = (provider: AIProvider): void => {
	currentConfig.provider = provider
}
