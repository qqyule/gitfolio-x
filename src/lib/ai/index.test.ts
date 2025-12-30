/**
 * AI 服务统一入口测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GitHubData, AIAnalysis } from '@/types/github'

// Mock 配置模块
vi.mock('./config', () => ({
	getAIConfig: vi.fn(),
}))

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
	supabase: {
		functions: {
			invoke: vi.fn(),
		},
	},
}))

// Mock OpenRouter
vi.mock('./openrouter', () => ({
	analyzeCodeWithOpenRouter: vi.fn(),
}))

// 在 mock 设置后导入
import { analyzeCode, analyzeCodeWith } from './index'
import { getAIConfig } from './config'
import { analyzeCodeWithOpenRouter } from './openrouter'

describe('AI Service', () => {
	const mockGitHubData: GitHubData = {
		user: {
			login: 'testuser',
			name: 'Test User',
			bio: null,
			avatarUrl: 'https://example.com/avatar.png',
			location: null,
			company: null,
			createdAt: '2020-01-01',
			followers: 100,
			following: 50,
		},
		repositories: [],
		languages: [],
		contributions: {
			total: 500,
			commits: 300,
			pullRequests: 100,
			issues: 100,
			heatmap: [],
		},
		stats: {
			totalRepos: 20,
			totalStars: 100,
			totalForks: 20,
		},
	}

	const mockAnalysis: AIAnalysis = {
		summary: '测试摘要',
		highlights: ['亮点1', '亮点2'],
		techProfile: {
			primaryRole: '全栈开发者',
			expertise: ['React', 'Node.js'],
			style: '注重代码质量',
		},
		skills: {
			frontend: 90,
			backend: 80,
			devops: 70,
			algorithms: 75,
			architecture: 85,
			documentation: 80,
		},
		insights: ['洞察1'],
		recommendations: ['建议1'],
		personality: '专注高效',
	}

	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe('analyzeCode', () => {
		it('使用 supabase provider 时应调用 Supabase 服务', async () => {
			const { supabase } = await import('@/integrations/supabase/client')

			vi.mocked(getAIConfig).mockReturnValue({ provider: 'supabase' })
			vi.mocked(supabase.functions.invoke).mockResolvedValue({
				data: { analysis: mockAnalysis },
				error: null,
			})

			const result = await analyzeCode(mockGitHubData)

			expect(getAIConfig).toHaveBeenCalled()
			expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-code', {
				body: { githubData: mockGitHubData },
			})
			expect(result).toEqual(mockAnalysis)
		})

		it('使用 openrouter provider 时应调用 OpenRouter 服务', async () => {
			vi.mocked(getAIConfig).mockReturnValue({ provider: 'openrouter' })
			vi.mocked(analyzeCodeWithOpenRouter).mockResolvedValue(mockAnalysis)

			const result = await analyzeCode(mockGitHubData)

			expect(analyzeCodeWithOpenRouter).toHaveBeenCalledWith(mockGitHubData)
			expect(result).toEqual(mockAnalysis)
		})
	})

	describe('analyzeCodeWith', () => {
		it('应使用指定的 provider', async () => {
			vi.mocked(analyzeCodeWithOpenRouter).mockResolvedValue(mockAnalysis)

			const result = await analyzeCodeWith('openrouter', mockGitHubData)

			expect(analyzeCodeWithOpenRouter).toHaveBeenCalledWith(mockGitHubData)
			expect(result).toEqual(mockAnalysis)
		})

		it('不支持的 provider 应抛出错误', async () => {
			await expect(
				analyzeCodeWith('invalid' as never, mockGitHubData)
			).rejects.toThrow('不支持的 AI 提供商')
		})
	})
})
