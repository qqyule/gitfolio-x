import { Float, Html, Line, OrbitControls, Stars } from '@react-three/drei'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { GitCommit, Star } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { GitHubData } from '@/types/github'

extend({ Line_: THREE.Line })

interface CodeGalaxyProps {
	data: GitHubData
}

// Language to color mapping
const languageColors: Record<string, string> = {
	JavaScript: '#f7df1e',
	TypeScript: '#3178c6',
	Python: '#3572A5',
	Java: '#b07219',
	Go: '#00ADD8',
	Rust: '#dea584',
	Ruby: '#701516',
	PHP: '#4F5D95',
	'C++': '#f34b7d',
	C: '#555555',
	'C#': '#239120',
	Swift: '#ffac45',
	Kotlin: '#A97BFF',
	Dart: '#00B4AB',
	Vue: '#42b883',
	HTML: '#e34c26',
	CSS: '#563d7c',
	Shell: '#89e051',
}

// Repository node component
function RepoNode({
	position,
	size,
	color,
	name,
	commits,
	language,
	stars,
}: {
	position: [number, number, number]
	size: number
	color: string
	name: string
	commits: number
	language: string | null
	stars: number
}) {
	const meshRef = useRef<THREE.Mesh>(null)
	const glowRef = useRef<THREE.Mesh>(null)
	const [hovered, setHovered] = useState(false)

	useFrame((state) => {
		if (meshRef.current) {
			meshRef.current.rotation.y += 0.005
		}
		if (glowRef.current) {
			const baseScale = hovered ? 1.5 : 1
			glowRef.current.scale.setScalar(baseScale + Math.sin(state.clock.elapsedTime * 2) * 0.1)
		}
	})

	return (
		<Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
			<group position={position}>
				{/* Glow effect */}
				<mesh ref={glowRef}>
					<sphereGeometry args={[size * 1.3, 16, 16]} />
					<meshBasicMaterial color={color} transparent opacity={hovered ? 0.35 : 0.15} />
				</mesh>

				{/* Main sphere - interactive */}
				<mesh
					ref={meshRef}
					onPointerOver={(e) => {
						e.stopPropagation()
						setHovered(true)
						document.body.style.cursor = 'pointer'
					}}
					onPointerOut={() => {
						setHovered(false)
						document.body.style.cursor = 'auto'
					}}
					onClick={(e) => {
						e.stopPropagation()
						setHovered(!hovered)
					}}
				>
					<sphereGeometry args={[size, 32, 32]} />
					<meshStandardMaterial
						color={color}
						emissive={color}
						emissiveIntensity={hovered ? 0.6 : 0.3}
						metalness={0.3}
						roughness={0.7}
					/>
				</mesh>

				{/* Tooltip on hover/tap */}
				{hovered && (
					<Html
						position={[0, size + 0.5, 0]}
						center
						distanceFactor={8}
						style={{ pointerEvents: 'none' }}
						zIndexRange={[100, 0]}
					>
						<div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 shadow-xl min-w-[120px] sm:min-w-[140px] animate-fade-in">
							<p className="font-semibold text-foreground text-xs sm:text-sm truncate max-w-[140px] sm:max-w-[160px]">
								{name}
							</p>
							<div className="flex items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-muted-foreground">
								{language && (
									<span className="flex items-center gap-1">
										<span
											className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
											style={{ backgroundColor: color }}
										/>
										<span className="truncate max-w-[50px] sm:max-w-none">{language}</span>
									</span>
								)}
								<span className="flex items-center gap-0.5 sm:gap-1">
									<Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
									{stars}
								</span>
								<span className="flex items-center gap-0.5 sm:gap-1">
									<GitCommit className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
									{commits}
								</span>
							</div>
						</div>
					</Html>
				)}

				{/* Orbit ring for active repos */}
				{commits > 10 && (
					<mesh rotation={[Math.PI / 2, 0, 0]}>
						<torusGeometry args={[size * 1.8, 0.02, 8, 64]} />
						<meshBasicMaterial color={color} transparent opacity={hovered ? 0.7 : 0.4} />
					</mesh>
				)}
			</group>
		</Float>
	)
}

// Connection line between nodes
function ConnectionLine({
	start,
	end,
	color,
}: {
	start: [number, number, number]
	end: [number, number, number]
	color: string
}) {
	const points = useMemo(() => {
		return [start, end]
	}, [start, end])

	return <Line points={points} color={color} lineWidth={1} transparent opacity={0.15} />
}

// Central core representing the user
function CentralCore({ color }: { color: string }) {
	const coreRef = useRef<THREE.Mesh>(null)
	const ringsRef = useRef<THREE.Group>(null)

	useFrame((state) => {
		if (coreRef.current) {
			coreRef.current.rotation.y += 0.01
		}
		if (ringsRef.current) {
			ringsRef.current.rotation.z += 0.005
			ringsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
		}
	})

	return (
		<group>
			{/* Core glow */}
			<mesh>
				<sphereGeometry args={[0.8, 32, 32]} />
				<meshBasicMaterial color={color} transparent opacity={0.2} />
			</mesh>

			{/* Core */}
			<mesh ref={coreRef}>
				<sphereGeometry args={[0.5, 32, 32]} />
				<meshStandardMaterial
					color={color}
					emissive={color}
					emissiveIntensity={0.8}
					metalness={0.5}
					roughness={0.3}
				/>
			</mesh>

			{/* Orbiting rings */}
			<group ref={ringsRef}>
				<mesh rotation={[Math.PI / 2, 0, 0]}>
					<torusGeometry args={[1.2, 0.015, 8, 100]} />
					<meshBasicMaterial color={color} transparent opacity={0.5} />
				</mesh>
				<mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
					<torusGeometry args={[1.5, 0.01, 8, 100]} />
					<meshBasicMaterial color={color} transparent opacity={0.3} />
				</mesh>
			</group>
		</group>
	)
}

// Main galaxy scene
function GalaxyScene({ data }: { data: GitHubData }) {
	// Get dominant language color for the core
	const dominantColor = useMemo(() => {
		if (data.languages.length > 0) {
			return data.languages[0].color || '#8b5cf6'
		}
		return '#8b5cf6'
	}, [data.languages])

	// Calculate positions for repositories
	const repoNodes = useMemo(() => {
		const repos = data.repositories.slice(0, 20) // Limit to 20 repos for performance

		return repos.map((repo, index) => {
			// Spiral positioning
			const angle = (index / repos.length) * Math.PI * 4
			const radius = 2 + (index / repos.length) * 5
			const height = (Math.random() - 0.5) * 2

			const x = Math.cos(angle) * radius
			const z = Math.sin(angle) * radius
			const y = height

			// Size based on stars (normalized)
			const maxStars = Math.max(...repos.map((r) => r.stars), 1)
			const size = 0.2 + (repo.stars / maxStars) * 0.5

			// Color based on language
			const color = repo.language ? languageColors[repo.language] || '#888888' : '#888888'

			return {
				position: [x, y, z] as [number, number, number],
				size,
				color,
				name: repo.name,
				commits: repo.commitCount,
				language: repo.language,
				stars: repo.stars,
			}
		})
	}, [data.repositories])

	// Create connections between related repos (same language)
	const connections = useMemo(() => {
		const conns: {
			start: [number, number, number]
			end: [number, number, number]
			color: string
		}[] = []

		repoNodes.forEach((node, i) => {
			// Connect to center
			conns.push({
				start: [0, 0, 0],
				end: node.position,
				color: dominantColor,
			})

			// Connect to a few nearby nodes
			repoNodes.slice(i + 1, i + 3).forEach((otherNode) => {
				conns.push({
					start: node.position,
					end: otherNode.position,
					color: node.color,
				})
			})
		})

		return conns
	}, [repoNodes, dominantColor])

	return (
		<>
			{/* Ambient lighting */}
			<ambientLight intensity={0.3} />
			<pointLight position={[10, 10, 10]} intensity={0.8} />
			<pointLight position={[-10, -10, -10]} intensity={0.4} color="#8b5cf6" />

			{/* Background stars */}
			<Stars radius={100} depth={50} count={2000} factor={4} fade speed={0.5} />

			{/* Central core */}
			<CentralCore color={dominantColor} />

			{/* Connection lines */}
			{connections.map((conn, i) => (
				<ConnectionLine key={i} {...conn} />
			))}

			{/* Repository nodes */}
			{repoNodes.map((node, i) => (
				<RepoNode key={i} {...node} />
			))}

			{/* Camera controls */}
			<OrbitControls
				enableZoom={true}
				enablePan={false}
				minDistance={5}
				maxDistance={20}
				autoRotate
				autoRotateSpeed={0.5}
			/>
		</>
	)
}

export default function CodeGalaxy({ data }: CodeGalaxyProps) {
	return (
		<div className="w-full h-[350px] sm:h-[400px] md:h-[500px] rounded-2xl overflow-hidden bg-background/50 touch-none">
			<Canvas camera={{ position: [0, 5, 12], fov: 60 }} gl={{ antialias: true, alpha: true }}>
				<GalaxyScene data={data} />
			</Canvas>
			{/* Mobile hint */}
			<div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/60 pointer-events-none sm:hidden">
				双指缩放 · 单指旋转
			</div>
		</div>
	)
}
