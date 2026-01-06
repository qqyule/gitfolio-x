import { useEffect, useMemo, useRef } from 'react'

interface Star {
	x: number
	y: number
	size: number
	opacity: number
	speed: number
	twinkleOffset: number
}

interface Meteor {
	x: number
	y: number
	length: number
	speed: number
	angle: number
	opacity: number
	active: boolean
	trail: { x: number; y: number; opacity: number }[]
}

interface StarConnection {
	star1: number
	star2: number
	opacity: number
	maxOpacity: number
	fadeDirection: number
	life: number
}

const StarField = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animationRef = useRef<number>(0)
	const meteorsRef = useRef<Meteor[]>([])
	const connectionsRef = useRef<StarConnection[]>([])
	const lastMeteorTime = useRef<number>(0)
	const lastConnectionTime = useRef<number>(0)

	const stars = useMemo(() => {
		const starCount = 200
		return Array.from({ length: starCount }, () => ({
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: Math.random() * 2 + 0.5,
			opacity: Math.random() * 0.5 + 0.3,
			speed: Math.random() * 0.02 + 0.005,
			twinkleOffset: Math.random() * Math.PI * 2,
		})) as Star[]
	}, [])

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const resizeCanvas = () => {
			canvas.width = window.innerWidth
			canvas.height = window.innerHeight
		}

		resizeCanvas()
		window.addEventListener('resize', resizeCanvas)

		let time = 0

		// Create a new meteor
		const createMeteor = () => {
			const side = Math.random()
			let x
			let y
			let angle

			if (side < 0.5) {
				// Start from top
				x = Math.random() * canvas.width
				y = -50
				angle = Math.PI / 4 + (Math.random() * Math.PI) / 4
			} else {
				// Start from right
				x = canvas.width + 50
				y = Math.random() * canvas.height * 0.5
				angle = Math.PI * 0.6 + (Math.random() * Math.PI) / 4
			}

			meteorsRef.current.push({
				x,
				y,
				length: 80 + Math.random() * 120,
				speed: 8 + Math.random() * 6,
				angle,
				opacity: 0.8 + Math.random() * 0.2,
				active: true,
				trail: [],
			})
		}

		// Create a new star connection
		const createConnection = () => {
			if (stars.length < 2) return

			// Find two nearby stars
			const star1Index = Math.floor(Math.random() * stars.length)
			let star2Index = star1Index
			let minDist = Number.POSITIVE_INFINITY

			// Find a nearby star (not too close, not too far)
			stars.forEach((star, index) => {
				if (index === star1Index) return
				const dist = Math.hypot(
					((star.x - stars[star1Index].x) * canvas.width) / 100,
					((star.y - stars[star1Index].y) * canvas.height) / 100
				)
				if (dist > 50 && dist < 200 && dist < minDist) {
					minDist = dist
					star2Index = index
				}
			})

			if (star1Index !== star2Index) {
				connectionsRef.current.push({
					star1: star1Index,
					star2: star2Index,
					opacity: 0,
					maxOpacity: 0.3 + Math.random() * 0.3,
					fadeDirection: 1,
					life: 3 + Math.random() * 2, // seconds
				})
			}
		}

		const animate = () => {
			if (!ctx || !canvas) return

			ctx.clearRect(0, 0, canvas.width, canvas.height)
			const currentTime = time

			// Maybe spawn a meteor (every 3-8 seconds)
			if (currentTime - lastMeteorTime.current > 3 + Math.random() * 5) {
				createMeteor()
				lastMeteorTime.current = currentTime
			}

			// Maybe create a new connection (every 1-3 seconds)
			if (currentTime - lastConnectionTime.current > 1 + Math.random() * 2) {
				if (connectionsRef.current.length < 5) {
					createConnection()
				}
				lastConnectionTime.current = currentTime
			}

			// Draw star connections
			connectionsRef.current = connectionsRef.current.filter((conn) => {
				const star1 = stars[conn.star1]
				const star2 = stars[conn.star2]

				const x1 = (star1.x / 100) * canvas.width
				const y1 = (star1.y / 100) * canvas.height
				const x2 = (star2.x / 100) * canvas.width
				const y2 = (star2.y / 100) * canvas.height

				// Animate opacity
				conn.opacity += conn.fadeDirection * 0.01
				if (conn.opacity >= conn.maxOpacity) {
					conn.fadeDirection = -1
				}

				conn.life -= 0.016

				if (conn.life <= 0 || conn.opacity <= 0) {
					return false
				}

				// Draw the connection
				const gradient = ctx.createLinearGradient(x1, y1, x2, y2)
				gradient.addColorStop(0, `hsla(185, 80%, 75%, ${conn.opacity * 0.5})`)
				gradient.addColorStop(0.5, `hsla(280, 70%, 60%, ${conn.opacity})`)
				gradient.addColorStop(1, `hsla(185, 80%, 75%, ${conn.opacity * 0.5})`)

				ctx.beginPath()
				ctx.moveTo(x1, y1)
				ctx.lineTo(x2, y2)
				ctx.strokeStyle = gradient
				ctx.lineWidth = 1
				ctx.stroke()

				// Add glow effect
				ctx.shadowColor = 'hsla(185, 80%, 75%, 0.5)'
				ctx.shadowBlur = 10
				ctx.stroke()
				ctx.shadowBlur = 0

				return true
			})

			// Draw and update meteors
			meteorsRef.current = meteorsRef.current.filter((meteor) => {
				if (!meteor.active) return false

				// Update position
				meteor.x += Math.cos(meteor.angle) * meteor.speed
				meteor.y += Math.sin(meteor.angle) * meteor.speed

				// Add trail point
				meteor.trail.unshift({ x: meteor.x, y: meteor.y, opacity: 1 })

				// Limit trail length
				if (meteor.trail.length > 20) {
					meteor.trail.pop()
				}

				// Fade trail
				meteor.trail.forEach((point, i) => {
					point.opacity = 1 - i / meteor.trail.length
				})

				// Check if out of bounds
				if (
					meteor.x < -100 ||
					meteor.x > canvas.width + 100 ||
					meteor.y < -100 ||
					meteor.y > canvas.height + 100
				) {
					return false
				}

				// Draw meteor trail
				if (meteor.trail.length > 1) {
					ctx.beginPath()
					ctx.moveTo(meteor.trail[0].x, meteor.trail[0].y)

					for (let i = 1; i < meteor.trail.length; i++) {
						ctx.lineTo(meteor.trail[i].x, meteor.trail[i].y)
					}

					const trailGradient = ctx.createLinearGradient(
						meteor.trail[0].x,
						meteor.trail[0].y,
						meteor.trail[meteor.trail.length - 1].x,
						meteor.trail[meteor.trail.length - 1].y
					)
					trailGradient.addColorStop(0, `hsla(185, 90%, 85%, ${meteor.opacity})`)
					trailGradient.addColorStop(0.3, `hsla(200, 80%, 70%, ${meteor.opacity * 0.6})`)
					trailGradient.addColorStop(1, 'transparent')

					ctx.strokeStyle = trailGradient
					ctx.lineWidth = 2
					ctx.lineCap = 'round'
					ctx.stroke()

					// Glow effect
					ctx.shadowColor = 'hsla(185, 90%, 75%, 0.8)'
					ctx.shadowBlur = 15
					ctx.stroke()
					ctx.shadowBlur = 0
				}

				// Draw meteor head
				const headGradient = ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, 6)
				headGradient.addColorStop(0, `hsla(0, 0%, 100%, ${meteor.opacity})`)
				headGradient.addColorStop(0.5, `hsla(185, 90%, 80%, ${meteor.opacity * 0.5})`)
				headGradient.addColorStop(1, 'transparent')

				ctx.beginPath()
				ctx.arc(meteor.x, meteor.y, 6, 0, Math.PI * 2)
				ctx.fillStyle = headGradient
				ctx.fill()

				return true
			})

			// Draw stars
			stars.forEach((star) => {
				const twinkle = Math.sin(time * 2 + star.twinkleOffset) * 0.3 + 0.7
				const x = (star.x / 100) * canvas.width
				const y = (star.y / 100) * canvas.height

				// Create gradient for glow effect
				const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.size * 3)
				gradient.addColorStop(0, `hsla(185, 80%, 75%, ${star.opacity * twinkle})`)
				gradient.addColorStop(0.5, `hsla(280, 70%, 60%, ${star.opacity * twinkle * 0.3})`)
				gradient.addColorStop(1, 'transparent')

				ctx.beginPath()
				ctx.arc(x, y, star.size * 3, 0, Math.PI * 2)
				ctx.fillStyle = gradient
				ctx.fill()

				// Core of the star
				ctx.beginPath()
				ctx.arc(x, y, star.size * 0.5, 0, Math.PI * 2)
				ctx.fillStyle = `hsla(0, 0%, 100%, ${star.opacity * twinkle})`
				ctx.fill()
			})

			time += 0.016
			animationRef.current = requestAnimationFrame(animate)
		}

		animate()

		return () => {
			window.removeEventListener('resize', resizeCanvas)
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [stars])

	return (
		<canvas
			ref={canvasRef}
			className="fixed inset-0 pointer-events-none z-0"
			style={{ opacity: 0.8 }}
		/>
	)
}

export default StarField
