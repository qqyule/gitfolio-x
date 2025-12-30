import 'https://deno.land/x/xhr@0.1.0/mod.ts'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers':
		'authorization, x-client-info, apikey, content-type',
}

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'
const GITHUB_REST_URL = 'https://api.github.com'

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
		const { username } = await req.json()

		if (!username) {
			return new Response(JSON.stringify({ error: 'Username is required' }), {
				status: 400,
				headers: { ...corsHeaders, 'Content-Type': 'application/json' },
			})
		}

		console.log(`Fetching GitHub data for: ${username}`)

		// Try GraphQL first (requires token for better rate limits)
		const githubToken = Deno.env.get('GITHUB_TOKEN')
		console.log(`GitHub token: ${githubToken}`)
		let userData

		if (githubToken) {
			// Use GraphQL API with token
			const graphqlResponse = await fetch(GITHUB_GRAPHQL_URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${githubToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					query: USER_QUERY,
					variables: { username },
				}),
			})

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
			const userResponse = await fetch(`${GITHUB_REST_URL}/users/${username}`, {
				headers: { Accept: 'application/vnd.github.v3+json' },
			})

			if (!userResponse.ok) {
				if (userResponse.status === 404) {
					return new Response(JSON.stringify({ error: 'User not found' }), {
						status: 404,
						headers: { ...corsHeaders, 'Content-Type': 'application/json' },
					})
				}
				throw new Error(`GitHub API error: ${userResponse.status}`)
			}

			const userProfile = await userResponse.json()

			// Fetch repos
			const reposResponse = await fetch(
				`${GITHUB_REST_URL}/users/${username}/repos?sort=updated&per_page=20`,
				{ headers: { Accept: 'application/vnd.github.v3+json' } }
			)
			const repos = await reposResponse.json()

			// Fetch languages for each repo
			const reposWithLanguages = await Promise.all(
				repos.slice(0, 10).map(async (repo: any) => {
					try {
						const langResponse = await fetch(repo.languages_url, {
							headers: { Accept: 'application/vnd.github.v3+json' },
						})
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

		return new Response(JSON.stringify(response), {
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
