/**
 * AI 配置模块测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
	getAIConfig,
	setAIConfig,
	resetAIConfig,
	switchAIProvider,
	type AIConfig,
} from './config'

describe('AI Config', () => {
	beforeEach(() => {
		// 每个测试前重置配置
		resetAIConfig()
	})

	describe('getAIConfig', () => {
		it('应返回当前配置', () => {
			const config = getAIConfig()
			expect(config).toBeDefined()
			expect(config.provider).toBeDefined()
		})

		it('默认 provider 应为 supabase', () => {
			const config = getAIConfig()
			expect(config.provider).toBe('supabase')
		})
	})

	describe('setAIConfig', () => {
		it('应更新 provider', () => {
			setAIConfig({ provider: 'openrouter' })
			expect(getAIConfig().provider).toBe('openrouter')
		})

		it('应合并 openrouter 配置', () => {
			setAIConfig({
				openrouter: {
					apiKey: 'test-key',
					model: 'google/gemini-pro',
					baseUrl: 'https://example.com',
				},
			})

			const config = getAIConfig()
			expect(config.openrouter?.apiKey).toBe('test-key')
			expect(config.openrouter?.model).toBe('google/gemini-pro')
		})

		it('应部分更新 openrouter 配置', () => {
			const originalConfig = getAIConfig()
			const originalBaseUrl = originalConfig.openrouter?.baseUrl

			setAIConfig({
				openrouter: {
					apiKey: 'new-key',
					model: 'google/gemini-pro',
					baseUrl: 'https://example.com',
				},
			})

			// 先设置完整配置
			setAIConfig({
				openrouter: {
					apiKey: 'updated-key',
					model: 'google/gemini-pro',
					baseUrl: 'https://example.com',
				},
			})

			const config = getAIConfig()
			expect(config.openrouter?.apiKey).toBe('updated-key')
		})
	})

	describe('resetAIConfig', () => {
		it('应重置为默认配置', () => {
			// 修改配置
			setAIConfig({ provider: 'openrouter' })
			expect(getAIConfig().provider).toBe('openrouter')

			// 重置
			resetAIConfig()
			expect(getAIConfig().provider).toBe('supabase')
		})
	})

	describe('switchAIProvider', () => {
		it('应切换到 openrouter', () => {
			switchAIProvider('openrouter')
			expect(getAIConfig().provider).toBe('openrouter')
		})

		it('应切换到 supabase', () => {
			switchAIProvider('openrouter')
			switchAIProvider('supabase')
			expect(getAIConfig().provider).toBe('supabase')
		})
	})
})
