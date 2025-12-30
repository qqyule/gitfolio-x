import { useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { SEO } from '@/components/SEO'

const NotFound = () => {
	const location = useLocation()

	useEffect(() => {
		console.error(
			'404 Error: User attempted to access non-existent route:',
			location.pathname
		)
	}, [location.pathname])

	return (
		<div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
			<SEO title="页面未找到 (404)" description="您访问的页面不存在。" />
			{/* Background decoration */}
			<div className="absolute inset-0 z-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] z-0 animate-pulse-glow" />

			<div className="text-center relative z-10 p-8 glass-card max-w-md mx-4 opacity-0 animate-fade-in">
				<h1 className="mb-4 text-7xl font-bold text-gradient-cosmic">404</h1>
				<p className="mb-8 text-xl text-muted-foreground italic">
					您似乎迷失在了浩瀚的代码星系中...
				</p>
				<a
					href="/"
					className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover-lift hover-glow transition-all duration-300 glow-primary"
				>
					回到首页
				</a>
			</div>
		</div>
	)
}

export default NotFound
