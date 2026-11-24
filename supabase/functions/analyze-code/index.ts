import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GITHUB_USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/
const MAX_REQUEST_BYTES = 128 * 1024 // 128 KB max request payload
const AI_CACHE_TTL_HOURS = 168 // 7 days
const DEFAULT_GITHUB_CACHE_TTL_HOURS = 6

function truncateText(value: unknown, maxLength: number): string | undefined {
	if (typeof value !== 'string') return undefined
	const trimmed = value.trim()
	if (!trimmed) return undefined
	return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength)}...` : trimmed
}

function getGithubCacheTtlHours(): number {
	const envValue = Deno.env.get('GITHUB_CACHE_TTL_HOURS')
	if (envValue) {
		const parsed = Number.parseInt(envValue, 10)
		if (!Number.isNaN(parsed) && parsed > 0) {
			return parsed
		}
	}
	return DEFAULT_GITHUB_CACHE_TTL_HOURS
}

type VerifiedGithubResult =
	| { ok: true; data: any }
	| { ok: false; status: number; error: string }

async function loadVerifiedGithubData(
	supabase: ReturnType<typeof createClient>,
	supabaseUrl: string,
	supabaseServiceKey: string,
	normalizedUsername: string
): Promise<VerifiedGithubResult> {
	const cacheUsername = normalizedUsername.toLowerCase()

	// 1. Prefer fresh server-side cache written by github-data
	try {
		const { data: ghCacheRow, error: ghCacheError } = await supabase
			.from('github_cache')
			.select('data, updated_at')
			.eq('username', cacheUsername)
			.maybeSingle()

		if (!ghCacheError && ghCacheRow?.data?.user?.login) {
			const updatedAt = new Date(ghCacheRow.updated_at)
			const hoursDiff = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60)
			if (hoursDiff <= getGithubCacheTtlHours()) {
				console.log(`Using verified github_cache for ${cacheUsername}`)
				return { ok: true, data: ghCacheRow.data }
			}
		}
	} catch (err) {
		console.error('Error reading github_cache:', err)
	}

	// 2. Fall back to internal github-data Edge Function call using service role credentials
	const ghResponse = await fetch(`${supabaseUrl}/functions/v1/github-data`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${supabaseServiceKey}`,
			apikey: supabaseServiceKey,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username: normalizedUsername }),
	})

	const ghPayload = await ghResponse.json().catch(() => null)
	if (!ghResponse.ok) {
		const message =
			typeof ghPayload?.error === 'string'
				? ghPayload.error
				: `Failed to fetch verified GitHub data (status: ${ghResponse.status})`
		return { ok: false, status: ghResponse.status, error: message }
	}

	if (!ghPayload?.user?.login) {
		return { ok: false, status: 502, error: 'Verified GitHub data is incomplete' }
	}

	return { ok: true, data: ghPayload }
}

// 移除强制写死的 Lovable AI URL，改为在函数内部动态获取，并默认使用开源友好的 OpenRouter

serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders })
	}

	try {
		const contentLengthHeader = req.headers.get('content-length')
		if (contentLengthHeader) {
			const contentLength = Number.parseInt(contentLengthHeader, 10)
			if (!Number.isNaN(contentLength) && contentLength > MAX_REQUEST_BYTES) {
				return new Response(JSON.stringify({ error: 'Request payload too large' }), {
					status: 413,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			}
		}

		const rawBody = await req.text()
		if (new TextEncoder().encode(rawBody).length > MAX_REQUEST_BYTES) {
			return new Response(JSON.stringify({ error: 'Request payload too large' }), {
				status: 413,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		let body: any
		try {
			body = JSON.parse(rawBody)
		} catch {
			return new Response(JSON.stringify({ error: 'Invalid JSON request body' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		const rawUsername =
			typeof body?.username === 'string'
				? body.username
				: typeof body?.githubData?.user?.login === 'string'
					? body.githubData.user.login
					: ''

		const normalizedUsername = rawUsername.trim()
		if (!normalizedUsername || !GITHUB_USERNAME_REGEX.test(normalizedUsername)) {
			return new Response(JSON.stringify({ error: 'Valid GitHub username is required' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		const cacheUsername = normalizedUsername.toLowerCase()

		const AI_URL = Deno.env.get('AI_GATEWAY_URL') || 'https://openrouter.ai/api/v1/chat/completions'
		const API_KEY = Deno.env.get('OPENROUTER_API_KEY') || Deno.env.get('LOVABLE_API_KEY') || Deno.env.get('OPENAI_API_KEY')
		if (!API_KEY) {
			throw new Error('AI API Key is not configured (Please set OPENROUTER_API_KEY in Supabase secrets)')
		}

		console.log('Analyzing code for:', normalizedUsername)

		// 1. Initialize Supabase Client (required to verify GitHub data & prevent cache poisoning)
		const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
		if (!supabaseUrl || !supabaseServiceKey) {
			throw new Error('Supabase server credentials are not configured')
		}
		const supabase = createClient(supabaseUrl, supabaseServiceKey)

		// 2. Check AI Analysis Cache
		try {
			const { data: cachedRow, error: cacheError } = await supabase
				.from('ai_analysis_cache')
				.select('analysis_data, updated_at')
				.eq('username', cacheUsername)
				.maybeSingle()

			if (!cacheError && cachedRow) {
				const updatedAt = new Date(cachedRow.updated_at)
				const now = new Date()
				const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)

				// Cache TTL: 7 days (168 hours)
				if (hoursDiff <= AI_CACHE_TTL_HOURS) {
					console.log(`Cache hit for AI analysis of ${cacheUsername} (${hoursDiff.toFixed(1)} hours old)`)
					return new Response(JSON.stringify({ analysis: cachedRow.analysis_data, fromCache: true }), {
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					})
				}
				console.log(`Cache expired for AI analysis of ${cacheUsername}`)
			}
		} catch (err) {
			console.error('Error checking AI cache:', err)
		}

		// 3. Load server-verified GitHub data (never trust client-supplied githubData)
		const verifiedResult = await loadVerifiedGithubData(
			supabase,
			supabaseUrl,
			supabaseServiceKey,
			normalizedUsername
		)
		if (!verifiedResult.ok) {
			return new Response(JSON.stringify({ error: verifiedResult.error }), {
				status: verifiedResult.status,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}
		const githubData = verifiedResult.data

		// Prepare bounded context for AI analysis
		const analysisContext = {
			username: truncateText(githubData.user?.login, 40),
			name: truncateText(githubData.user?.name, 100),
			bio: truncateText(githubData.user?.bio, 300),
			totalRepos: githubData.stats?.totalRepos,
			totalStars: githubData.stats?.totalStars,
			totalContributions: githubData.contributions?.total,
			topLanguages: Array.isArray(githubData.languages)
				? githubData.languages.slice(0, 5).map((l: any) => truncateText(l?.name, 50)).filter(Boolean)
				: [],
			repositories: Array.isArray(githubData.repositories)
				? githubData.repositories.slice(0, 10).map((repo: any) => ({
					name: truncateText(repo?.name, 100),
					description: truncateText(repo?.description, 200),
					language: truncateText(repo?.language, 50),
					stars: repo?.stars,
					commitCount: repo?.commitCount,
					recentCommits: Array.isArray(repo?.recentCommits)
						? repo.recentCommits
							.slice(0, 5)
							.map((c: any) => truncateText(c?.message, 160))
							.filter(Boolean)
						: [],
				}))
				: [],
		}

		const systemPrompt = `你是一位资深的技术招聘专家和代码审计师。你的任务是分析开发者的 GitHub 数据，生成一份专业、有洞察力的技术画像报告。

分析维度：
1. **技术栈评估**: 基于语言使用情况评估技术广度和深度
2. **工程化能力**: 根据仓库结构、提交信息质量评估
3. **开发风格**: 分析提交模式、代码习惯
4. **项目影响力**: Star 数、Fork 数等社区认可度
5. **成长潜力**: 基于活跃度和学习新技术的迹象

输出要求：
- 使用招聘经理能理解的语言
- 既要专业又要有趣
- 突出亮点，委婉提及改进空间
- 包含具体的数据支撑`

		const userPrompt = `请分析以下开发者的 GitHub 数据并生成技术画像：

${JSON.stringify(analysisContext, null, 2)}

请返回以下 JSON 格式的分析结果：
{
  "summary": "3-5 句话的整体评价",
  "highlights": ["亮点1", "亮点2", "亮点3"],
  "techProfile": {
    "primaryRole": "主要技术方向（如：全栈工程师/前端专家/后端开发者）",
    "expertise": ["专长领域1", "专长领域2"],
    "style": "编程风格描述"
  },
  "skills": {
    "frontend": 0-100 的评分,
    "backend": 0-100 的评分,
    "devops": 0-100 的评分,
    "algorithms": 0-100 的评分,
    "architecture": 0-100 的评分,
    "documentation": 0-100 的评分
  },
  "insights": [
    "有趣的发现1",
    "有趣的发现2"
  ],
  "recommendations": ["建议1", "建议2"],
  "personality": "基于提交时间和风格推测的开发者性格（如：夜猫子极客/严谨工程师）"
}`

		// Call Lovable AI with tool calling for structured output and retry logic
		let response
		let lastError
		const MAX_RETRIES = 3

		for (let i = 0; i < MAX_RETRIES; i++) {
			try {
				response = await fetch(AI_URL, {
					method: 'POST',
					headers: {
						Authorization: `Bearer ${API_KEY}`,
						'Content-Type': 'application/json',
						'HTTP-Referer': 'https://gitfolio.qqyule.top', // Required by OpenRouter
						'X-Title': 'GitFolio X', // Required by OpenRouter
					},
					body: JSON.stringify({
						model: 'google/gemini-2.5-flash',
						messages: [
							{ role: 'system', content: systemPrompt },
							{ role: 'user', content: userPrompt },
						],
						tools: [
							{
								type: 'function',
								function: {
									name: 'generate_tech_profile',
									description: 'Generate a structured technical profile analysis',
									parameters: {
										type: 'object',
										properties: {
											summary: {
												type: 'string',
												description: '3-5 sentences overall evaluation',
											},
											highlights: {
												type: 'array',
												items: { type: 'string' },
												description: 'Key highlights of the developer',
											},
											techProfile: {
												type: 'object',
												properties: {
													primaryRole: { type: 'string' },
													expertise: {
														type: 'array',
														items: { type: 'string' },
													},
													style: { type: 'string' },
												},
												required: ['primaryRole', 'expertise', 'style'],
											},
											skills: {
												type: 'object',
												properties: {
													frontend: {
														type: 'number',
														minimum: 0,
														maximum: 100,
													},
													backend: { type: 'number', minimum: 0, maximum: 100 },
													devops: { type: 'number', minimum: 0, maximum: 100 },
													algorithms: {
														type: 'number',
														minimum: 0,
														maximum: 100,
													},
													architecture: {
														type: 'number',
														minimum: 0,
														maximum: 100,
													},
													documentation: {
														type: 'number',
														minimum: 0,
														maximum: 100,
													},
												},
												required: [
													'frontend',
													'backend',
													'devops',
													'algorithms',
													'architecture',
													'documentation',
												],
											},
											insights: {
												type: 'array',
												items: { type: 'string' },
												description: 'Interesting findings about the developer',
											},
											recommendations: {
												type: 'array',
												items: { type: 'string' },
												description: 'Suggestions for improvement',
											},
											personality: {
												type: 'string',
												description: 'Inferred developer personality',
											},
										},
										required: [
											'summary',
											'highlights',
											'techProfile',
											'skills',
											'insights',
											'recommendations',
											'personality',
										],
									},
								},
							},
						],
						tool_choice: {
							type: 'function',
							function: { name: 'generate_tech_profile' },
						},
					}),
				})

				if (response.ok) break

				// Don't retry client errors that are unlikely to succeed on retry (except 429)
				if (response.status === 400 || response.status === 401 || response.status === 402) {
					break
				}

				console.log(`Attempt ${i + 1} failed with status ${response.status}`)
			} catch (error) {
				console.error(`Attempt ${i + 1} failed with error:`, error)
				lastError = error
			}

			if (i < MAX_RETRIES - 1) {
				const delay = 1000 * 2 ** i
				await new Promise((resolve) => setTimeout(resolve, delay))
			}
		}

		if (!response) {
			throw lastError || new Error('All retry attempts failed')
		}

		if (!response.ok) {
			const errorText = await response.text()
			console.error('Lovable AI error:', response.status, errorText)

			if (response.status === 429) {
				return new Response(JSON.stringify({ error: '请求过于频繁，请稍后再试' }), {
					status: 429,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			}
			if (response.status === 402) {
				return new Response(JSON.stringify({ error: 'AI 配额已用尽，请添加额度' }), {
					status: 402,
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			}

			throw new Error('AI analysis failed')
		}

		const aiResponse = await response.json()
		console.log('AI response received')

		// Extract the tool call result
		let analysis
		const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0]

		if (toolCall?.function?.arguments) {
			try {
				analysis = JSON.parse(toolCall.function.arguments)
			} catch (e) {
				console.error('Failed to parse tool call arguments:', e)
				// Fallback: try to extract from content
				const content = aiResponse.choices?.[0]?.message?.content
				if (content) {
					const jsonMatch = content.match(/\{[\s\S]*\}/)
					if (jsonMatch) {
						analysis = JSON.parse(jsonMatch[0])
					}
				}
			}
		}

		if (!analysis) {
			// Generate a fallback analysis
			analysis = generateFallbackAnalysis(githubData)
		}

		// 4. Save verified analysis to cache
		const { error: saveCacheError } = await supabase
			.from('ai_analysis_cache')
			.upsert(
				{
					username: cacheUsername,
					analysis_data: analysis,
					updated_at: new Date().toISOString(),
				},
				{ onConflict: 'username' }
			)

		if (saveCacheError) {
			console.error('Failed to update AI cache:', saveCacheError)
		} else {
			console.log(`Successfully cached AI analysis for ${cacheUsername}`)
		}

		return new Response(JSON.stringify({ analysis, fromCache: false }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	} catch (error) {
		console.error('Error analyzing code:', error)
		const errorMessage = error instanceof Error ? error.message : 'Failed to analyze code'
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}
})

function generateFallbackAnalysis(githubData: any) {
	const topLang = githubData.languages?.[0]?.name || 'JavaScript'
	const isMoreFrontend = ['TypeScript', 'JavaScript', 'Vue', 'CSS', 'HTML'].includes(topLang)

	return {
		summary: `${githubData.user?.name || githubData.user?.login} 是一位活跃的开发者，拥有 ${
			githubData.stats?.totalRepos || 0
		} 个公开仓库，主要使用 ${topLang} 进行开发。`,
		highlights: [
			`掌握 ${
				githubData.languages
					?.slice(0, 3)
					.map((l: any) => l.name)
					.join('、') || '多种'
			} 编程语言`,
			`累计获得 ${githubData.stats?.totalStars || 0} 个 Star`,
			`${githubData.contributions?.total || 0} 次贡献记录`,
		],
		techProfile: {
			primaryRole: isMoreFrontend ? '前端开发工程师' : '后端开发工程师',
			expertise: githubData.languages?.slice(0, 3).map((l: any) => l.name) || ['JavaScript'],
			style: '追求代码质量',
		},
		skills: {
			frontend: isMoreFrontend ? 75 : 45,
			backend: isMoreFrontend ? 50 : 70,
			devops: 40,
			algorithms: 55,
			architecture: 50,
			documentation: 45,
		},
		insights: [
			`最活跃的项目是 ${githubData.repositories?.[0]?.name || '未知'}`,
			`偏好使用 ${topLang} 技术栈`,
		],
		recommendations: ['可以尝试为项目添加更详细的文档', '考虑参与更多开源社区贡献'],
		personality: '热爱编程的技术探索者',
	}
}
