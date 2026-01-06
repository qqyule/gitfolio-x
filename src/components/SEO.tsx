import { Helmet } from 'react-helmet-async'

interface SEOProps {
	title?: string
	description?: string
	keywords?: string[]
	image?: string
	url?: string
	type?: 'website' | 'article' | 'profile'
	author?: string
	twitterHandle?: string
	jsonLd?: Record<string, any>
}

export const SEO = ({
	title,
	description = 'GitFolio X - 将您的 GitHub 仓库转化为震撼的 3D 可视化简历，让 AI 挖掘代码背后的技术实力。',
	keywords = [
		'GitHub',
		'Resume',
		'3D Visualization',
		'AI Analysis',
		'Portfolio',
		'Developer Tools',
	],
	image = '/og-image.png',
	url = 'https://gitfolio-x.com',
	type = 'website',
	author = 'GitFolio X',
	twitterHandle = '@gitfolio_x',
	jsonLd,
}: SEOProps) => {
	const siteTitle = 'GitFolio X - 生成式代码宇宙'
	const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle

	// Ensure absolute URL for images
	const fullImage = image.startsWith('http')
		? image
		: `${url}${image.startsWith('/') ? '' : '/'}${image}`
	const canonicalUrl = url.endsWith('/') ? url.slice(0, -1) : url

	return (
		<Helmet>
			{/* Standard Metadata */}
			<title>{fullTitle}</title>
			<meta name="description" content={description} />
			<meta name="keywords" content={keywords.join(', ')} />
			<meta name="author" content={author} />
			<link rel="canonical" href={canonicalUrl} />

			{/* Open Graph / Facebook */}
			<meta property="og:type" content={type} />
			<meta property="og:url" content={url} />
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={description} />
			<meta property="og:image" content={fullImage} />
			<meta property="og:site_name" content="GitFolio X" />

			{/* Twitter */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:creator" content={twitterHandle} />
			<meta name="twitter:title" content={fullTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={fullImage} />

			{/* Structured Data (JSON-LD) */}
			{jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
		</Helmet>
	)
}
