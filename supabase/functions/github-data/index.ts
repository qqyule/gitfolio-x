import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers':
		'authorization, x-client-info, apikey, content-type',
}

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'
const GITHUB_REST_URL = 'https://api.github.com'

// Get cache TTL from environment, default to 6 hours
function getCacheTTLHours(): number {
	const envValue = Deno.env.get('GITHUB_CACHE_TTL_HOURS')
	if (envValue) {
		const parsed = parseInt(envValue, 10)
		if (!isNaN(parsed) && parsed > 0) {
			return parsed
		}
	}
	return 6 // Default 6 hours
}

// Initialize Supabase client
function getSupabaseClient() {
	return createClient(
		Deno.env.get('SUPABASE_URL') ?? '',
		Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
	)
}

// Check cache for user data
async function getCachedData(username: string): Promise<any | null> {
	const supabase = getSupabaseClient()
	const { data, error } = await supabase
		.from('github_cache')
		.select('data, updated_at')
		.eq('username', username.toLowerCase())
		.maybeSingle()

	if (error || !data) {
		console.log(`Cache miss for ${username}`)
		return null
	}

	// Check if cache is still valid
	const updatedAt = new Date(data.updated_at)
	const now = new Date()
	const hoursDiff = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60)
	const cacheTTL = getCacheTTLHours()

	if (hoursDiff > cacheTTL) {
		console.log(`Cache expired for ${username} (${hoursDiff.toFixed(1)} hours old, TTL: ${cacheTTL}h)`)
		return null
	}

	console.log(`Cache hit for ${username} (${hoursDiff.toFixed(1)} hours old)`)
	return data.data
}

// Save data to cache
async function setCachedData(username: string, data: any): Promise<void> {
	const supabase = getSupabaseClient()
	const { error } = await supabase
		.from('github_cache')
		.upsert(
			{ username: username.toLowerCase(), data },
			{ onConflict: 'username' }
		)

	if (error) {
		console.error('Failed to cache data:', error)
	} else {
		console.log(`Cached data for ${username}`)
	}
}

// Retry fetch with exponential backoff for temporary errors
async function fetchWithRetry(
	url: string, 
	options: RequestInit, 
	maxRetries = 3
): Promise<Response> {
	let lastError: Error | null = null
	
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			const response = await fetch(url, options)
			
			// Retry on 502, 503, 504 (temporary server errors)
			if ([502, 503, 504].includes(response.status)) {
				console.log(`Attempt ${attempt + 1}: Got ${response.status}, retrying...`)
				if (attempt < maxRetries - 1) {
					await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
					continue
				}
			}
			
			return response
		} catch (error) {
			console.error(`Attempt ${attempt + 1} failed:`, error)
			lastError = error instanceof Error ? error : new Error(String(error))
			
			if (attempt < maxRetries - 1) {
				await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
			}
		}
	}
	
	throw lastError || new Error('All retry attempts failed')
}

// GraphQL query for user data
const USER_QUERY = `
query($username: String!) {
  user(login: $username) {
    login
    name
    bio
    avatarUrl
    location
    company
    createdAt
    followers {
      totalCount
    }
    following {
      totalCount
    }
    repositories(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}, ownerAffiliations: OWNER) {
      totalCount
      nodes {
        name
        description
        url
        stargazerCount
        forkCount
        primaryLanguage {
          name
          color
        }
        languages(first: 5) {
          edges {
            size
            node {
              name
              color
            }
          }
        }
        createdAt
        updatedAt
        pushedAt
        isPrivate
        defaultBranchRef {
          target {
            ... on Commit {
              history(first: 100) {
                totalCount
                nodes {
                  committedDate
                  message
                  additions
                  deletions
                }
              }
            }
          }
        }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            contributionCount
            date
            weekday
          }
        }
      }
    }
  }
}
`

serve(async (req) => {
	if (req.method === 'OPTIONS') {
		return new Response(null, { headers: corsHeaders })
	}

	try {
		const { username, forceRefresh } = await req.json()

		if (!username) {
			return new Response(JSON.stringify({ error: 'Username is required' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		console.log(`Fetching GitHub data for: ${username}`)

		// Check cache first (unless force refresh)
		if (!forceRefresh) {
			const cachedData = await getCachedData(username)
			if (cachedData) {
				console.log('Returning cached data')
				return new Response(JSON.stringify({ ...cachedData, fromCache: true }), {
					headers: { ...corsHeaders, 'Content-Type': 'application/json' },
				})
			}
		}

		// Try GraphQL first (requires token for better rate limits)
		const githubToken = Deno.env.get('GITHUB_TOKEN')
		console.log(`GitHub token configured: ${!!githubToken}`)
		let userData

		if (githubToken) {
			// Use GraphQL API with token
			const graphqlResponse = await fetchWithRetry(GITHUB_GRAPHQL_URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${githubToken}`,
					'Content-Type': 'application/json',
					'User-Agent': 'GitFolio-App',
				},
				body: JSON.stringify({
					query: USER_QUERY,
					variables: { username },
				}),
			})

			// Check if response is valid JSON
			const contentType = graphqlResponse.headers.get('content-type')
			if (!contentType?.includes('application/json')) {
				console.error('GraphQL response is not JSON, status:', graphqlResponse.status)
				const textResponse = await graphqlResponse.text()
				console.error('Response preview:', textResponse.substring(0, 200))
				throw new Error(`GitHub API returned non-JSON response (status: ${graphqlResponse.status})`)
			}

			const graphqlData = await graphqlResponse.json()

			if (graphqlData.errors) {
				console.error('GraphQL errors:', graphqlData.errors)
				throw new Error(
					graphqlData.errors[0]?.message || 'GraphQL query failed'
				)
			}

			userData = graphqlData.data?.user
		} else {
			// Fallback to REST API (no token needed for public data)
			console.log('No GitHub token, using REST API')

			// Fetch user profile
			const userResponse = await fetchWithRetry(`${GITHUB_REST_URL}/users/${username}`, {
				headers: { 
					Accept: 'application/vnd.github.v3+json',
					'User-Agent': 'GitFolio-App',
				},
			})

			if (!userResponse.ok) {
				if (userResponse.status === 404) {
					return new Response(JSON.stringify({ error: 'User not found' }), {
						status: 404,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					})
				}
				if (userResponse.status === 403) {
					return new Response(JSON.stringify({ error: 'GitHub API rate limit exceeded. Please try again later.' }), {
						status: 429,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					})
				}
				throw new Error(`GitHub API error: ${userResponse.status}`)
			}

			// Check content type before parsing JSON
			const contentType = userResponse.headers.get('content-type')
			if (!contentType?.includes('application/json')) {
				const textResponse = await userResponse.text()
				console.error('User response is not JSON:', textResponse.substring(0, 200))
				throw new Error('GitHub API returned invalid response format')
			}

			const userProfile = await userResponse.json()

			// Fetch repos
			const reposResponse = await fetchWithRetry(
				`${GITHUB_REST_URL}/users/${username}/repos?sort=updated&per_page=20`,
				{ 
					headers: { 
						Accept: 'application/vnd.github.v3+json',
						'User-Agent': 'GitFolio-App',
					} 
				}
			)
			
			if (!reposResponse.ok) {
				console.error('Failed to fetch repos:', reposResponse.status)
				// Continue with empty repos rather than failing
			}
			
			const reposContentType = reposResponse.headers.get('content-type')
			const repos = reposResponse.ok && reposContentType?.includes('application/json') 
				? await reposResponse.json() 
				: []

			// Fetch languages for each repo (with error handling)
			const reposWithLanguages = await Promise.all(
				(Array.isArray(repos) ? repos.slice(0, 10) : []).map(async (repo: any) => {
					try {
						const langResponse = await fetchWithRetry(repo.languages_url, {
							headers: { 
								Accept: 'application/vnd.github.v3+json',
								'User-Agent': 'GitFolio-App',
							},
						})
						if (!langResponse.ok) return repo
						const langContentType = langResponse.headers.get('content-type')
						if (!langContentType?.includes('application/json')) return repo
						const languages = await langResponse.json()
						return { ...repo, languageBreakdown: languages }
					} catch {
						return repo
					}
				})
			)

			// Transform to match GraphQL structure
			userData = {
				login: userProfile.login,
				name: userProfile.name,
				bio: userProfile.bio,
				avatarUrl: userProfile.avatar_url,
				location: userProfile.location,
				company: userProfile.company,
				createdAt: userProfile.created_at,
				followers: { totalCount: userProfile.followers },
				following: { totalCount: userProfile.following },
				repositories: {
					totalCount: userProfile.public_repos,
					nodes: reposWithLanguages.map((repo: any) => ({
						name: repo.name,
						description: repo.description,
						url: repo.html_url,
						stargazerCount: repo.stargazers_count,
						forkCount: repo.forks_count,
						primaryLanguage: repo.language
							? { name: repo.language, color: getLanguageColor(repo.language) }
							: null,
						languages: {
							edges: Object.entries(repo.languageBreakdown || {}).map(
								([name, size]) => ({
									size,
									node: { name, color: getLanguageColor(name) },
								})
							),
						},
						createdAt: repo.created_at,
						updatedAt: repo.updated_at,
						pushedAt: repo.pushed_at,
						isPrivate: repo.private,
					})),
				},
				contributionsCollection: {
					totalCommitContributions: 0,
					totalPullRequestContributions: 0,
					totalIssueContributions: 0,
				},
			}
		}

		if (!userData) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		// Process and aggregate language statistics
		const languageStats: Record<string, { bytes: number; color: string }> = {}

		userData.repositories?.nodes?.forEach((repo: any) => {
			repo.languages?.edges?.forEach((edge: any) => {
				const langName = edge.node.name
				if (!languageStats[langName]) {
					languageStats[langName] = {
						bytes: 0,
						color: edge.node.color || getLanguageColor(langName),
					}
				}
				languageStats[langName].bytes += edge.size || 0
			})
		})

		// Sort languages by usage
		const sortedLanguages = Object.entries(languageStats)
			.sort(([, a], [, b]) => b.bytes - a.bytes)
			.map(([name, data]) => ({ name, ...data }))

		// Calculate contribution heatmap data
		const contributionData =
			userData.contributionsCollection?.contributionCalendar?.weeks?.flatMap(
				(week: any) =>
					week.contributionDays.map((day: any) => ({
						date: day.date,
						count: day.contributionCount,
						weekday: day.weekday,
					}))
			) || []

		const response = {
			user: {
				login: userData.login,
				name: userData.name,
				bio: userData.bio,
				avatarUrl: userData.avatarUrl,
				location: userData.location,
				company: userData.company,
				createdAt: userData.createdAt,
				followers: userData.followers?.totalCount || 0,
				following: userData.following?.totalCount || 0,
			},
			repositories:
				userData.repositories?.nodes?.map((repo: any) => ({
					name: repo.name,
					description: repo.description,
					url: repo.url,
					stars: repo.stargazerCount,
					forks: repo.forkCount,
					language: repo.primaryLanguage?.name,
					languageColor: repo.primaryLanguage?.color,
					createdAt: repo.createdAt,
					updatedAt: repo.updatedAt,
					pushedAt: repo.pushedAt,
					commitCount: repo.defaultBranchRef?.target?.history?.totalCount || 0,
					recentCommits:
						repo.defaultBranchRef?.target?.history?.nodes?.slice(0, 10) || [],
				})) || [],
			languages: sortedLanguages,
			contributions: {
				total:
					userData.contributionsCollection?.contributionCalendar
						?.totalContributions || 0,
				commits:
					userData.contributionsCollection?.totalCommitContributions || 0,
				pullRequests:
					userData.contributionsCollection?.totalPullRequestContributions || 0,
				issues: userData.contributionsCollection?.totalIssueContributions || 0,
				heatmap: contributionData,
			},
			stats: {
				totalRepos: userData.repositories?.totalCount || 0,
				totalStars:
					userData.repositories?.nodes?.reduce(
						(sum: number, repo: any) => sum + (repo.stargazerCount || 0),
						0
					) || 0,
				totalForks:
					userData.repositories?.nodes?.reduce(
						(sum: number, repo: any) => sum + (repo.forkCount || 0),
						0
					) || 0,
			},
		}

		console.log('Successfully fetched GitHub data')

		// Cache the response in background (don't await)
		setCachedData(username, response).catch(err => 
			console.error('Background cache failed:', err)
		)

		return new Response(JSON.stringify({ ...response, fromCache: false }), {
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	} catch (error) {
		console.error('Error fetching GitHub data:', error)
		const errorMessage =
			error instanceof Error ? error.message : 'Failed to fetch GitHub data'
		return new Response(JSON.stringify({ error: errorMessage }), {
			status: 500,
			headers: { ...corsHeaders, 'Content-Type': 'application/json' },
		})
	}
})

// Language color mapping
function getLanguageColor(language: string): string {
	const colors: Record<string, string> = {
		TypeScript: '#3178c6',
		JavaScript: '#f1e05a',
		Python: '#3572A5',
		Java: '#b07219',
		'C++': '#f34b7d',
		C: '#555555',
		Go: '#00ADD8',
		Rust: '#dea584',
		Ruby: '#701516',
		PHP: '#4F5D95',
		Swift: '#F05138',
		Kotlin: '#A97BFF',
		Dart: '#00B4AB',
		Vue: '#41b883',
		HTML: '#e34c26',
		CSS: '#563d7c',
		Shell: '#89e051',
		Dockerfile: '#384d54',
	}
	return colors[language] || '#8b949e'
}
