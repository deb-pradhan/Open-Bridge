import { useEffect, useRef } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ArrowLeftRight, Loader2, Zap, Clock, Info } from 'lucide-react'
import { Button } from '@/components/ui'
import { ChainSelector } from './ChainSelector'
import { useBridgeContext } from '@/context/BridgeContext'
import { chainMeta, USDC_ICON } from '@/lib/chains'
import { useUsdcBalance } from '@/hooks/useChains'
import { type TransferSpeed, calculateCCTPFee, getEstimatedFinality } from '@/lib/cctp-api'

// USDC Token Icon Component
function UsdcIcon({ size = 20 }: { size?: number }) {
  return (
    <img
      src={USDC_ICON}
      alt="USDC"
      width={size}
      height={size}
      className="rounded-full shrink-0"
      style={{ width: size, height: size }}
    />
  )
}

// Transfer Speed Toggle Component
function TransferSpeedToggle({ 
  value, 
  onChange,
  fastFeeBps,
  amount,
}: { 
  value: TransferSpeed
  onChange: (speed: TransferSpeed) => void
  fastFeeBps: number
  amount: string
}) {
  const fastFinality = getEstimatedFinality('fast')
  const standardFinality = getEstimatedFinality('standard')
  const fastFeeUsdc = calculateCCTPFee(amount || '1000', fastFeeBps)
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-label uppercase tracking-wider text-ink-tertiary">TRANSFER SPEED</span>
        <div className="flex items-center gap-1">
          <Info size={12} className="text-ink-tertiary" />
          <a 
            href="https://developers.circle.com/cctp/concepts/fees" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-ink-tertiary hover:text-accent-main"
          >
            Learn more
          </a>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Fast Transfer Option */}
        <button
          type="button"
          onClick={() => onChange('fast')}
          className={`p-3 border text-left transition-all ${
            value === 'fast'
              ? 'border-signal-success bg-signal-success/5'
              : 'border-border-element hover:border-border-grid bg-surface-subtle'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className={value === 'fast' ? 'text-signal-success' : 'text-ink-tertiary'} />
            <span className={`text-body font-medium ${value === 'fast' ? 'text-signal-success' : 'text-ink-primary'}`}>
              Fast
            </span>
          </div>
          <div className="text-[11px] text-ink-tertiary">{fastFinality.label}</div>
          <div className="text-[11px] font-mono text-ink-secondary mt-1">
            {fastFeeBps > 0 ? `~${fastFeeUsdc} USDC fee` : 'Free'}
          </div>
        </button>
        
        {/* Standard Transfer Option */}
        <button
          type="button"
          onClick={() => onChange('standard')}
          className={`p-3 border text-left transition-all ${
            value === 'standard'
              ? 'border-accent-main bg-accent-subtle'
              : 'border-border-element hover:border-border-grid bg-surface-subtle'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Clock size={14} className={value === 'standard' ? 'text-accent-main' : 'text-ink-tertiary'} />
            <span className={`text-body font-medium ${value === 'standard' ? 'text-accent-main' : 'text-ink-primary'}`}>
              Standard
            </span>
          </div>
          <div className="text-[11px] text-ink-tertiary">{standardFinality.label}</div>
          <div className="text-[11px] font-mono text-signal-success mt-1">
            Free
          </div>
        </button>
      </div>
    </div>
  )
}

export function BridgeForm() {
  const { chain: connectedChain, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const { openConnectModal } = useConnectModal()
  
  const {
    sourceChainId,
    destChainId,
    amount,
    setSourceChainId,
    setDestChainId,
    setAmount,
    swapChains,
    transferSpeed,
    setTransferSpeed,
    cctpFees,
    state,
    estimate,
    estimateFees,
    executeBridge,
  } = useBridgeContext()
  
  const { balance, isLoading: balanceLoading } = useUsdcBalance(sourceChainId ?? undefined)
  
  // Track previous params to avoid unnecessary refetches
  const lastEstimateParams = useRef<string>('')

  // Set source chain to connected chain
  useEffect(() => {
    if (connectedChain && !sourceChainId) {
      setSourceChainId(connectedChain.id)
    }
  }, [connectedChain, sourceChainId, setSourceChainId])

  // Estimate fees when params change (including transfer speed)
  useEffect(() => {
    if (!isConnected || !sourceChainId || !destChainId || !amount || parseFloat(amount) <= 0) {
      return
    }
    
    const paramsKey = `${sourceChainId}-${destChainId}-${amount}-${transferSpeed}`
    if (paramsKey === lastEstimateParams.current) {
      return
    }
    
    const timer = setTimeout(() => {
      lastEstimateParams.current = paramsKey
      estimateFees()
    }, 800)
    
    return () => clearTimeout(timer)
  }, [isConnected, sourceChainId, destChainId, amount, transferSpeed, estimateFees])

  const handleBridge = async () => {
    if (!isConnected) {
      openConnectModal?.()
      return
    }
    
    if (!sourceChainId || !destChainId || !amount) return

    if (connectedChain?.id !== sourceChainId) {
      try {
        await switchChain({ chainId: sourceChainId as any })
      } catch (err) {
        console.error('Failed to switch network:', err)
        return
      }
    }

    await executeBridge()
  }

  const handleSourceChange = (chainId: number) => {
    setSourceChainId(chainId)
    if (chainId === destChainId) {
      setDestChainId(null)
    }
  }

  const handleMaxClick = () => {
    if (balance) {
      setAmount(balance)
    }
  }

  const canBridge = 
    !isConnected || 
    (sourceChainId !== null &&
    destChainId !== null &&
    amount !== '' &&
    parseFloat(amount) > 0 &&
    state === 'idle')

  const sourceMeta = sourceChainId ? chainMeta[sourceChainId] : null
  const destMeta = destChainId ? chainMeta[destChainId] : null
  
  const amountNum = parseFloat(amount) || 0
  const providerFee = estimate?.providerFee ? parseFloat(estimate.providerFee) : 0
  const cctpFeeNum = estimate?.cctpFee ? parseFloat(estimate.cctpFee) : 0
  const youReceive = amountNum - providerFee - cctpFeeNum

  return (
    <div className="bg-surface-card border border-border-grid relative">
      {/* Crosshair decoration */}
      <div className="absolute -top-[5px] -left-[5px] text-accent-main font-mono text-sm">+</div>
      <div className="absolute -top-[5px] -right-[5px] text-accent-main font-mono text-sm">+</div>
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-border-element flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsdcIcon size={22} />
          <span className="text-h2 text-ink-primary">Bridge USDC</span>
        </div>
        <span className="px-2.5 py-1 text-label uppercase tracking-wider text-accent-main border border-accent-main bg-accent-subtle flex items-center gap-1.5">
          <UsdcIcon size={14} />
          USDC Only
        </span>
      </div>
      
      {/* Chain Selectors - Horizontal Layout */}
      <div className="p-5 border-b border-border-element">
        {/* Labels Row */}
        <div className="flex items-center mb-2">
          <span className="flex-1 text-label uppercase tracking-wider text-ink-tertiary">FROM</span>
          <span className="w-12" /> {/* Spacer for swap button */}
          <span className="flex-1 text-label uppercase tracking-wider text-ink-tertiary">TO</span>
        </div>
        
        {/* Selectors Row */}
        <div className="flex items-center gap-3">
          {/* From Chain */}
          <div className="flex-1">
            <ChainSelector
              label=""
              value={sourceChainId}
              onChange={handleSourceChange}
              excludeChainId={destChainId ?? undefined}
            />
          </div>
          
          {/* Swap Button */}
          <button
            onClick={swapChains}
            disabled={!sourceChainId || !destChainId}
            className="p-2.5 bg-surface-subtle border border-border-element hover:border-accent-main disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <ArrowLeftRight size={18} className="text-accent-main" />
          </button>
          
          {/* To Chain */}
          <div className="flex-1">
            <ChainSelector
              label=""
              value={destChainId}
              onChange={setDestChainId}
              excludeChainId={sourceChainId ?? undefined}
            />
          </div>
        </div>
      </div>
      
      {/* Amount Input */}
      <div className="p-5 border-b border-border-element">
        <div className="flex items-center justify-between mb-2">
          <label className="text-label uppercase tracking-wider text-ink-tertiary">
            AMOUNT
          </label>
          {isConnected && sourceChainId ? (
            <div className="flex items-center gap-1 text-label text-ink-tertiary">
              {balanceLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <>
                  <button
                    onClick={handleMaxClick}
                    disabled={!balance}
                    className="text-accent-main hover:underline disabled:text-ink-tertiary disabled:no-underline font-mono"
                  >
                    {balance ? `${parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} USDC` : '—'}
                  </button>
                </>
              )}
            </div>
          ) : (
            <span className="text-label text-ink-tertiary">
              Connect wallet to view balance
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3 bg-surface-subtle border border-border-element p-3">
          <input
            type="text"
            value={amount}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9.]/g, '')
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setAmount(value)
              }
            }}
            placeholder="0.00"
            className="flex-1 bg-transparent text-h1 font-light text-ink-primary font-mono outline-none placeholder:text-ink-tertiary"
          />
          <div className="flex items-center gap-2 shrink-0">
            <UsdcIcon size={20} />
            <span className="text-body font-medium text-ink-secondary">USDC</span>
          </div>
        </div>
      </div>
      
      {/* Transfer Speed Selection */}
      <div className="p-5 border-b border-border-element">
        <TransferSpeedToggle
          value={transferSpeed}
          onChange={setTransferSpeed}
          fastFeeBps={cctpFees?.fastFee ?? 1}
          amount={amount}
        />
      </div>
      
      {/* Fee Breakdown */}
      <div className="p-5 border-b border-border-element space-y-3">
        {/* CCTP Fee (Fast Transfer only) */}
        {transferSpeed === 'fast' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-label uppercase tracking-wider text-ink-tertiary">CCTP FEE</span>
              <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-signal-success border border-signal-success bg-signal-success/10">
                FAST
              </span>
            </div>
            <span className="text-body font-mono text-ink-primary">
              {estimate?.cctpFee ? `${estimate.cctpFee} USDC` : `~${calculateCCTPFee(amount || '0', cctpFees?.fastFee ?? 1)} USDC`}
            </span>
          </div>
        )}
        
        {/* Standard = Free */}
        {transferSpeed === 'standard' && (
          <div className="flex items-center justify-between">
            <span className="text-label uppercase tracking-wider text-ink-tertiary">CCTP FEE</span>
            <span className="text-body font-mono text-signal-success">Free</span>
          </div>
        )}
        
        {/* Gas Fees */}
        {estimate && (
          <>
            {estimate.gasFees.source && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-label uppercase tracking-wider text-ink-tertiary">
                    GAS · {sourceMeta?.shortName || 'SRC'}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-tertiary border border-border-element bg-surface-subtle">
                    BURN
                  </span>
                  {estimate.gasFees.source.gwei && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono text-ink-tertiary border border-border-element bg-surface-subtle">
                      {estimate.gasFees.source.gwei}
                    </span>
                  )}
                </div>
                <span className="text-body font-mono text-ink-primary">{estimate.gasFees.source.amount}</span>
              </div>
            )}
            
            {estimate.gasFees.destination && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-label uppercase tracking-wider text-ink-tertiary">
                    GAS · {destMeta?.shortName || 'DST'}
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-tertiary border border-border-element bg-surface-subtle">
                    MINT
                  </span>
                  {estimate.gasFees.destination.gwei && (
                    <span className="px-1.5 py-0.5 text-[10px] font-mono text-ink-tertiary border border-border-element bg-surface-subtle">
                      {estimate.gasFees.destination.gwei}
                    </span>
                  )}
                </div>
                <span className="text-body font-mono text-ink-primary">{estimate.gasFees.destination.amount}</span>
              </div>
            )}
            
            {/* Divider */}
            <div className="border-t border-dashed border-border-element" />
            
            {/* Total Cost */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-label uppercase tracking-wider text-ink-tertiary">EST. TOTAL COST</span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-signal-success border border-signal-success bg-signal-success/10">
                  LIVE
                </span>
              </div>
              <span className="text-body font-mono text-ink-primary font-medium">{estimate.totalGasUsd}</span>
            </div>
            
            {/* Finality */}
            <div className="flex items-center justify-between">
              <span className="text-label uppercase tracking-wider text-ink-tertiary">FINALITY</span>
              <div className="flex items-center gap-2">
                {transferSpeed === 'fast' && <Zap size={12} className="text-signal-success" />}
                <span className={`text-body font-mono ${transferSpeed === 'fast' ? 'text-signal-success' : 'text-ink-secondary'}`}>
                  {estimate.finality}
                </span>
              </div>
            </div>
          </>
        )}
        
        {state === 'estimating' && (
          <div className="flex items-center gap-2 text-body text-ink-tertiary">
            <Loader2 size={14} className="animate-spin" />
            <span>Estimating fees...</span>
          </div>
        )}
        
        {/* You Receive */}
        <div className="flex items-center justify-between pt-2 border-t border-border-element">
          <span className="text-label uppercase tracking-wider text-ink-tertiary">YOU RECEIVE</span>
          <div className="flex items-center gap-2">
            <span className="text-h2 font-mono text-accent-main font-medium">
              {youReceive > 0 ? youReceive.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : '0.00'}
            </span>
            <UsdcIcon size={18} />
            <span className="text-h2 font-mono text-accent-main font-medium">USDC</span>
          </div>
        </div>
      </div>
      
      {/* Bridge Button */}
      <div className="p-5">
        <Button
          onClick={handleBridge}
          disabled={isConnected && !canBridge}
          isLoading={state === 'bridging' || state === 'confirming'}
          className="w-full"
          size="lg"
        >
          {!isConnected ? 'CONNECT WALLET TO BRIDGE' : 'BRIDGE'}
        </Button>
      </div>
    </div>
  )
}
