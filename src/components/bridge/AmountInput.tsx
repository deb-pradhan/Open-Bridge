import { AmountInput as BaseAmountInput } from '@/components/ui'
import { useUsdcBalance } from '@/hooks/useChains'
import { Loader2 } from 'lucide-react'

interface BridgeAmountInputProps {
  value: string
  onChange: (value: string) => void
  chainId: number | null
  disabled?: boolean
}

export function BridgeAmountInput({
  value,
  onChange,
  chainId,
  disabled = false,
}: BridgeAmountInputProps) {
  const { balance, isLoading } = useUsdcBalance(chainId ?? undefined)

  const handleMax = () => {
    if (balance) {
      onChange(balance)
    }
  }

  const formattedBalance = balance
    ? parseFloat(balance).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      })
    : null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-label uppercase tracking-wider text-ink-tertiary">
          AMOUNT
        </label>
        {chainId && (
          <div className="flex items-center gap-2 text-label text-ink-tertiary">
            <span>Balance:</span>
            {isLoading ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <button
                type="button"
                onClick={handleMax}
                disabled={disabled || !balance}
                className="font-mono text-accent-main hover:underline disabled:no-underline disabled:text-ink-tertiary"
              >
                {formattedBalance ?? '—'} USDC
              </button>
            )}
          </div>
        )}
      </div>
      
      <BaseAmountInput
        value={value}
        onChange={onChange}
        placeholder="0.00"
        disabled={disabled}
        maxDecimals={6}
        rightElement={
          <span className="text-label font-medium text-ink-secondary">USDC</span>
        }
      />
    </div>
  )
}
