/**
 * RepoCard 组件测试
 */

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { Repository } from '@/types/github'
import RepoCard from './RepoCard'

describe('RepoCard', () => {
	const mockRepo: Repository = {
		name: 'test-repo',
		description: '这是一个测试仓库',
		url: 'https://github.com/test/test-repo',
		stars: 100,
		forks: 20,
		language: 'TypeScript',
		languageColor: '#3178c6',
		createdAt: '2023-01-01',
		updatedAt: '2024-01-01',
		pushedAt: '2024-01-01',
		commitCount: 50,
		recentCommits: [],
	}

	it('应正确渲染仓库名称', () => {
		render(<RepoCard repo={mockRepo} index={0} />)

		expect(screen.getByText('test-repo')).toBeInTheDocument()
	})

	it('应正确渲染描述', () => {
		render(<RepoCard repo={mockRepo} index={0} />)

		expect(screen.getByText('这是一个测试仓库')).toBeInTheDocument()
	})

	it('没有描述时应显示默认文本', () => {
		const repoWithoutDesc = { ...mockRepo, description: null }
		render(<RepoCard repo={repoWithoutDesc} index={0} />)

		expect(screen.getByText('暂无描述')).toBeInTheDocument()
	})

	it('应正确渲染星标数和 fork 数', () => {
		render(<RepoCard repo={mockRepo} index={0} />)

		expect(screen.getByText('100')).toBeInTheDocument()
		expect(screen.getByText('20')).toBeInTheDocument()
	})

	it('应正确渲染语言标签', () => {
		render(<RepoCard repo={mockRepo} index={0} />)

		expect(screen.getByText('TypeScript')).toBeInTheDocument()
	})

	it('应渲染为外部链接', () => {
		render(<RepoCard repo={mockRepo} index={0} />)

		const link = screen.getByRole('link')
		expect(link).toHaveAttribute('href', mockRepo.url)
		expect(link).toHaveAttribute('target', '_blank')
		expect(link).toHaveAttribute('rel', 'noopener noreferrer')
	})

	it('应根据 index 应用动画延迟', () => {
		const { container } = render(<RepoCard repo={mockRepo} index={2} />)

		expect(container.firstChild).toHaveStyle({ animationDelay: '200ms' })
	})
})
