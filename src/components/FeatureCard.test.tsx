/**
 * FeatureCard 组件测试
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import FeatureCard from './FeatureCard'

describe('FeatureCard', () => {
	const defaultProps = {
		icon: <span data-testid="test-icon">🚀</span>,
		title: '测试标题',
		description: '测试描述内容',
	}

	it('应正确渲染标题和描述', () => {
		render(<FeatureCard {...defaultProps} />)

		expect(screen.getByText('测试标题')).toBeInTheDocument()
		expect(screen.getByText('测试描述内容')).toBeInTheDocument()
	})

	it('应正确渲染图标', () => {
		render(<FeatureCard {...defaultProps} />)

		expect(screen.getByTestId('test-icon')).toBeInTheDocument()
	})

	it('应应用自定义 className', () => {
		const { container } = render(<FeatureCard {...defaultProps} className="custom-class" />)

		expect(container.firstChild).toHaveClass('custom-class')
	})

	it('应应用动画延迟', () => {
		const { container } = render(<FeatureCard {...defaultProps} delay={200} />)

		expect(container.firstChild).toHaveStyle({ animationDelay: '200ms' })
	})

	it('默认延迟应为 0', () => {
		const { container } = render(<FeatureCard {...defaultProps} />)

		expect(container.firstChild).toHaveStyle({ animationDelay: '0ms' })
	})
})
