import { useState, useRef, useEffect, type ReactNode } from 'react'
import { clsx } from 'clsx'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption<T = string> {
  value: T
  label: string
  icon?: ReactNode
  description?: string
  disabled?: boolean
}

export interface SelectProps<T = string> {
  label?: string
  value: T | null
  onChange: (value: T) => void
  options: SelectOption<T>[]
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
  renderOption?: (option: SelectOption<T>, isSelected: boolean) => ReactNode
}

export function Select<T = string>({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  error,
  className,
  renderOption,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={clsx('w-full', className)} ref={containerRef}>
      {label && (
        <label className="block text-label uppercase tracking-wider text-ink-tertiary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={clsx(
            'w-full flex items-center justify-between gap-3',
            'bg-surface-subtle border border-border-element rounded-none',
            'px-4 py-3 text-body text-left',
            'focus:outline-none focus:border-accent-main',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            isOpen && 'border-accent-main',
            error && 'border-signal-error'
          )}
        >
          {selectedOption ? (
            <span className="flex items-center gap-3 text-ink-primary">
              {selectedOption.icon}
              <span>{selectedOption.label}</span>
            </span>
          ) : (
            <span className="text-ink-tertiary">{placeholder}</span>
          )}
          <ChevronDown
            size={18}
            className={clsx(
              'text-ink-tertiary transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-surface-card border border-border-grid max-h-64 overflow-auto">
            {options.map((option, index) => {
              const isSelected = option.value === value
              
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (!option.disabled) {
                      onChange(option.value)
                      setIsOpen(false)
                    }
                  }}
                  disabled={option.disabled}
                  className={clsx(
                    'w-full flex items-center justify-between gap-3 px-4 py-3 text-left',
                    'border-b border-border-element last:border-b-0',
                    'transition-colors',
                    isSelected && 'bg-accent-subtle',
                    !option.disabled && 'hover:bg-surface-subtle',
                    option.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {renderOption ? (
                    renderOption(option, isSelected)
                  ) : (
                    <>
                      <span className="flex items-center gap-3">
                        {option.icon}
                        <span className="flex flex-col">
                          <span className="text-body text-ink-primary">{option.label}</span>
                          {option.description && (
                            <span className="text-label text-ink-tertiary">{option.description}</span>
                          )}
                        </span>
                      </span>
                      {isSelected && <Check size={16} className="text-accent-main" />}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-2 text-label text-signal-error">{error}</p>
      )}
    </div>
  )
}
