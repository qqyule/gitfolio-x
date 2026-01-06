import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps extends React.ComponentProps<'input'> {
	cosmic?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, cosmic = false, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300',
					cosmic &&
						'h-14 rounded-xl bg-card/30 backdrop-blur-md border-border/50 text-lg px-6 focus-visible:border-primary focus-visible:shadow-lg focus-visible:shadow-primary/20',
					className
				)}
				ref={ref}
				{...props}
			/>
		)
	}
)
Input.displayName = 'Input'

export { Input }
