import { AlertTriangle, ArrowRight, RefreshCw, X, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useBridgeContext, type PersistedTransfer } from '@/context/BridgeContext'
import { chainMeta, USDC_ICON } from '@/lib/chains'
import { getElapsedTime } from '@/lib/storage'

function ChainIcon({ chainId, size = 16 }: { chainId: number; size?: number }) {
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

interface PendingTransferCardProps {
  transfer: PersistedTransfer
  onResume: () => void
  onDismiss: () => void
  isResuming: boolean
}

function PendingTransferCard({ transfer, onResume, onDismiss, isResuming }: PendingTransferCardProps) {
  const sourceMeta = chainMeta[transfer.sourceChainId]
  const destMeta = chainMeta[transfer.destChainId]
  const timeAgo = getElapsedTime(transfer.startedAt)

  return (
    <div className="bg-signal-warning/10 border border-signal-warning p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-signal-warning/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-signal-warning" />
          </div>
          
          <div>
            <div className="text-body font-medium text-ink-primary mb-1">
              Incomplete Transfer
            </div>
            <div className="flex items-center gap-2 text-label text-ink-secondary">
              <div className="flex items-center gap-1.5">
                <img src={USDC_ICON} alt="USDC" className="w-4 h-4 rounded-full" />
                <span className="font-mono">{parseFloat(transfer.amount).toLocaleString()} USDC</span>
              </div>
              <span className="text-ink-tertiary">·</span>
              <div className="flex items-center gap-1">
                <ChainIcon chainId={transfer.sourceChainId} size={14} />
                <span>{sourceMeta?.shortName}</span>
                <ArrowRight size={10} className="text-ink-tertiary" />
                <ChainIcon chainId={transfer.destChainId} size={14} />
                <span>{destMeta?.shortName}</span>
              </div>
              <span className="text-ink-tertiary">·</span>
              <span className="text-ink-tertiary">{timeAgo} ago</span>
            </div>
            <div className="text-[11px] text-ink-tertiary mt-1">
              Burn confirmed. Waiting for attestation and mint.
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onResume}
            disabled={isResuming}
            className="flex items-center gap-2 px-4 py-2 bg-signal-warning text-white text-label font-medium rounded-pill hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isResuming ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            <span>{isResuming ? 'Resuming...' : 'Resume'}</span>
          </button>
          
          <button
            onClick={onDismiss}
            className="p-2 text-ink-tertiary hover:text-ink-primary transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function PendingRecoveryBanner() {
  const { pendingTransfers, resumeTransfer, state } = useBridgeContext()
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [resumingId, setResumingId] = useState<string | null>(null)
  
  const visibleTransfers = pendingTransfers.filter(t => !dismissedIds.has(t.id))
  
  if (visibleTransfers.length === 0) {
    return null
  }
  
  const handleResume = async (transfer: PersistedTransfer) => {
    setResumingId(transfer.id)
    try {
      await resumeTransfer(transfer)
    } finally {
      setResumingId(null)
    }
  }
  
  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]))
  }
  
  return (
    <div className="space-y-3 mb-6">
      {visibleTransfers.map(transfer => (
        <PendingTransferCard
          key={transfer.id}
          transfer={transfer}
          onResume={() => handleResume(transfer)}
          onDismiss={() => handleDismiss(transfer.id)}
          isResuming={resumingId === transfer.id || state === 'bridging'}
        />
      ))}
    </div>
  )
}
