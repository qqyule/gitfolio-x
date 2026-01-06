/**
 * OpenRouter API 客户端
 * 用于调用 Gemini 等大模型进行代码分析
 */

import type { AIAnalysis, GitHubData } from '@/types/github'
import { getAIConfig } from './config'

/** OpenRouter API 响应类型 */
interface OpenRouterResponse {
	id: string
	choices: {
		message: {
			role: string
			content: string
		}
		finish_reason: string
	}[]
	usage: {
		prompt_tokens: number
		completion_tokens: number
		total_tokens: number
	}
}

/**
 * 构建代码分析 Prompt
 * @param githubData GitHub 数据
 * @returns 系统提示和用户提示
 */
const buildAnalysisPrompt = (githubData: GitHubData): { system: string; user: string } => {
	const system = `你是一位资深的技术招聘专家和代码审查专家。你需要分析开发者的 GitHub 数据，并生成一份专业的技术画像报告。

你的分析应该包含：
1. 技术总结（summary）：50-100 字的技术能力概述
2. 亮点（highlights）：3-5 个最突出的技术亮点
3. 技术画像（techProfile）：主要角色、专业领域、编码风格
4. 技能雷达（skills）：前端、后端、DevOps、算法、架构、文档能力评分（0-100）
5. 深度洞察（insights）：基于代码提交模式、项目类型等的分析
6. 建议（recommendations）：职业发展建议
7. 开发者个性（personality）：根据提交习惯推断的性格特点

请用 JSON 格式返回结果，格式如下：
{
  "summary": "技术总结",
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "techProfile": {
    "primaryRole": "主要角色（如：全栈开发者）",
    "expertise": ["专业领域1", "专业领域2"],
    "style": "编码风格描述"
  },
  "skills": {
    "frontend": 85,
    "backend": 70,
    "devops": 60,
    "algorithms": 75,
    "architecture": 80,
    "documentation": 65
  },
  "insights": ["洞察1", "洞察2"],
  "recommendations": ["建议1", "建议2"],
  "personality": "开发者个性描述"
}`

	const user = `请分析以下 GitHub 开发者数据：

## 用户信息
- 用户名：${githubData.user.login}
- 名称：${githubData.user.name || '未设置'}
- 简介：${githubData.user.bio || '未设置'}
- 位置：${githubData.user.location || '未设置'}
- 粉丝数：${githubData.user.followers}
- 关注数：${githubData.user.following}
- 注册时间：${githubData.user.createdAt}

## 统计数据
- 总仓库数：${githubData.stats.totalRepos}
- 总 Star 数：${githubData.stats.totalStars}
- 总 Fork 数：${githubData.stats.totalForks}
- 贡献总数：${githubData.contributions.total}

## 编程语言分布
${githubData.languages
	.slice(0, 10)
	.map((lang) => `- ${lang.name}: ${(lang.bytes / 1024).toFixed(1)} KB`)
	.join('\n')}

## 主要仓库（Top 10）
${githubData.repositories
	.slice(0, 10)
	.map(
		(repo) =>
			`- ${repo.name}: ${repo.description || '无描述'} (⭐${
				repo.stars
			}, 主语言: ${repo.language || '未知'})`
	)
	.join('\n')}

请返回 JSON 格式的分析结果。`

	return { system, user }
}

/**
 * 通过 OpenRouter 分析代码
 * @param githubData GitHub 数据
 * @returns AI 分析结果
 */
export const analyzeCodeWithOpenRouter = async (githubData: GitHubData): Promise<AIAnalysis> => {
	const config = getAIConfig()

	if (!config.openrouter?.apiKey) {
		throw new Error('OpenRouter API Key 未配置，请在环境变量中设置 VITE_OPENROUTER_API_KEY')
	}

	const { system, user } = buildAnalysisPrompt(githubData)

	const response = await fetch(`${config.openrouter.baseUrl}/chat/completions`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${config.openrouter.apiKey}`,
			'HTTP-Referer': window.location.origin,
			'X-Title': 'GitFolio X',
		},
		body: JSON.stringify({
			model: config.openrouter.model,
			messages: [
				{ role: 'system', content: system },
				{ role: 'user', content: user },
			],
			temperature: 0.7,
			max_tokens: 2000,
			response_format: { type: 'json_object' },
		}),
	})

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}))
		throw new Error(
			`OpenRouter API 请求失败: ${response.status} ${
				errorData.error?.message || response.statusText
			}`
		)
	}

	const data: OpenRouterResponse = await response.json()

	if (!data.choices?.[0]?.message?.content) {
		throw new Error('OpenRouter API 返回数据格式异常')
	}

	try {
		const analysis = JSON.parse(data.choices[0].message.content) as AIAnalysis
		return analysis
	} catch {
		throw new Error('AI 返回的数据无法解析为 JSON 格式')
	}
}
