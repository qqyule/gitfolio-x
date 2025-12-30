import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
	ArrowLeft,
	Loader2,
	Sparkles,
	MapPin,
	Building,
	Calendar,
	Users,
	Star,
	GitFork,
	GitCommit,
	GitPullRequest,
	Hash,
	Share2,
	Play,
	Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import StarField from '@/components/StarField'
import SkillsRadar from '@/components/SkillsRadar'
import LanguageChart from '@/components/LanguageChart'
import RepoCard from '@/components/RepoCard'
import CodeGalaxy from '@/components/CodeGalaxy'
import { fetchGitHubData, analyzeCode } from '@/lib/github'
import type { GitHubData, AIAnalysis } from '@/types/github'
import galaxyHero from '@/assets/galaxy-hero.jpg'
import { PDFDownloadLink } from '@react-pdf/renderer'
import ProfilePdfDocument from '@/components/ProfilePdfDocument'

type AnalysisStage = 'fetching' | 'analyzing' | 'complete' | 'error'

const Profile = () => {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const username = searchParams.get('user') || ''

	const [stage, setStage] = useState<AnalysisStage>('fetching')
	const [statusMessage, setStatusMessage] = useState('正在连接 GitHub API...')
	const [githubData, setGithubData] = useState<GitHubData | null>(null)
	const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
	const [showShareGuide, setShowShareGuide] = useState(false)
	const [galaxyState, setGalaxyState] = useState<'idle' | 'loading' | 'ready'>(
		'idle'
	)
	const guideTimerRef = useRef<NodeJS.Timeout | null>(null)

	const handleShareToX = () => {
		const shareUrl = window.location.href
		const displayName = githubData?.user?.name || username
		const shareText = `我刚刚用 AI 分析了 ${displayName} 的 GitHub 代码宇宙！来看看这份技术画像 🚀`
		const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
			shareText
		)}&url=${encodeURIComponent(shareUrl)}`

		window.open(xUrl, '_blank', 'width=700,height=500')
		toast.success('正在打开 X 分享页面...')
	}

	useEffect(() => {
		if (!username) {
			navigate('/')
			return
		}

		const analyze = async () => {
			try {
				// Stage 1: Fetch GitHub data
				setStage('fetching')
				const stages = [
					'正在连接 GitHub API...',
					'正在获取仓库信息...',
					'正在解析代码结构...',
				]

				for (const msg of stages) {
					setStatusMessage(msg)
					await new Promise((r) => setTimeout(r, 600))
				}

				const data = await fetchGitHubData(username)
				setGithubData(data)

				// Stage 2: AI Analysis
				setStage('analyzing')
				const aiStages = [
					'AI 正在阅读您的代码...',
					'正在分析技术栈和编程风格...',
					'正在生成技术画像...',
				]

				for (const msg of aiStages) {
					setStatusMessage(msg)
					await new Promise((r) => setTimeout(r, 800))
				}

				const result = await analyzeCode(data)
				setAnalysis(result)
				setStage('complete')
				toast.success('分析完成！')

				// Show share guide after analysis complete
				setTimeout(() => {
					setShowShareGuide(true)
					guideTimerRef.current = setTimeout(() => {
						setShowShareGuide(false)
					}, 4000)
				}, 800)
			} catch (error) {
				console.error('Analysis error:', error)
				setStage('error')
				toast.error(error instanceof Error ? error.message : '分析失败')
			}
		}

		analyze()

		return () => {
			if (guideTimerRef.current) {
				clearTimeout(guideTimerRef.current)
			}
		}
	}, [username, navigate])

	if (!username) {
		return null
	}

	return (
		<div className="relative min-h-screen overflow-hidden">
			{/* Background */}
			<div
				className="fixed inset-0 z-0 opacity-30"
				style={{
					backgroundImage: `url(${galaxyHero})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
					filter: 'blur(4px)',
				}}
			/>
			<div className="fixed inset-0 z-0 bg-gradient-to-b from-background/80 via-background/95 to-background" />
			<StarField />

			{/* Main content */}
			<main className="relative z-10 container mx-auto px-4 py-8">
				{/* Back button */}
				<Button
					variant="ghost"
					onClick={() => navigate('/')}
					className="mb-8 opacity-0 animate-fade-in"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					返回首页
				</Button>

				{/* Loading state */}
				{stage !== 'complete' && stage !== 'error' && (
					<div className="min-h-[60vh] flex flex-col items-center justify-center">
						<div className="relative w-32 h-32 mb-8">
							<div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-20 animate-ping" />
							<div className="absolute inset-4 rounded-full bg-gradient-to-br from-primary to-secondary opacity-40 animate-pulse" />
							<div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
								<Loader2 className="w-8 h-8 text-primary-foreground animate-spin" />
							</div>
						</div>
						<p className="text-xl text-foreground font-medium mb-2">
							分析 @{username} 的代码宇宙
						</p>
						<p className="text-muted-foreground animate-pulse">
							{statusMessage}
						</p>
					</div>
				)}

				{/* Error state */}
				{stage === 'error' && (
					<div className="min-h-[60vh] flex flex-col items-center justify-center">
						<div className="glass-card rounded-2xl p-8 text-center max-w-md">
							<div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
								<span className="text-3xl">😔</span>
							</div>
							<h2 className="text-xl font-semibold text-foreground mb-2">
								分析失败
							</h2>
							<p className="text-muted-foreground mb-6">
								无法获取 @{username} 的 GitHub 数据，请检查用户名是否正确。
							</p>
							<Button variant="cosmic" onClick={() => navigate('/')}>
								返回重试
							</Button>
						</div>
					</div>
				)}

				{/* Complete state */}
				{stage === 'complete' && githubData && analysis && (
					<div className="space-y-8 relative">
						{/* Share button - top right */}
						<div className="absolute right-0 -top-2 z-20 flex items-center">
							<div className="relative">
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										setShowShareGuide(false)
										handleShareToX()
									}}
									className="gap-2 bg-card/80 backdrop-blur-sm border-primary/30 hover:bg-primary/10 hover:border-primary"
								>
									<Share2 className="w-4 h-4" />
									分享到 𝕏
								</Button>

								{/* Share guide tooltip */}
								{showShareGuide && (
									<div
										className="absolute right-0 top-full mt-2 animate-fade-in z-50"
										onClick={() => setShowShareGuide(false)}
									>
										<div className="relative bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
											<div className="absolute -top-2 right-4 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-primary" />
											点击分享你的技术画像 ✨
										</div>
									</div>
								)}
							</div>

							<PDFDownloadLink
								document={
									<ProfilePdfDocument data={githubData} analysis={analysis} />
								}
								fileName={`gitfolio-${username}.pdf`}
								className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border h-9 px-3 bg-card/80 backdrop-blur-sm border-primary/30 hover:bg-primary/10 hover:border-primary hover:text-primary ml-2"
							>
								{({ loading }) =>
									loading ? (
										'生成中...'
									) : (
										<>
											<Share2 className="w-4 h-4 rotate-180" />
											导出 PDF
										</>
									)
								}
							</PDFDownloadLink>
						</div>
						{/* User header */}
						<header
							className="glass-card hover-lift rounded-3xl p-4 sm:p-6 md:p-8 opacity-0 animate-slide-up"
							style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
						>
							<div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
								{/* Avatar */}
								<div className="relative flex-shrink-0">
									<div className="absolute -inset-2 bg-gradient-to-br from-primary to-secondary rounded-full opacity-50 blur-lg" />
									<img
										src={githubData.user.avatarUrl}
										alt={githubData.user.name || githubData.user.login}
										className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full border-4 border-card"
									/>
								</div>

								{/* User info */}
								<div className="flex-1 text-center md:text-left min-w-0">
									<h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 truncate">
										{githubData.user.name || githubData.user.login}
									</h1>
									<p className="text-primary text-base sm:text-lg mb-2 sm:mb-3">
										@{githubData.user.login}
									</p>

									{githubData.user.bio && (
										<p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4 max-w-xl line-clamp-2 sm:line-clamp-none">
											{githubData.user.bio}
										</p>
									)}

									<div className="flex flex-wrap gap-2 sm:gap-4 justify-center md:justify-start text-xs sm:text-sm text-muted-foreground">
										{githubData.user.location && (
											<span className="flex items-center gap-1">
												<MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
												<span className="truncate max-w-[100px] sm:max-w-none">
													{githubData.user.location}
												</span>
											</span>
										)}
										{githubData.user.company && (
											<span className="flex items-center gap-1">
												<Building className="w-3 h-3 sm:w-4 sm:h-4" />
												<span className="truncate max-w-[80px] sm:max-w-none">
													{githubData.user.company}
												</span>
											</span>
										)}
										<span className="flex items-center gap-1">
											<Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
											<span className="hidden sm:inline">加入于</span>{' '}
											{new Date(githubData.user.createdAt).toLocaleDateString(
												'zh-CN'
											)}
										</span>
										<span className="flex items-center gap-1">
											<Users className="w-3 h-3 sm:w-4 sm:h-4" />{' '}
											{githubData.user.followers}{' '}
											<span className="hidden sm:inline">关注者</span>
										</span>
									</div>
								</div>

								{/* Stats */}
								<div className="flex gap-4 sm:gap-6 text-center mt-2 md:mt-0">
									<div>
										<div className="text-xl sm:text-2xl font-bold text-foreground">
											{githubData.stats.totalRepos}
										</div>
										<div className="text-xs sm:text-sm text-muted-foreground">
											仓库
										</div>
									</div>
									<div>
										<div className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-1">
											<Star className="w-4 h-4 sm:w-5 sm:h-5 text-star-bright" />{' '}
											{githubData.stats.totalStars}
										</div>
										<div className="text-xs sm:text-sm text-muted-foreground">
											Star
										</div>
									</div>
									<div>
										<div className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-1">
											<GitFork className="w-4 h-4 sm:w-5 sm:h-5" />{' '}
											{githubData.stats.totalForks}
										</div>
										<div className="text-xs sm:text-sm text-muted-foreground">
											Fork
										</div>
									</div>
								</div>
							</div>
						</header>

						{/* Code Galaxy Visualization */}
						<section
							className="glass-card hover-lift rounded-3xl p-4 sm:p-6 md:p-8 opacity-0 animate-slide-up"
							style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
						>
							<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 sm:mb-6">
								<div className="flex items-center gap-2 sm:gap-3">
									<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
										<Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
									</div>
									<h2 className="text-xl sm:text-2xl font-bold text-foreground">
										代码宇宙
									</h2>
								</div>
								{galaxyState === 'idle' && (
									<span className="text-xs text-muted-foreground">
										点击下方启动 3D 可视化
									</span>
								)}
							</div>

							{galaxyState === 'ready' ? (
								<div className="animate-fade-in relative">
									<p className="text-muted-foreground text-sm sm:text-base mb-3 sm:mb-4">
										<span className="hidden sm:inline">
											每颗星球代表一个仓库，大小由 Star
											数决定，颜色代表主要语言。
										</span>
										<span className="sm:hidden">点击星球查看详情</span>
										<span className="hidden sm:inline">
											拖动旋转，滚轮缩放。
										</span>
									</p>
									<CodeGalaxy data={githubData} />
								</div>
							) : galaxyState === 'loading' ? (
								<div className="w-full h-[280px] sm:h-[350px] md:h-[400px] rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/30 flex flex-col items-center justify-center gap-4 sm:gap-6 overflow-hidden relative">
									{/* Animated background */}
									<div className="absolute inset-0 overflow-hidden">
										<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_hsl(var(--primary)/0.1)_0%,_transparent_70%)] animate-pulse" />
										{[...Array(15)].map((_, i) => (
											<div
												key={i}
												className="absolute w-1 h-1 rounded-full bg-primary/60 animate-ping"
												style={{
													left: `${Math.random() * 100}%`,
													top: `${Math.random() * 100}%`,
													animationDelay: `${Math.random() * 2}s`,
													animationDuration: `${1 + Math.random() * 2}s`,
												}}
											/>
										))}
									</div>

									{/* Loading animation */}
									<div className="relative z-10">
										<div className="w-20 h-20 sm:w-24 sm:h-24 relative">
											<div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
											<div className="absolute inset-2 rounded-full border-2 border-primary/40 animate-pulse" />
											<div
												className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 animate-spin"
												style={{ animationDuration: '3s' }}
											/>
											<div className="absolute inset-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
												<Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground animate-spin" />
											</div>
										</div>
									</div>

									<div className="text-center relative z-10 px-4">
										<p className="text-foreground font-medium mb-1 animate-pulse text-sm sm:text-base">
											正在生成代码宇宙...
										</p>
										<p className="text-xs sm:text-sm text-muted-foreground">
											扫描 {githubData.stats.totalRepos} 个仓库
										</p>
									</div>
								</div>
							) : (
								<button
									onClick={() => {
										setGalaxyState('loading')
										setTimeout(() => setGalaxyState('ready'), 2000)
									}}
									className="w-full h-[220px] sm:h-[260px] md:h-[300px] rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/50 hover:border-primary/50 active:scale-[0.98] transition-all duration-300 flex flex-col items-center justify-center gap-3 sm:gap-4 group cursor-pointer"
								>
									<div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
										<Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary ml-1" />
									</div>
									<div className="text-center px-4">
										<p className="text-foreground font-medium mb-1 text-sm sm:text-base">
											启动 3D 代码宇宙
										</p>
										<p className="text-xs sm:text-sm text-muted-foreground">
											探索 {githubData.stats.totalRepos} 个仓库的星系
										</p>
									</div>
								</button>
							)}
						</section>

						{/* AI Analysis Section */}
						<section
							className="glass-card hover-lift rounded-3xl p-4 sm:p-6 md:p-8 opacity-0 animate-slide-up"
							style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
						>
							<div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
								<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
									<Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
								</div>
								<h2 className="text-xl sm:text-2xl font-bold text-foreground">
									AI 技术画像
								</h2>
							</div>

							<div className="grid lg:grid-cols-2 gap-6 md:gap-8">
								{/* Left: Summary and profile */}
								<div className="space-y-4 sm:space-y-6">
									{/* Role badge */}
									<div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/30">
										<span className="text-primary font-semibold text-sm sm:text-base">
											{analysis.techProfile.primaryRole}
										</span>
									</div>

									{/* Summary */}
									<p className="text-base sm:text-lg text-foreground leading-relaxed">
										{analysis.summary}
									</p>

									{/* Highlights */}
									<div className="space-y-2 sm:space-y-3">
										<h3 className="font-semibold text-foreground text-sm sm:text-base">
											✨ 核心亮点
										</h3>
										<ul className="space-y-1.5 sm:space-y-2">
											{analysis.highlights.map((highlight, i) => (
												<li
													key={i}
													className="flex items-start gap-2 text-muted-foreground text-sm sm:text-base"
												>
													<span className="text-primary mt-0.5 sm:mt-1">•</span>
													{highlight}
												</li>
											))}
										</ul>
									</div>

									{/* Personality */}
									<div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
										<p className="text-xs sm:text-sm text-muted-foreground mb-1">
											开发者性格
										</p>
										<p className="text-foreground font-medium text-sm sm:text-base">
											{analysis.personality}
										</p>
									</div>

									{/* Insights */}
									<div className="space-y-2 sm:space-y-3">
										<h3 className="font-semibold text-foreground text-sm sm:text-base">
											🔍 有趣发现
										</h3>
										<ul className="space-y-1.5 sm:space-y-2">
											{analysis.insights.map((insight, i) => (
												<li
													key={i}
													className="text-muted-foreground text-sm sm:text-base"
												>
													{insight}
												</li>
											))}
										</ul>
									</div>
								</div>

								{/* Right: Skills radar */}
								<div>
									<h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">
										能力雷达
									</h3>
									<SkillsRadar skills={analysis.skills} />

									{/* Expertise tags */}
									<div className="mt-4 sm:mt-6">
										<h4 className="text-xs sm:text-sm text-muted-foreground mb-2">
											专长领域
										</h4>
										<div className="flex flex-wrap gap-1.5 sm:gap-2">
											{analysis.techProfile.expertise.map((skill) => (
												<span
													key={skill}
													className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm bg-secondary/20 text-secondary-foreground border border-secondary/30"
												>
													{skill}
												</span>
											))}
										</div>
									</div>
								</div>
							</div>
						</section>

						{/* Languages and repos section */}
						<div className="grid lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
							{/* Language stats */}
							<section
								className="glass-card hover-lift rounded-3xl p-4 sm:p-6 opacity-0 animate-slide-up"
								style={{
									animationDelay: '400ms',
									animationFillMode: 'forwards',
								}}
							>
								<h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
									技术栈分布
								</h2>
								<LanguageChart languages={githubData.languages} />
							</section>

							{/* Contribution stats */}
							<section
								className="glass-card hover-lift rounded-3xl p-4 sm:p-6 lg:col-span-2 opacity-0 animate-slide-up"
								style={{
									animationDelay: '500ms',
									animationFillMode: 'forwards',
								}}
							>
								<h2 className="text-lg sm:text-xl font-bold text-foreground mb-3 sm:mb-4">
									贡献统计
								</h2>
								<div className="grid grid-cols-3 gap-2 sm:gap-4">
									<div className="text-center p-2 sm:p-4 rounded-xl bg-muted/30 hover-glow transition-all duration-300 cursor-default">
										<GitCommit className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-1 sm:mb-2" />
										<div className="text-lg sm:text-2xl font-bold text-foreground">
											{githubData.contributions.total}
										</div>
										<div className="text-xs sm:text-sm text-muted-foreground">
											总贡献
										</div>
									</div>
									<div className="text-center p-2 sm:p-4 rounded-xl bg-muted/30 hover-glow transition-all duration-300 cursor-default">
										<Hash className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-1 sm:mb-2" />
										<div className="text-lg sm:text-2xl font-bold text-foreground">
											{githubData.contributions.commits}
										</div>
										<div className="text-xs sm:text-sm text-muted-foreground">
											Commits
										</div>
									</div>
									<div className="text-center p-2 sm:p-4 rounded-xl bg-muted/30 hover-glow transition-all duration-300 cursor-default">
										<GitPullRequest className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-1 sm:mb-2" />
										<div className="text-lg sm:text-2xl font-bold text-foreground">
											{githubData.contributions.pullRequests}
										</div>
										<div className="text-xs sm:text-sm text-muted-foreground">
											PRs
										</div>
									</div>
								</div>

								{/* Recommendations */}
								<div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
									<h3 className="font-semibold text-foreground mb-2 sm:mb-3 text-sm sm:text-base">
										💡 成长建议
									</h3>
									<ul className="space-y-1.5 sm:space-y-2">
										{analysis.recommendations.map((rec, i) => (
											<li
												key={i}
												className="flex items-start gap-2 text-muted-foreground text-sm sm:text-base"
											>
												<span className="text-secondary mt-0.5 sm:mt-1">→</span>
												{rec}
											</li>
										))}
									</ul>
								</div>
							</section>
						</div>

						{/* Repositories */}
						<section
							className="opacity-0 animate-slide-up"
							style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
						>
							<h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">
								代码星系
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
								{githubData.repositories.slice(0, 6).map((repo, index) => (
									<RepoCard key={repo.name} repo={repo} index={index} />
								))}
							</div>
						</section>
					</div>
				)}
			</main>
		</div>
	)
}

export default Profile
