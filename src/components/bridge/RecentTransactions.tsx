import { Clock, ArrowRight, ExternalLink, Check, X, Loader2, Zap } from 'lucide-react'
import { ChainIcon } from '@/components/ui'
import { useBridgeContext } from '@/context/BridgeContext'
import { chainMeta, USDC_ICON, getExplorerTxUrl } from '@/lib/chains'

export function RecentTransactions() {
  const { transactions } = useBridgeContext()
  
  if (transactions.length === 0) {
    return (
      <div className="bg-surface-card border border-border-grid relative">
        {/* Crosshair decoration */}
        <div className="absolute -top-[5px] -right-[5px] text-accent-main font-mono text-sm">+</div>
        
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border-element flex items-center gap-2">
          <Clock size={16} className="text-ink-tertiary" />
          <span className="text-h2 text-ink-primary">Recent Transactions</span>
        </div>
        
        <div className="p-6 sm:p-8 text-center">
          <Clock size={24} className="mx-auto text-ink-tertiary mb-2" />
          <p className="text-body text-ink-tertiary">No transactions yet</p>
          <p className="text-label text-ink-tertiary mt-1">
            Your bridge history will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface-card border border-border-grid relative">
      {/* Crosshair decoration */}
      <div className="absolute -top-[5px] -right-[5px] text-accent-main font-mono text-sm">+</div>
      
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border-element flex items-center gap-2">
        <Clock size={16} className="text-ink-tertiary" />
        <span className="text-h2 text-ink-primary">Recent Transactions</span>
      </div>
      
      <div className="divide-y divide-border-element">
        {transactions.map((tx) => {
          const sourceMeta = chainMeta[tx.sourceChainId]
          const destMeta = chainMeta[tx.destChainId]
          const timeAgo = getTimeAgo(tx.timestamp)
          const explorerUrl = tx.txHash && tx.txHashChainId 
            ? getExplorerTxUrl(tx.txHashChainId, tx.txHash) 
            : null
          
          return (
            <div key={tx.id} className="px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                {/* Status icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  tx.status === 'success' 
                    ? 'bg-signal-success/10 text-signal-success'
                    : tx.status === 'failed'
                    ? 'bg-signal-error/10 text-signal-error'
                    : 'bg-accent-subtle text-accent-main'
                }`}>
                  {tx.status === 'success' ? (
                    <Check size={14} />
                  ) : tx.status === 'failed' ? (
                    <X size={14} />
                  ) : (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                </div>
                
                {/* Transaction details */}
                <div>
                  <div className="flex items-center gap-2 text-body">
                    <img src={USDC_ICON} alt="USDC" width={16} height={16} className="rounded-full" />
                    <span className="text-ink-primary font-medium font-mono">
                      {parseFloat(tx.amount).toLocaleString()} USDC
                    </span>
                    {tx.transferSpeed === 'fast' && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-signal-success border border-signal-success bg-signal-success/10">
                        <Zap size={10} />
                        FAST
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-label text-ink-tertiary mt-1">
                    <ChainIcon chainId={tx.sourceChainId} size={14} />
                    <span>{sourceMeta?.shortName || 'Source'}</span>
                    <ArrowRight size={10} />
                    <ChainIcon chainId={tx.destChainId} size={14} />
                    <span>{destMeta?.shortName || 'Dest'}</span>
                    <span className="ml-2">· {timeAgo}</span>
                  </div>
                </div>
              </div>
              
              {/* Link to explorer */}
              {tx.txHash && explorerUrl && (
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-label text-accent-main hover:underline flex items-center gap-1"
                >
                  View
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
