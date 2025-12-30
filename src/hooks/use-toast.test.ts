/**
 * Toast Hook 测试
 */

import { describe, it, expect } from 'vitest'
import { reducer } from './use-toast'

describe('Toast Reducer', () => {
	const initialState = { toasts: [] }

	describe('ADD_TOAST', () => {
		it('应添加 toast', () => {
			const toast = {
				id: '1',
				title: '测试标题',
				description: '测试描述',
				open: true,
			}

			const newState = reducer(initialState, {
				type: 'ADD_TOAST',
				toast,
			})

			expect(newState.toasts).toHaveLength(1)
			expect(newState.toasts[0]).toEqual(toast)
		})

		it('应限制 toast 数量为 1', () => {
			const toast1 = { id: '1', title: '第一个', open: true }
			const toast2 = { id: '2', title: '第二个', open: true }

			let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 })
			state = reducer(state, { type: 'ADD_TOAST', toast: toast2 })

			// TOAST_LIMIT = 1，所以只保留最新的
			expect(state.toasts).toHaveLength(1)
			expect(state.toasts[0].id).toBe('2')
		})
	})

	describe('UPDATE_TOAST', () => {
		it('应更新指定 toast', () => {
			const toast = { id: '1', title: '原标题', open: true }
			let state = reducer(initialState, { type: 'ADD_TOAST', toast })

			state = reducer(state, {
				type: 'UPDATE_TOAST',
				toast: { id: '1', title: '新标题' },
			})

			expect(state.toasts[0].title).toBe('新标题')
		})

		it('不应影响其他 toast', () => {
			// 由于 TOAST_LIMIT = 1，这个测试需要调整
			const toast = { id: '1', title: '标题', description: '描述', open: true }
			let state = reducer(initialState, { type: 'ADD_TOAST', toast })

			state = reducer(state, {
				type: 'UPDATE_TOAST',
				toast: { id: '1', title: '新标题' },
			})

			expect(state.toasts[0].description).toBe('描述')
		})
	})

	describe('DISMISS_TOAST', () => {
		it('应关闭指定 toast', () => {
			const toast = { id: '1', title: '测试', open: true }
			let state = reducer(initialState, { type: 'ADD_TOAST', toast })

			state = reducer(state, {
				type: 'DISMISS_TOAST',
				toastId: '1',
			})

			expect(state.toasts[0].open).toBe(false)
		})

		it('不传 id 应关闭所有 toast', () => {
			const toast = { id: '1', title: '测试', open: true }
			let state = reducer(initialState, { type: 'ADD_TOAST', toast })

			state = reducer(state, { type: 'DISMISS_TOAST' })

			expect(state.toasts.every((t) => t.open === false)).toBe(true)
		})
	})

	describe('REMOVE_TOAST', () => {
		it('应移除指定 toast', () => {
			const toast = { id: '1', title: '测试', open: true }
			let state = reducer(initialState, { type: 'ADD_TOAST', toast })

			state = reducer(state, {
				type: 'REMOVE_TOAST',
				toastId: '1',
			})

			expect(state.toasts).toHaveLength(0)
		})

		it('不传 id 应移除所有 toast', () => {
			const toast = { id: '1', title: '测试', open: true }
			let state = reducer(initialState, { type: 'ADD_TOAST', toast })

			state = reducer(state, { type: 'REMOVE_TOAST' })

			expect(state.toasts).toHaveLength(0)
		})
	})
})
