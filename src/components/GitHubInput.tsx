import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import { Github, Sparkles, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

const GitHubInput = () => {
	const [username, setUsername] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const navigate = useNavigate()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (!username.trim()) {
			toast.error('请输入 GitHub 用户名')
			return
		}

		setIsLoading(true)

		// Navigate to profile page with username
		setTimeout(() => {
			navigate(`/profile?user=${encodeURIComponent(username.trim())}`)
		}, 500)
	}

	return (
		<form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto px-2">
			<div className="relative group">
				{/* Glow background */}
				<div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500" />

				{/* Input container */}
				<div className="relative flex flex-col sm:flex-row gap-2 p-2 rounded-2xl glass-card">
					<div className="relative flex-1">
						<Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
						<Input
							type="text"
							placeholder="输入 GitHub 用户名"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							cosmic
							className="pl-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
							disabled={isLoading}
						/>
					</div>

					<Button
						type="submit"
						variant="cosmic"
						size="lg"
						disabled={isLoading}
						className="relative overflow-hidden w-full sm:w-auto sm:min-w-[140px] h-12"
					>
						{isLoading ? (
							<span className="flex items-center gap-2">
								<Sparkles className="w-5 h-5 animate-spin" />
								分析中...
							</span>
						) : (
							<span className="flex items-center gap-2">
								生成宇宙
								<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
							</span>
						)}
					</Button>
				</div>
			</div>

			{/* Scanning animation */}
			{isLoading && (
				<div className="mt-6 relative h-2 rounded-full overflow-hidden bg-muted">
					<div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent animate-scanning" />
				</div>
			)}

			{/* Example users */}
			<div className="mt-6 flex flex-wrap items-center justify-center gap-2">
				<span className="text-muted-foreground text-sm">试试看:</span>
				<TooltipProvider delayDuration={100}>
					{[
						{
							handle: 'torvalds',
							name: 'Linus Torvalds',
							desc: 'Linux 内核之父，Git 发明者',
						},
						{
							handle: 'gaearon',
							name: 'Dan Abramov',
							desc: 'React 核心团队，Redux 作者',
						},
						{ handle: 'yyx990803', name: 'Evan You', desc: 'Vue.js 创始人' },
						{
							handle: 'antfu',
							name: 'Anthony Fu',
							desc: 'Vue/Vite 核心团队成员',
						},
						{
							handle: 'rauchg',
							name: 'Guillermo Rauch',
							desc: 'Vercel CEO，Next.js 创始人',
						},
					].map((user) => (
						<Tooltip key={user.handle}>
							<TooltipTrigger asChild>
								<button
									type="button"
									onClick={() => setUsername(user.handle)}
									className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all duration-300"
								>
									<span className="text-primary font-medium">
										@{user.handle}
									</span>
									<span className="text-muted-foreground">{user.name}</span>
								</button>
							</TooltipTrigger>
							<TooltipContent>
								<p>{user.desc}</p>
							</TooltipContent>
						</Tooltip>
					))}
				</TooltipProvider>
			</div>
		</form>
	)
}

export default GitHubInput
