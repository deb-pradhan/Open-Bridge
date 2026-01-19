import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all rounded-pill disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-main focus-visible:ring-offset-2'
    
    const variantStyles = {
      primary: 'bg-accent-main text-ink-on-accent hover:bg-accent-hover active:bg-accent-main',
      secondary: 'bg-transparent text-accent-main border border-accent-main hover:bg-accent-subtle active:bg-accent-subtle/50',
      ghost: 'bg-transparent text-ink-secondary hover:bg-surface-subtle active:bg-surface-subtle/50',
    }

    const sizeStyles = {
      sm: 'px-4 py-2 text-label',
      md: 'px-6 py-3 text-body',
      lg: 'px-8 py-4 text-h2',
    }

    return (
      <button
        ref={ref}
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
