import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { AIAnalysis, GitHubData } from '@/types/github'

// 注册字体以支持中文
Font.register({
	family: 'NotoSansSC',
	src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-sc@5.0.12/files/noto-sans-sc-chinese-simplified-400-normal.woff',
})

// 为了更好的中文支持，实际项目中通常需要引入中文字体文件
// 这里为了演示方便，我们暂时使用系统默认或网络字体，
// 实际生产环境建议下载并打包字体文件，例如 Noto Sans SC

const styles = StyleSheet.create({
	page: {
		padding: 40,
		backgroundColor: '#ffffff',
		fontFamily: 'NotoSansSC',
		color: '#24292f',
		width: '100%',
	},
	header: {
		flexDirection: 'row',
		marginBottom: 30,
		paddingBottom: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#d0d7de',
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		borderWidth: 1,
		borderColor: '#d0d7de',
	},
	headerInfo: {
		marginLeft: 20,
		justifyContent: 'center',
		flex: 1,
	},
	name: {
		fontSize: 26,
		fontWeight: 'bold',
		color: '#24292f',
		marginBottom: 4,
	},
	login: {
		fontSize: 16,
		color: '#57606a',
		marginBottom: 8,
	},
	bio: {
		fontSize: 12,
		color: '#24292f',
		lineHeight: 1.4,
		marginBottom: 8,
	},
	statsRow: {
		flexDirection: 'row',
		marginTop: 8,
		gap: 16,
	},
	statItem: {
		fontSize: 11,
		color: '#57606a',
		flexDirection: 'row',
		alignItems: 'center',
	},
	section: {
		marginBottom: 24,
		width: '100%',
		overflow: 'hidden',
	},
	sectionTitle: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#24292f',
		marginBottom: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#d0d7de',
		paddingBottom: 6,
	},
	text: {
		fontSize: 11,
		lineHeight: 1.6,
		color: '#24292f',
		marginBottom: 4,
	},
	listItem: {
		fontSize: 11,
		lineHeight: 1.6,
		color: '#24292f',
		marginLeft: 8,
		marginBottom: 4,
	},
	repoGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	repoCard: {
		width: '32%',
		padding: 12,
		borderWidth: 1,
		borderColor: '#d0d7de',
		borderRadius: 6,
		backgroundColor: '#ffffff',
		marginBottom: 0,
	},
	repoName: {
		fontSize: 12,
		fontWeight: 'bold',
		color: '#0969da',
		marginBottom: 6,
	},
	repoDesc: {
		fontSize: 10,
		color: '#57606a',
		height: 45,
		marginBottom: 8,
		lineHeight: 1.4,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	},
	repoMeta: {
		fontSize: 9,
		color: '#57606a',
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	skillRow: {
		flexDirection: 'row',
		marginBottom: 8,
		alignItems: 'center',
	},
	skillLabel: {
		width: 70,
		fontSize: 10,
		color: '#24292f',
		fontWeight: 'medium',
	},
	skillBarBg: {
		flex: 1,
		height: 6,
		backgroundColor: '#d0d7de',
		borderRadius: 3,
		overflow: 'hidden',
	},
	skillBarFill: {
		height: 6,
		borderRadius: 3,
		backgroundColor: '#0969da',
	},
	gridTwoCol: {
		flexDirection: 'row',
		width: '100%',
	},
	column: {
		width: 240,
		paddingRight: 15,
		overflow: 'hidden',
	},
	badge: {
		fontSize: 10,
		backgroundColor: '#f6f8fa',
		paddingVertical: 2,
		paddingHorizontal: 6,
		borderRadius: 10,
		color: '#24292f',
		borderWidth: 1,
		borderColor: '#d0d7de',
	},
})

interface ProfilePdfProps {
	data: GitHubData
	analysis: AIAnalysis
}

const ProfilePdfDocument = ({ data, analysis }: ProfilePdfProps) => {
	return (
		<Document>
			<Page size="A4" style={styles.page}>
				{/* Header Section */}
				<View style={styles.header}>
					{data.user.avatarUrl && <Image src={data.user.avatarUrl} style={styles.avatar} />}
					<View style={styles.headerInfo}>
						<Text style={styles.name}>{data.user.name || data.user.login}</Text>
						<Text style={styles.login}>@{data.user.login}</Text>
						{data.user.bio && <Text style={styles.bio}>{data.user.bio}</Text>}

						<View style={styles.statsRow}>
							<Text style={styles.statItem}>Repos: {data.stats.totalRepos}</Text>
							<Text style={styles.statItem}>Stars: {data.stats.totalStars}</Text>
							<Text style={styles.statItem}>Forks: {data.stats.totalForks}</Text>
							<Text style={styles.statItem}>Followers: {data.user.followers}</Text>
						</View>
					</View>
				</View>

				{/* AI Analysis Summary */}
				<View style={styles.section} wrap={false}>
					<Text style={styles.sectionTitle}>AI 技术画像</Text>
					<Text style={styles.text}>{analysis.summary}</Text>
					<Text style={{ ...styles.text, marginTop: 5 }}>
						角色定位: {analysis.techProfile.primaryRole}
					</Text>
					<Text style={{ ...styles.text, marginTop: 5 }}>开发者性格: {analysis.personality}</Text>
				</View>

				<View style={styles.gridTwoCol} wrap={false}>
					{/* Highlights */}
					<View style={styles.column}>
						<Text style={styles.sectionTitle}>核心亮点</Text>
						{analysis.highlights.map((highlight, i) => (
							<Text key={i} style={styles.listItem}>
								• {highlight}
							</Text>
						))}
					</View>

					{/* Growing Advice */}
					<View style={styles.column}>
						<Text style={styles.sectionTitle}>成长建议</Text>
						{analysis.recommendations.map((rec, i) => (
							<Text key={i} style={styles.listItem}>
								→ {rec}
							</Text>
						))}
					</View>
				</View>

				{/* Skills Radar (Simulated with bars for PDF) */}
				<View style={{ ...styles.section, marginTop: 20 }} wrap={false}>
					<Text style={styles.sectionTitle}>能力维度</Text>
					<View style={styles.gridTwoCol}>
						<View style={styles.column}>
							<SkillBar label="前端开发" value={analysis.skills.frontend} />
							<SkillBar label="后端开发" value={analysis.skills.backend} />
							<SkillBar label="DevOps" value={analysis.skills.devops} />
						</View>
						<View style={styles.column}>
							<SkillBar label="算法能力" value={analysis.skills.algorithms} />
							<SkillBar label="架构设计" value={analysis.skills.architecture} />
							<SkillBar label="文档规范" value={analysis.skills.documentation} />
						</View>
					</View>
				</View>

				{/* Languages */}
				<View style={styles.section} wrap={false}>
					<Text style={styles.sectionTitle}>语言分布</Text>
					<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
						{data.languages.slice(0, 8).map((lang, i) => (
							<Text key={i} style={styles.badge}>
								{lang.name}
							</Text>
						))}
					</View>
				</View>

				{/* Repositories */}
				<View style={styles.section} break>
					<Text style={styles.sectionTitle}>精选仓库</Text>
					<View style={styles.repoGrid}>
						{data.repositories.slice(0, 9).map((repo, i) => (
							<View key={i} style={styles.repoCard}>
								<Text style={styles.repoName}>{repo.name}</Text>
								<Text style={styles.repoDesc}>{repo.description || 'No description'}</Text>
								<View style={styles.repoMeta}>
									<Text style={{ marginRight: 10 }}>⭐ {repo.stars}</Text>
									<Text style={{ flexDirection: 'row', alignItems: 'center' }}>
										<Text style={{ fontSize: 8 }}>●</Text> {repo.language}
									</Text>
								</View>
							</View>
						))}
					</View>
				</View>
			</Page>
		</Document>
	)
}

const SkillBar = ({ label, value }: { label: string; value: number }) => (
	<View style={styles.skillRow}>
		<Text style={styles.skillLabel}>{label}</Text>
		<View style={styles.skillBarBg}>
			<View style={{ ...styles.skillBarFill, width: `${value}%` }} />
		</View>
		<Text style={{ fontSize: 9, marginLeft: 5, width: 20 }}>{value}</Text>
	</View>
)

export default ProfilePdfDocument
