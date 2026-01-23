export function getFriendlyErrorMessage(
	error: unknown,
	defaultMessage = '操作失败，请稍后重试'
): string {
	console.error('Operation failed:', error)

	if (typeof error === 'string') {
		return sanitizeMessage(error) || defaultMessage
	}

	if (error instanceof Error) {
		return sanitizeMessage(error.message) || defaultMessage
	}

	return defaultMessage
}

function sanitizeMessage(msg: string): string | null {
	const safePatterns = [
		/用户.*不存在/i,
		/GitHub.*不可用/i,
		/Rate limit/i,
		/分析失败/i,
		/无法获取/i,
		/超时/i,
		/User not found/i,
		/Validation failed/i,
	]

	const isSafe = safePatterns.some((pattern) => pattern.test(msg))

	if (isSafe) {
		return msg
	}

	if (msg.includes(' /') || msg.includes('{') || msg.includes(' at ')) {
		return null
	}

	return msg.length < 150 ? msg : null
}
