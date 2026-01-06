import { ExternalLink, GitFork, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Repository } from '@/types/github'

interface RepoCardProps {
	repo: Repository
	index: number
}

const RepoCard = ({ repo, index }: RepoCardProps) => {
	// Calculate "planet" size based on stars and commits
	const importance = Math.min(repo.stars * 2 + repo.commitCount * 0.1, 100)
	const size = 60 + (importance / 100) * 40

	return (
		<a
			href={repo.url}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				'group relative glass-card rounded-xl sm:rounded-2xl p-3 sm:p-5 transition-all duration-500',
				'hover:scale-[1.02] sm:hover:scale-[1.03] hover:bg-card/60 opacity-0 animate-slide-up hover-glow',
				'active:scale-[0.98]'
			)}
			style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
		>
			{/* Glow effect */}
			<div
				className="absolute -inset-px rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
				style={{
					background: `linear-gradient(135deg, ${repo.languageColor || 'hsl(185 80% 55%)'}40, transparent)`,
				}}
			/>

			{/* Planet indicator */}
			<div className="absolute -right-2 -top-2 sm:-right-3 sm:-top-3 opacity-30 group-hover:opacity-60 transition-opacity">
				<div
					className="rounded-full animate-pulse-glow"
					style={{
						width: size / 2.5,
						height: size / 2.5,
						backgroundColor: repo.languageColor || 'hsl(185 80% 55%)',
						boxShadow: `0 0 15px ${repo.languageColor || 'hsl(185 80% 55%)'}`,
					}}
				/>
			</div>

			<div className="relative z-10">
				{/* Header */}
				<div className="flex items-start justify-between mb-1.5 sm:mb-2">
					<h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate max-w-[85%] text-sm sm:text-base">
						{repo.name}
					</h3>
					<ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
				</div>

				{/* Description */}
				<p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3 min-h-[32px] sm:min-h-[40px]">
					{repo.description || '暂无描述'}
				</p>

				{/* Stats */}
				<div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
					{repo.language && (
						<div className="flex items-center gap-1 sm:gap-1.5">
							<span
								className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
								style={{ backgroundColor: repo.languageColor || '#8b949e' }}
							/>
							<span className="text-muted-foreground truncate max-w-[60px] sm:max-w-none">
								{repo.language}
							</span>
						</div>
					)}
					<div className="flex items-center gap-1 text-muted-foreground">
						<Star className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						<span>{repo.stars}</span>
					</div>
					<div className="flex items-center gap-1 text-muted-foreground">
						<GitFork className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						<span>{repo.forks}</span>
					</div>
				</div>
			</div>
		</a>
	)
}

export default RepoCard
