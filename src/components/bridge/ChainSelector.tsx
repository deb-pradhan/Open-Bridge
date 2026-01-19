import { useMemo, useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useChains, useMultiChainBalances } from '@/hooks/useChains'
import { chainMeta, USDC_ICON } from '@/lib/chains'
import { useAccount } from 'wagmi'

interface ChainSelectorProps {
  label: string
  value: number | null
  onChange: (chainId: number) => void
  excludeChainId?: number
  disabled?: boolean
  showBalance?: boolean
}

export function ChainSelector({
  label,
  value,
  onChange,
  excludeChainId,
  disabled = false,
  showBalance = true,
}: ChainSelectorProps) {
  const { availableChains } = useChains()
  const { isConnected } = useAccount()
  const { balances } = useMultiChainBalances()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredChains = useMemo(() => {
    return availableChains.filter(chain => chain.id !== excludeChainId)
  }, [availableChains, excludeChainId])

  const selectedChain = value ? filteredChains.find(c => c.id === value) : null
  const selectedMeta = value ? chainMeta[value] : null
  const selectedBalance = value ? balances[value] : null

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatBalance = (balance: string | null, decimals = 2) => {
    if (!balance) return '—'
    const num = parseFloat(balance)
    if (num === 0) return '0'
    if (num < 0.01) return '<0.01'
    return num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  }

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-label uppercase tracking-wider text-ink-tertiary mb-2">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full flex items-center justify-between gap-3',
          'bg-surface-subtle border border-border-element',
          'px-3 py-2.5 text-body text-left',
          'focus:outline-none focus:border-accent-main',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors',
          isOpen && 'border-accent-main'
        )}
      >
        {selectedChain && selectedMeta ? (
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-3">
              <ChainIcon 
                src={selectedMeta.icon} 
                name={selectedMeta.name}
                size={24}
              />
              <span className="text-ink-primary font-medium">{selectedMeta.name}</span>
            </div>
            {showBalance && isConnected && selectedBalance && (
              <div className="flex items-center gap-1.5 text-label text-ink-tertiary">
                {selectedBalance.isLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <>
                    <img src={USDC_ICON} alt="USDC" className="w-3.5 h-3.5 rounded-full" />
                    <span className="font-mono">{formatBalance(selectedBalance.usdc)}</span>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="text-ink-tertiary">Select chain</span>
        )}
        <ChevronDown
          size={18}
          className={clsx(
            'text-ink-tertiary transition-transform shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface-card border border-border-grid max-h-80 overflow-auto shadow-lg">
          {filteredChains.map((chain) => {
            const meta = chainMeta[chain.id]
            const isSelected = chain.id === value
            const chainBalance = balances[chain.id]
            
            return (
              <button
                key={chain.id}
                type="button"
                onClick={() => {
                  onChange(chain.id)
                  setIsOpen(false)
                }}
                className={clsx(
                  'w-full flex items-center justify-between gap-3 px-3 py-3 text-left',
                  'border-b border-border-element last:border-b-0',
                  'transition-colors',
                  isSelected && 'bg-accent-subtle',
                  !isSelected && 'hover:bg-surface-subtle'
                )}
              >
                <div className="flex items-center gap-3">
                  <ChainIcon 
                    src={meta?.icon} 
                    name={meta?.name || chain.name}
                    size={28}
                  />
                  <div className="flex flex-col">
                    <span className="text-body text-ink-primary">{meta?.name || chain.name}</span>
                    {showBalance && isConnected && chainBalance && (
                      <div className="flex items-center gap-2 mt-0.5">
                        {chainBalance.isLoading ? (
                          <Loader2 size={10} className="animate-spin text-ink-tertiary" />
                        ) : (
                          <>
                            <span className="text-[11px] font-mono text-ink-tertiary">
                              {formatBalance(chainBalance.usdc)} USDC
                            </span>
                            <span className="text-[11px] text-ink-tertiary">·</span>
                            <span className="text-[11px] font-mono text-ink-tertiary">
                              {formatBalance(chainBalance.native, 4)} {chainBalance.nativeSymbol}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {isSelected && <Check size={16} className="text-accent-main shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Chain icon component with fallback
function ChainIcon({ src, name, size = 24 }: { src?: string; name: string; size?: number }) {
  const [error, setError] = useState(false)
  
  if (!src || error) {
    // Fallback to colored initials
    return (
      <div
        className="rounded-full flex items-center justify-center text-white font-medium shrink-0"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: '#627EEA',
          fontSize: size * 0.4,
        }}
      >
        {name.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className="rounded-full shrink-0 object-contain"
      onError={() => setError(true)}
      style={{ width: size, height: size }}
    />
  )
}
