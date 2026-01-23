export interface GitHubUser {
	login: string
	name: string | null
	bio: string | null
	avatarUrl: string
	location: string | null
	company: string | null
	blog: string | null
	createdAt: string
	followers: number
	following: number
}

export interface Repository {
	name: string
	description: string | null
	url: string
	stars: number
	forks: number
	language: string | null
	languageColor: string | null
	createdAt: string
	updatedAt: string
	pushedAt: string
	commitCount: number
	recentCommits: {
		committedDate: string
		message: string
		additions: number
		deletions: number
	}[]
}

export interface Language {
	name: string
	bytes: number
	color: string
}

export interface Contributions {
	total: number
	commits: number
	pullRequests: number
	issues: number
	heatmap: {
		date: string
		count: number
		weekday: number
	}[]
}

export interface GitHubStats {
	totalRepos: number
	totalStars: number
	totalForks: number
}

export interface GitHubData {
	user: GitHubUser
	repositories: Repository[]
	languages: Language[]
	contributions: Contributions
	stats: GitHubStats
}

export interface TechProfile {
	primaryRole: string
	expertise: string[]
	style: string
}

export interface Skills {
	frontend: number
	backend: number
	devops: number
	algorithms: number
	architecture: number
	documentation: number
}

export interface AIAnalysis {
	summary: string
	highlights: string[]
	techProfile: TechProfile
	skills: Skills
	insights: string[]
	recommendations: string[]
	personality: string
}
