/**
 * GitHubInput 组件测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import GitHubInput from './GitHubInput'

// Mock react-router-dom 的 useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom')
	return {
		...actual,
		useNavigate: () => mockNavigate,
	}
})

// Mock sonner
vi.mock('sonner', () => ({
	toast: {
		error: vi.fn(),
	},
}))

/**
 * 包装组件以提供路由上下文
 */
const renderWithRouter = (ui: React.ReactElement) => {
	return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('GitHubInput', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('应正确渲染输入框和按钮', () => {
		renderWithRouter(<GitHubInput />)

		expect(
			screen.getByPlaceholderText('输入 GitHub 用户名')
		).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /生成宇宙/i })
		).toBeInTheDocument()
	})

	it('应渲染示例用户按钮', () => {
		renderWithRouter(<GitHubInput />)

		expect(screen.getByText('@torvalds')).toBeInTheDocument()
		expect(screen.getByText('@gaearon')).toBeInTheDocument()
		expect(screen.getByText('@yyx990803')).toBeInTheDocument()
	})

	it('点击示例用户应填充输入框', async () => {
		const user = userEvent.setup()
		renderWithRouter(<GitHubInput />)

		await user.click(screen.getByText('@torvalds'))

		expect(screen.getByPlaceholderText('输入 GitHub 用户名')).toHaveValue(
			'torvalds'
		)
	})

	it('输入用户名应更新输入框值', async () => {
		const user = userEvent.setup()
		renderWithRouter(<GitHubInput />)

		const input = screen.getByPlaceholderText('输入 GitHub 用户名')
		await user.type(input, 'testuser')

		expect(input).toHaveValue('testuser')
	})

	it('提交空用户名应显示错误', async () => {
		const { toast } = await import('sonner')
		renderWithRouter(<GitHubInput />)

		const button = screen.getByRole('button', { name: /生成宇宙/i })
		fireEvent.click(button)

		expect(toast.error).toHaveBeenCalledWith('请输入 GitHub 用户名')
	})

	it('提交有效用户名应导航到 profile 页面', async () => {
		const user = userEvent.setup()
		renderWithRouter(<GitHubInput />)

		const input = screen.getByPlaceholderText('输入 GitHub 用户名')
		await user.type(input, 'testuser')

		const button = screen.getByRole('button', { name: /生成宇宙/i })
		await user.click(button)

		// 等待导航被调用（setTimeout 500ms 后）
		await waitFor(
			() => {
				expect(mockNavigate).toHaveBeenCalledWith('/profile?user=testuser')
			},
			{ timeout: 1000 }
		)
	})
})
