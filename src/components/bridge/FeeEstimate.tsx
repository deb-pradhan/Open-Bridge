import { Loader2, AlertCircle } from 'lucide-react'
import type { EstimateResult } from '@/hooks/useBridge'

interface FeeEstimateProps {
  estimate: EstimateResult | null
  isLoading: boolean
  error?: string | null
  amount: string
}

export function FeeEstimate({ estimate, isLoading, error, amount }: FeeEstimateProps) {
  if (!amount || parseFloat(amount) <= 0) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-ink-tertiary text-body">
        <Loader2 size={14} className="animate-spin" />
        <span>Estimating fees...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-signal-error text-body">
        <AlertCircle size={14} />
        <span>Failed to estimate fees</span>
      </div>
    )
  }

  if (!estimate) {
    return null
  }

  const amountNum = parseFloat(amount)
  const providerFee = estimate.providerFee ? parseFloat(estimate.providerFee) : 0
  const youWillReceive = amountNum - providerFee

  return (
    <div className="space-y-3 py-4 border-t border-border-element">
      <div className="text-label uppercase tracking-wider text-ink-tertiary">
        FEE BREAKDOWN
      </div>
      
      <div className="space-y-2">
        <FeeRow
          label="You send"
          value={`${formatAmount(amountNum)} USDC`}
        />
        
        {estimate.gasFees.source && (
          <FeeRow
            label="Source gas"
            value={`~${estimate.gasFees.source}`}
            secondary
          />
        )}
        
        {estimate.gasFees.destination && (
          <FeeRow
            label="Destination gas"
            value={`~${estimate.gasFees.destination}`}
            secondary
          />
        )}
        
        {providerFee > 0 && (
          <FeeRow
            label="Protocol fee"
            value={`${formatAmount(providerFee)} USDC`}
            secondary
          />
        )}
        
        <div className="pt-2 border-t border-border-element">
          <FeeRow
            label="You receive"
            value={`${formatAmount(youWillReceive)} USDC`}
            highlight
          />
        </div>
      </div>
    </div>
  )
}

function FeeRow({
  label,
  value,
  secondary = false,
  highlight = false,
}: {
  label: string
  value: string
  secondary?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={secondary ? 'text-label text-ink-tertiary' : 'text-body text-ink-secondary'}>
        {label}
      </span>
      <span
        className={
          highlight
            ? 'text-body font-mono text-accent-main font-medium'
            : secondary
            ? 'text-label font-mono text-ink-tertiary'
            : 'text-body font-mono text-ink-primary'
        }
      >
        {value}
      </span>
    </div>
  )
}

function formatAmount(amount: number): string {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}
