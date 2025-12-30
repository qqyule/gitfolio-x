/**
 * GitHub 数据获取模块测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchGitHubData } from './github'

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
	supabase: {
		functions: {
			invoke: vi.fn(),
		},
	},
}))

describe('fetchGitHubData', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('应成功获取 GitHub 数据', async () => {
		const { supabase } = await import('@/integrations/supabase/client')
		const mockData = {
			user: { login: 'testuser', name: 'Test User' },
			repositories: [],
			languages: [],
			contributions: { total: 100 },
			stats: { totalRepos: 10 },
		}

		vi.mocked(supabase.functions.invoke).mockResolvedValue({
			data: mockData,
			error: null,
		})

		const result = await fetchGitHubData('testuser')

		expect(supabase.functions.invoke).toHaveBeenCalledWith('github-data', {
			body: { username: 'testuser' },
		})
		expect(result).toEqual(mockData)
	})

	it('应处理 Supabase 错误', async () => {
		const { supabase } = await import('@/integrations/supabase/client')

		vi.mocked(supabase.functions.invoke).mockResolvedValue({
			data: null,
			error: { message: '服务不可用' },
		})

		await expect(fetchGitHubData('testuser')).rejects.toThrow('服务不可用')
	})

	it('应处理数据层错误', async () => {
		const { supabase } = await import('@/integrations/supabase/client')

		vi.mocked(supabase.functions.invoke).mockResolvedValue({
			data: { error: '用户不存在' },
			error: null,
		})

		await expect(fetchGitHubData('nonexistent')).rejects.toThrow('用户不存在')
	})
})
