import { forwardRef, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      leftElement,
      rightElement,
      type = 'text',
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-label uppercase tracking-wider text-ink-tertiary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary">
              {leftElement}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={clsx(
              'w-full bg-surface-subtle border border-border-element rounded-none',
              'px-4 py-3 text-body text-ink-primary font-mono',
              'placeholder:text-ink-tertiary',
              'focus:outline-none focus:border-accent-main',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              leftElement && 'pl-12',
              rightElement && 'pr-12',
              error && 'border-signal-error focus:border-signal-error',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-tertiary">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-label text-signal-error">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-2 text-label text-ink-tertiary">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Specialized number input for amounts
export interface AmountInputProps extends Omit<InputProps, 'type' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  maxDecimals?: number
}

export const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onChange, maxDecimals = 6, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      
      // Allow empty string
      if (val === '') {
        onChange('')
        return
      }

      // Validate number format
      const regex = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`)
      if (regex.test(val)) {
        onChange(val)
      }
    }

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        {...props}
      />
    )
  }
)

AmountInput.displayName = 'AmountInput'
