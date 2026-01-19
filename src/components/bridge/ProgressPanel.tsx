import { useState, useEffect } from 'react'
import { Check, Loader2, Clock, Shield, Flame, Coins, ArrowRight, ExternalLink, Timer } from 'lucide-react'
import { useBridgeContext, getElapsedTime, type EnhancedTransferStep } from '@/context/BridgeContext'
import { chainMeta, USDC_ICON } from '@/lib/chains'
import { getEstimatedFinality } from '@/lib/cctp-api'

const STEP_CONFIG = {
  approve: {
    number: 1,
    title: 'Approve USDC',
    description: 'Grant TokenMessenger permission',
    icon: Shield,
  },
  burn: {
    number: 2,
    title: 'Burn on Source',
    description: 'Deposit USDC for cross-chain transfer',
    icon: Flame,
  },
  fetchAttestation: {
    number: 3,
    title: 'Circle Attestation',
    description: 'Waiting for Circle to validate',
    icon: Clock,
  },
  mint: {
    number: 4,
    title: 'Mint on Destination',
    description: 'Receive USDC on destination',
    icon: Coins,
  },
}

// Chain icon component
function ChainIcon({ chainId, size = 20 }: { chainId: number; size?: number }) {
  const meta = chainMeta[chainId]
  if (!meta?.icon) {
    return (
      <div
        className="rounded-full flex items-center justify-center text-white font-medium"
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: meta?.color || '#627EEA',
          fontSize: size * 0.4,
        }}
      >
        {meta?.shortName?.slice(0, 2) || '??'}
      </div>
    )
  }
  return (
    <img
      src={meta.icon}
      alt={meta.name}
      width={size}
      height={size}
      className="rounded-full shrink-0"
      style={{ width: size, height: size }}
    />
  )
}

// Elapsed time display with auto-update
function ElapsedTime({ startedAt, completedAt }: { startedAt?: number; completedAt?: number }) {
  const [elapsed, setElapsed] = useState('')
  
  useEffect(() => {
    if (!startedAt) return
    
    const update = () => setElapsed(getElapsedTime(startedAt, completedAt))
    update()
    
    if (!completedAt) {
      const interval = setInterval(update, 1000)
      return () => clearInterval(interval)
    }
  }, [startedAt, completedAt])
  
  if (!startedAt) return null
  
  return (
    <span className="text-[11px] font-mono text-ink-tertiary">
      {elapsed}
    </span>
  )
}

// Total transfer time display
function TotalTransferTime({ startedAt }: { startedAt: number | null }) {
  const [elapsed, setElapsed] = useState('')
  
  useEffect(() => {
    if (!startedAt) return
    
    const update = () => setElapsed(getElapsedTime(startedAt))
    update()
    
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startedAt])
  
  if (!startedAt) return null
  
  return (
    <div className="flex items-center gap-1.5 text-label text-ink-tertiary">
      <Timer size={12} />
      <span className="font-mono">{elapsed}</span>
    </div>
  )
}

export function ProgressPanel() {
  const { 
    steps, 
    currentStep, 
    state, 
    sourceChainId, 
    destChainId, 
    amount,
    transferSpeed,
    transferStartedAt,
  } = useBridgeContext()
  
  const sourceMeta = sourceChainId ? chainMeta[sourceChainId] : null
  const destMeta = destChainId ? chainMeta[destChainId] : null
  const showTransferSummary = sourceChainId && destChainId && amount
  const isTransferring = state === 'bridging' || state === 'confirming'
  const finality = getEstimatedFinality(transferSpeed)

  return (
    <div className="bg-surface-card border border-border-grid relative">
      {/* Crosshair decoration */}
      <div className="absolute -top-[5px] -right-[5px] text-accent-main font-mono text-sm">+</div>
      <div className="absolute -bottom-[5px] -right-[5px] text-accent-main font-mono text-sm">+</div>
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-element flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-ink-tertiary" />
          <span className="text-h2 text-ink-primary">Progress</span>
        </div>
        {isTransferring && <TotalTransferTime startedAt={transferStartedAt} />}
      </div>
      
      {/* Transfer Summary (when chains are selected) */}
      {showTransferSummary && (
        <div className="px-5 py-4 border-b border-border-element">
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2">
              <ChainIcon chainId={sourceChainId} size={24} />
              <span className="text-label text-ink-secondary">{sourceMeta?.shortName}</span>
            </div>
            <ArrowRight size={16} className="text-accent-main" />
            <div className="flex items-center gap-2">
              <ChainIcon chainId={destChainId} size={24} />
              <span className="text-label text-ink-secondary">{destMeta?.shortName}</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 mt-2">
            {parseFloat(amount) > 0 && (
              <div className="flex items-center gap-1.5">
                <img src={USDC_ICON} alt="USDC" width={16} height={16} className="rounded-full" />
                <span className="text-body font-mono text-ink-primary font-medium">
                  {parseFloat(amount).toLocaleString()} USDC
                </span>
              </div>
            )}
            <span className="text-ink-tertiary">·</span>
            <span className={`px-1.5 py-0.5 text-[10px] uppercase tracking-wider border ${
              transferSpeed === 'fast' 
                ? 'text-signal-success border-signal-success bg-signal-success/10' 
                : 'text-ink-tertiary border-border-element bg-surface-subtle'
            }`}>
              {transferSpeed === 'fast' ? 'FAST' : 'STANDARD'}
            </span>
          </div>
        </div>
      )}
      
      {/* Steps */}
      <div className="p-5 space-y-0">
        {steps.map((step, index) => {
          const config = STEP_CONFIG[step.name as keyof typeof STEP_CONFIG]
          if (!config) return null
          
          const isComplete = step.state === 'success'
          const isInProgress = step.state === 'in_progress'
          const isError = step.state === 'error'
          const hasTxHash = !!(step as EnhancedTransferStep).txHash
          const explorerUrl = (step as EnhancedTransferStep).explorerUrl
          const startedAt = (step as EnhancedTransferStep).startedAt
          const completedAt = (step as EnhancedTransferStep).completedAt
          
          return (
            <div key={step.name} className="flex gap-4">
              {/* Step indicator column */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-label font-medium transition-all ${
                    isComplete
                      ? 'bg-signal-success text-white'
                      : isInProgress
                      ? 'bg-accent-main text-white'
                      : isError
                      ? 'bg-signal-error text-white'
                      : 'bg-surface-subtle text-ink-tertiary border border-border-element'
                  }`}
                >
                  {isComplete ? (
                    <Check size={14} />
                  ) : isInProgress ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    config.number
                  )}
                </div>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div
                    className={`w-px h-16 transition-colors ${
                      isComplete ? 'bg-signal-success' : 'bg-border-element'
                    }`}
                  />
                )}
              </div>
              
              {/* Step content */}
              <div className="flex-1 pb-5">
                <div className="flex items-center justify-between">
                  <div
                    className={`text-body font-medium ${
                      isComplete
                        ? 'text-signal-success'
                        : isInProgress
                        ? 'text-accent-main'
                        : isError
                        ? 'text-signal-error'
                        : 'text-ink-secondary'
                    }`}
                  >
                    {config.title}
                  </div>
                  {(startedAt || completedAt) && (
                    <ElapsedTime startedAt={startedAt} completedAt={completedAt} />
                  )}
                </div>
                <div className="text-label text-ink-tertiary mt-0.5">
                  {config.description}
                </div>
                
                {/* Transaction hash link */}
                {hasTxHash && explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-mono text-accent-main hover:underline"
                  >
                    <span>{(step as EnhancedTransferStep).txHash?.slice(0, 10)}...{(step as EnhancedTransferStep).txHash?.slice(-8)}</span>
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Status message for attestation */}
      {currentStep === 'fetchAttestation' && state === 'bridging' && (
        <div className="px-5 pb-5">
          <div className="p-3 bg-accent-subtle border border-accent-main text-body text-ink-secondary">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">Waiting for attestation...</span>
              <span className="text-label font-mono">{finality.label}</span>
            </div>
            <p className="text-label text-ink-tertiary">
              {transferSpeed === 'fast' 
                ? 'Fast Transfer uses soft finality for quick confirmation.'
                : 'Standard Transfer waits for hard finality on source chain.'}
            </p>
          </div>
        </div>
      )}
      
      {/* Success state */}
      {state === 'success' && (
        <div className="px-5 pb-5">
          <div className="p-3 bg-signal-success/10 border border-signal-success text-body text-signal-success">
            <div className="flex items-center justify-center gap-2">
              <Check size={18} />
              <span className="font-medium">Transfer complete!</span>
            </div>
            {transferStartedAt && (
              <div className="text-center mt-1 text-label opacity-80">
                Total time: {getElapsedTime(transferStartedAt, Date.now())}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Error state */}
      {state === 'error' && (
        <div className="px-5 pb-5">
          <div className="p-3 bg-signal-error/10 border border-signal-error text-body text-signal-error text-center">
            Transfer failed. Please try again.
          </div>
        </div>
      )}
    </div>
  )
}
