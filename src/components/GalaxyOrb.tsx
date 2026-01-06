import { useEffect, useState } from 'react'

interface OrbitingParticle {
	id: number
	angle: number
	radius: number
	speed: number
	size: number
	color: string
}

const GalaxyOrb = () => {
	const [rotation, setRotation] = useState(0)

	const particles: OrbitingParticle[] = Array.from({ length: 12 }, (_, i) => ({
		id: i,
		angle: (i / 12) * Math.PI * 2,
		radius: 80 + Math.random() * 40,
		speed: 0.5 + Math.random() * 0.5,
		size: 3 + Math.random() * 4,
		color:
			i % 3 === 0
				? 'hsl(185, 80%, 55%)'
				: i % 3 === 1
					? 'hsl(280, 70%, 50%)'
					: 'hsl(320, 80%, 60%)',
	}))

	useEffect(() => {
		const interval = setInterval(() => {
			setRotation((prev) => prev + 0.5)
		}, 16)
		return () => clearInterval(interval)
	}, [])

	return (
		<div className="relative w-64 h-64 mx-auto animate-float">
			{/* Central orb */}
			<div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary via-accent to-secondary opacity-80 blur-sm" />
			<div className="absolute inset-10 rounded-full bg-gradient-to-br from-primary to-secondary glow-primary" />
			<div className="absolute inset-12 rounded-full bg-background/50 backdrop-blur-sm" />

			{/* Inner glow */}
			<div
				className="absolute inset-16 rounded-full"
				style={{
					background: 'radial-gradient(circle, hsl(185 80% 55% / 0.3) 0%, transparent 70%)',
				}}
			/>

			{/* Orbiting particles */}
			{particles.map((particle) => {
				const currentAngle = particle.angle + (rotation * particle.speed * Math.PI) / 180
				const x = Math.cos(currentAngle) * particle.radius + 128
				const y = Math.sin(currentAngle) * particle.radius + 128

				return (
					<div
						key={particle.id}
						className="absolute rounded-full animate-pulse-glow"
						style={{
							width: particle.size,
							height: particle.size,
							backgroundColor: particle.color,
							left: x - particle.size / 2,
							top: y - particle.size / 2,
							boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
						}}
					/>
				)
			})}

			{/* Orbit rings */}
			<div
				className="absolute inset-4 rounded-full border border-primary/20"
				style={{ transform: `rotateX(60deg) rotateZ(${rotation}deg)` }}
			/>
			<div
				className="absolute inset-0 rounded-full border border-secondary/10"
				style={{ transform: `rotateX(70deg) rotateZ(${-rotation * 0.5}deg)` }}
			/>
		</div>
	)
}

export default GalaxyOrb
