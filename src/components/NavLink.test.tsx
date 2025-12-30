/**
 * NavLink 组件测试
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NavLink } from './NavLink'

/**
 * 包装组件以提供路由上下文
 */
const renderWithRouter = (ui: React.ReactElement, initialEntries = ['/']) => {
	return render(
		<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
	)
}

describe('NavLink', () => {
	it('应正确渲染链接', () => {
		renderWithRouter(<NavLink to="/test">测试链接</NavLink>)

		expect(screen.getByText('测试链接')).toBeInTheDocument()
		expect(screen.getByRole('link')).toHaveAttribute('href', '/test')
	})

	it('应应用基础 className', () => {
		renderWithRouter(
			<NavLink to="/test" className="base-class">
				链接
			</NavLink>
		)

		expect(screen.getByRole('link')).toHaveClass('base-class')
	})

	it('当前路由时应应用 activeClassName', () => {
		renderWithRouter(
			<NavLink to="/" activeClassName="active-class">
				首页
			</NavLink>,
			['/']
		)

		expect(screen.getByRole('link')).toHaveClass('active-class')
	})

	it('非当前路由时不应应用 activeClassName', () => {
		renderWithRouter(
			<NavLink to="/other" activeClassName="active-class">
				其他
			</NavLink>,
			['/']
		)

		expect(screen.getByRole('link')).not.toHaveClass('active-class')
	})

	it('应正确转发其他 props', () => {
		renderWithRouter(
			<NavLink to="/test" data-testid="nav-link">
				链接
			</NavLink>
		)

		expect(screen.getByTestId('nav-link')).toBeInTheDocument()
	})
})
