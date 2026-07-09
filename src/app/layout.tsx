import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
	title: 'GitFolio X - 生成式代码宇宙 | 3D GitHub 简历生成器',
	description: '将您的 GitHub 仓库转化为震撼的 3D 可视化简历，让 AI 挖掘代码背后的技术实力。生成式代码宇宙。',
	keywords: 'GitHub, 简历, 3D可视化, AI分析, 代码宇宙, Portfolio, Developer Resume',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="zh-CN" className="dark" suppressHydrationWarning>
			<body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
				<Providers>
					{children}
				</Providers>
			</body>
		</html>
	)
}
