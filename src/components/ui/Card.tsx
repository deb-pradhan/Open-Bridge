import { forwardRef, type HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { ArrowUpRight } from 'lucide-react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  headerAction?: React.ReactNode
  noPadding?: boolean
  showCrosshair?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      title,
      headerAction,
      noPadding = false,
      showCrosshair = true,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'relative bg-surface-card border border-border-grid',
          showCrosshair && 'grid-cell',
          className
        )}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-element">
            <h2 className="text-h2 font-normal text-ink-primary">{title}</h2>
            {headerAction || (
              <ArrowUpRight size={18} className="text-accent-main" />
            )}
          </div>
        )}
        <div className={clsx(!noPadding && 'p-5')}>
          {children}
        </div>
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card section for internal divisions
export interface CardSectionProps extends HTMLAttributes<HTMLDivElement> {
  label?: string
}

export const CardSection = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'py-4 border-b border-border-element last:border-b-0',
          className
        )}
        {...props}
      >
        {label && (
          <label className="block text-label uppercase tracking-wider text-ink-tertiary mb-3">
            {label}
          </label>
        )}
        {children}
      </div>
    )
  }
)

CardSection.displayName = 'CardSection'
