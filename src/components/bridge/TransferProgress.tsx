import { Check, Loader2, X, ExternalLink, RotateCcw, ArrowRight } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import type { TransferStep } from '@/lib/bridge-kit'
import type { TransferState } from '@/hooks/useBridge'
import { chainMeta } from '@/lib/chains'

interface TransferProgressProps {
  steps: TransferStep[]
  currentStep: string | null
  state: TransferState
  error: string | null
  sourceChainId: number
  destChainId: number
  amount: string
  onRetry: () => void
  onReset: () => void
}

const STEP_LABELS: Record<string, { label: string; description: string }> = {
  approve: {
    label: 'Approve',
    description: 'Approve USDC spending',
  },
  burn: {
    label: 'Burn',
    description: 'Burn USDC on source chain',
  },
  fetchAttestation: {
    label: 'Attestation',
    description: 'Waiting for Circle attestation',
  },
  mint: {
    label: 'Mint',
    description: 'Mint USDC on destination chain',
  },
}

export function TransferProgress({
  steps,
  currentStep,
  state,
  error,
  sourceChainId,
  destChainId,
  amount,
  onRetry,
  onReset,
}: TransferProgressProps) {
  const sourceMeta = chainMeta[sourceChainId]
  const destMeta = chainMeta[destChainId]

  return (
    <Card title="Transfer Progress" showCrosshair={false}>
      <div className="space-y-6">
        {/* Transfer Summary */}
        <div className="flex items-center justify-center gap-3 py-4 bg-surface-subtle border border-border-element">
          <div className="text-center">
            <div className="text-label text-ink-tertiary uppercase">From</div>
            <div className="text-body font-medium">{sourceMeta?.name || 'Source'}</div>
          </div>
          <ArrowRight size={20} className="text-accent-main" />
          <div className="text-center">
            <div className="text-label text-ink-tertiary uppercase">To</div>
            <div className="text-body font-medium">{destMeta?.name || 'Destination'}</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-display-xl font-light text-ink-primary font-mono">
            {parseFloat(amount).toLocaleString()} <span className="text-h1">USDC</span>
          </div>
        </div>

        {/* Steps Progress */}
        <div className="space-y-1">
          {steps.map((step, index) => (
            <StepItem
              key={step.name}
              step={step}
              label={STEP_LABELS[step.name]?.label || step.name}
              description={STEP_LABELS[step.name]?.description || ''}
              isCurrent={currentStep === step.name}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Status Message */}
        {state === 'success' && (
          <div className="p-4 bg-signal-success/10 border border-signal-success text-signal-success text-center">
            <Check size={24} className="mx-auto mb-2" />
            <div className="text-body font-medium">Transfer Complete!</div>
            <div className="text-label mt-1">
              Your USDC has been bridged to {destMeta?.name}
            </div>
          </div>
        )}

        {state === 'error' && error && (
          <div className="p-4 bg-signal-error/10 border border-signal-error text-signal-error">
            <X size={24} className="mx-auto mb-2" />
            <div className="text-body font-medium text-center">Transfer Failed</div>
            <div className="text-label mt-1 text-center">{error}</div>
          </div>
        )}

        {/* Attestation Note */}
        {currentStep === 'fetchAttestation' && (
          <div className="p-4 bg-accent-subtle border border-accent-main text-ink-secondary text-body">
            <strong>Please wait.</strong> Circle is attesting the burn transaction. 
            This usually takes about 15 seconds for fast transfers, but may take longer during high traffic.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {state === 'error' && (
            <Button
              onClick={onRetry}
              variant="secondary"
              className="flex-1"
              leftIcon={<RotateCcw size={16} />}
            >
              Retry
            </Button>
          )}
          
          {(state === 'success' || state === 'error') && (
            <Button
              onClick={onReset}
              variant={state === 'success' ? 'primary' : 'ghost'}
              className="flex-1"
            >
              {state === 'success' ? 'Bridge Again' : 'Start Over'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

interface StepItemProps {
  step: TransferStep
  label: string
  description: string
  isCurrent: boolean
  isLast: boolean
}

function StepItem({ step, label, description, isLast }: StepItemProps) {
  return (
    <div className="flex gap-4">
      {/* Step Indicator */}
      <div className="flex flex-col items-center">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
            step.state === 'success'
              ? 'bg-signal-success border-signal-success text-white'
              : step.state === 'error'
              ? 'bg-signal-error border-signal-error text-white'
              : step.state === 'in_progress'
              ? 'bg-accent-main border-accent-main text-white'
              : 'bg-surface-subtle border-border-grid text-ink-tertiary'
          }`}
        >
          {step.state === 'success' ? (
            <Check size={16} />
          ) : step.state === 'error' ? (
            <X size={16} />
          ) : step.state === 'in_progress' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <span className="text-label font-medium">
              {['approve', 'burn', 'fetchAttestation', 'mint'].indexOf(step.name) + 1}
            </span>
          )}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 h-8 transition-colors ${
              step.state === 'success' ? 'bg-signal-success' : 'bg-border-grid'
            }`}
          />
        )}
      </div>

      {/* Step Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center justify-between">
          <span
            className={`text-body font-medium ${
              step.state === 'success'
                ? 'text-signal-success'
                : step.state === 'error'
                ? 'text-signal-error'
                : step.state === 'in_progress'
                ? 'text-accent-main'
                : 'text-ink-tertiary'
            }`}
          >
            {label}
          </span>
          {step.txHash && (
            <a
              href={`https://etherscan.io/tx/${step.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-label text-accent-main hover:underline flex items-center gap-1"
            >
              View <ExternalLink size={12} />
            </a>
          )}
        </div>
        <p className="text-label text-ink-tertiary mt-0.5">{description}</p>
        {step.error && (
          <p className="text-label text-signal-error mt-1">{step.error}</p>
        )}
      </div>
    </div>
  )
}
