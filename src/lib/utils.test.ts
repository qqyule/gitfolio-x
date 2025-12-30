/**
 * cn 工具函数测试
 */

import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
	it('应合并多个类名', () => {
		expect(cn('foo', 'bar')).toBe('foo bar')
	})

	it('应处理条件类名', () => {
		expect(cn('base', true && 'active', false && 'hidden')).toBe('base active')
	})

	it('应处理数组类名', () => {
		expect(cn(['foo', 'bar'])).toBe('foo bar')
	})

	it('应处理对象类名', () => {
		expect(cn({ active: true, disabled: false })).toBe('active')
	})

	it('应合并 Tailwind 冲突类', () => {
		// tailwind-merge 会合并冲突的类名
		expect(cn('px-2', 'px-4')).toBe('px-4')
		expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
	})

	it('应处理空输入', () => {
		expect(cn()).toBe('')
		expect(cn('')).toBe('')
		expect(cn(null, undefined)).toBe('')
	})

	it('应处理复杂嵌套输入', () => {
		expect(cn('base', ['foo', { bar: true }], { baz: true, qux: false })).toBe(
			'base foo bar baz'
		)
	})
})
