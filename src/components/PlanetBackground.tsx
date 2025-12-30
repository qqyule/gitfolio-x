import React, { useEffect, useState, useCallback } from 'react'
import trendingRepos from '../data/trending-repos.json'

interface Repo {
	name: string
	category: string
}

interface ActiveRepo extends Repo {
	id: number
	x: number
	y: number
	scale: number
	opacity: number
	duration: number
}

const PlanetBackground: React.FC = () => {
	const [activeRepos, setActiveRepos] = useState<ActiveRepo[]>([])

	const spawnRepo = useCallback(() => {
		const randomRepo =
			trendingRepos[Math.floor(Math.random() * trendingRepos.length)]
		const id = Date.now() + Math.random()

		// 随机位置 (避免在边缘)
		const x = 10 + Math.random() * 80
		const y = 10 + Math.random() * 80

		// 随机大小 (0.8 到 1.5)
		const scale = 0.8 + Math.random() * 0.7

		// 随机持续时间 (2000ms 到 4000ms)
		const duration = 2000 + Math.random() * 2000

		const newActiveRepo: ActiveRepo = {
			...randomRepo,
			id,
			x,
			y,
			scale,
			opacity: 0,
			duration,
		}

		setActiveRepos((prev) => {
			// 限制同时出现的数量为 1-3 个
			if (prev.length >= 3) return prev
			return [...prev, newActiveRepo]
		})

		// 自动移除
		setTimeout(() => {
			setActiveRepos((prev) => prev.filter((r) => r.id !== id))
		}, duration)
	}, [])

	useEffect(() => {
		const interval = setInterval(() => {
			// 随机触发生成，模拟不规则间隔
			if (Math.random() > 0.3 && activeRepos.length < 3) {
				spawnRepo()
			}
		}, 1000)

		return () => clearInterval(interval)
	}, [spawnRepo, activeRepos.length])

	return (
		<div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-transparent">
			{activeRepos.map((repo) => (
				<div
					key={repo.id}
					className="absolute transition-all duration-1000 ease-in-out"
					style={{
						left: `${repo.x}%`,
						top: `${repo.y}%`,
						transform: `translate(-50%, -50%) scale(${repo.scale})`,
					}}
				>
					<div
						className="flex flex-col items-center animate-pulse-gentle"
						style={{
							animation: `fadeInOut ${repo.duration}ms ease-in-out forwards`,
						}}
					>
						{/* 星球发光点 */}
						<div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)] mb-2" />

						{/* 仓库名称 */}
						<span className="text-blue-100/40 text-sm font-light tracking-widest whitespace-nowrap uppercase">
							{repo.name}
						</span>
					</div>
				</div>
			))}

			<style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
        .animate-pulse-gentle {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
		</div>
	)
}

export default PlanetBackground
