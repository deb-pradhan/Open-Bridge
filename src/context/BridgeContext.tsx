import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { useWalletClient, useAccount } from 'wagmi'
import { createAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import type { EIP1193Provider } from 'viem'
import type { BridgeChainIdentifier } from '@circle-fin/bridge-kit'
import { getBridgeKit, type TransferResult, getMintTxHash } from '@/lib/bridge-kit'
import { chainIdToBridgeKitName, getExplorerTxUrl, CCTP_DOMAINS } from '@/lib/chains'
import { 
  type TransferSpeed, 
  fetchCCTPFees, 
  calculateCCTPFee, 
  getEstimatedFinality,
  type CCTPFeeResult 
} from '@/lib/cctp-api'
import {
  type EnhancedTransferStep,
  type PersistedTransfer,
  type StepName,
  saveTransfer,
  updateTransfer,
  getTransfers,
  getPendingTransfers,
  createInitialSteps,
  canResumeTransfer,
} from '@/lib/storage'
import {
  trackTransaction,
  updateTransaction as updateAnalyticsTransaction,
  trackWalletConnection,
  trackPageView,
} from '@/lib/analytics'

export type TransferState = 'idle' | 'estimating' | 'confirming' | 'bridging' | 'success' | 'error'

export interface EstimateResult {
  gasFees: {
    source: { amount: string; gwei?: string } | null
    destination: { amount: string; gwei?: string } | null
  }
  providerFee: string | null
  totalGasUsd: string | null
  finality: string
  cctpFee: string | null
  cctpFeeBps: number
}

export interface Transaction {
  id: string
  timestamp: number
  sourceChainId: number
  destChainId: number
  amount: string
  status: 'pending' | 'success' | 'failed'
  txHash?: string
  txHashChainId?: number // Chain ID the txHash belongs to
  transferSpeed?: TransferSpeed
}

interface BridgeContextType {
  // Form state
  sourceChainId: number | null
  destChainId: number | null
  amount: string
  setSourceChainId: (id: number | null) => void
  setDestChainId: (id: number | null) => void
  setAmount: (amount: string) => void
  swapChains: () => void
  
  // Transfer speed
  transferSpeed: TransferSpeed
  setTransferSpeed: (speed: TransferSpeed) => void
  cctpFees: CCTPFeeResult | null
  
  // Bridge state
  state: TransferState
  steps: EnhancedTransferStep[]
  currentStep: string | null
  estimate: EstimateResult | null
  error: string | null
  transferStartedAt: number | null
  currentTransferId: string | null
  
  // Actions
  estimateFees: () => Promise<void>
  executeBridge: () => Promise<void>
  retry: () => Promise<void>
  reset: () => void
  resumeTransfer: (transfer: PersistedTransfer) => Promise<void>
  
  // Transaction history
  transactions: Transaction[]
  pendingTransfers: PersistedTransfer[]
  addTransaction: (tx: Transaction) => void
  refreshTransactions: () => void
}

const BridgeContext = createContext<BridgeContextType | null>(null)

export function BridgeProvider({ children }: { children: ReactNode }) {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  
  // Form state
  const [sourceChainId, setSourceChainId] = useState<number | null>(null)
  const [destChainId, setDestChainId] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  
  // Transfer speed (Fast vs Standard)
  const [transferSpeed, setTransferSpeed] = useState<TransferSpeed>('standard')
  const [cctpFees, setCctpFees] = useState<CCTPFeeResult | null>(null)
  
  // Bridge state
  const [state, setState] = useState<TransferState>('idle')
  const [steps, setSteps] = useState<EnhancedTransferStep[]>(createInitialSteps())
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [transferStartedAt, setTransferStartedAt] = useState<number | null>(null)
  const [currentTransferId, setCurrentTransferId] = useState<string | null>(null)
  
  // Transaction history (persisted)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pendingTransfers, setPendingTransfers] = useState<PersistedTransfer[]>([])

  // Track page view on mount
  useEffect(() => {
    trackPageView(window.location.pathname)
  }, [])

  // Load transactions from storage on mount and wallet change
  // Also track wallet connection for analytics
  useEffect(() => {
    if (address) {
      // Track wallet connection for analytics
      trackWalletConnection(address, sourceChainId ?? undefined)
      
      const stored = getTransfers(address)
      const mapped: Transaction[] = stored.map(t => {
        // Prefer mintTxHash for completed transfers, burnTxHash for pending
        const useMintHash = t.mintTxHash && t.status === 'success'
        return {
          id: t.id,
          timestamp: t.startedAt,
          sourceChainId: t.sourceChainId,
          destChainId: t.destChainId,
          amount: t.amount,
          status: t.status,
          txHash: useMintHash ? t.mintTxHash : t.burnTxHash,
          txHashChainId: useMintHash ? t.destChainId : t.sourceChainId,
          transferSpeed: t.transferSpeed,
        }
      })
      setTransactions(mapped.slice(0, 10))
      setPendingTransfers(getPendingTransfers(address).filter(canResumeTransfer))
    } else {
      setTransactions([])
      setPendingTransfers([])
    }
  }, [address, sourceChainId])

  // Fetch CCTP fees when chains change
  useEffect(() => {
    if (sourceChainId && destChainId) {
      const sourceDomain = CCTP_DOMAINS[sourceChainId]
      const destDomain = CCTP_DOMAINS[destChainId]
      
      if (sourceDomain !== undefined && destDomain !== undefined) {
        fetchCCTPFees(sourceDomain, destDomain).then(setCctpFees).catch(console.error)
      }
    }
  }, [sourceChainId, destChainId])

  const refreshTransactions = useCallback(() => {
    if (address) {
      const stored = getTransfers(address)
      const mapped: Transaction[] = stored.map(t => {
        // Prefer mintTxHash for completed transfers, burnTxHash for pending
        const useMintHash = t.mintTxHash && t.status === 'success'
        return {
          id: t.id,
          timestamp: t.startedAt,
          sourceChainId: t.sourceChainId,
          destChainId: t.destChainId,
          amount: t.amount,
          status: t.status,
          txHash: useMintHash ? t.mintTxHash : t.burnTxHash,
          txHashChainId: useMintHash ? t.destChainId : t.sourceChainId,
          transferSpeed: t.transferSpeed,
        }
      })
      setTransactions(mapped.slice(0, 10))
      setPendingTransfers(getPendingTransfers(address).filter(canResumeTransfer))
    }
  }, [address])
  
  const swapChains = useCallback(() => {
    const temp = sourceChainId
    setSourceChainId(destChainId)
    setDestChainId(temp)
  }, [sourceChainId, destChainId])
  
  const createAdapter = useCallback(async () => {
    if (!walletClient) throw new Error('Wallet not connected')
    return createAdapterFromProvider({
      provider: walletClient.transport as unknown as EIP1193Provider,
    })
  }, [walletClient])

  const estimateFees = useCallback(async () => {
    if (!walletClient || !sourceChainId || !destChainId || !amount || parseFloat(amount) <= 0) {
      return
    }

    const sourceChain = chainIdToBridgeKitName[sourceChainId] as BridgeChainIdentifier | undefined
    const destChain = chainIdToBridgeKitName[destChainId] as BridgeChainIdentifier | undefined

    if (!sourceChain || !destChain) {
      setError('Unsupported chain')
      return
    }

    setState('estimating')
    setError(null)

    try {
      const adapter = await createAdapter()
      const kit = getBridgeKit()
      
      const result = await kit.estimate({
        from: { adapter, chain: sourceChain },
        to: { adapter, chain: destChain },
        amount,
      })

      const sourceGasFee = result.gasFees.find(f => f.name === 'source')
      const destGasFee = result.gasFees.find(f => f.name === 'destination')
      
      // Calculate totals
      const sourceGas = sourceGasFee?.fees ? parseFloat(String(sourceGasFee.fees)) : 0
      const destGas = destGasFee?.fees ? parseFloat(String(destGasFee.fees)) : 0
      const totalGas = sourceGas + destGas

      // Calculate CCTP fee based on transfer speed
      const feeBps = transferSpeed === 'fast' ? (cctpFees?.fastFee ?? 1) : 0
      const cctpFee = calculateCCTPFee(amount, feeBps)
      const finality = getEstimatedFinality(transferSpeed)

      // Extract gas price safely (might not be available on all response types)
      const sourceGasPrice = (sourceGasFee as any)?.gasPrice
      const destGasPrice = (destGasFee as any)?.gasPrice

      setEstimate({
        gasFees: {
          source: sourceGasFee ? { 
            amount: `~$${sourceGas.toFixed(4)}`,
            gwei: sourceGasPrice ? `${(Number(sourceGasPrice) / 1e9).toFixed(2)} gwei` : undefined
          } : null,
          destination: destGasFee ? { 
            amount: `~$${destGas.toFixed(4)}`,
            gwei: destGasPrice ? `${(Number(destGasPrice) / 1e9).toFixed(2)} gwei` : undefined
          } : null,
        },
        providerFee: result.fees.find(f => f.type === 'provider')?.amount ?? '0',
        totalGasUsd: `~$${totalGas.toFixed(4)}`,
        finality: finality.label,
        cctpFee: transferSpeed === 'fast' ? cctpFee : null,
        cctpFeeBps: feeBps,
      })
      setState('idle')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to estimate fees'
      setError(message)
      setState('error')
    }
  }, [walletClient, sourceChainId, destChainId, amount, createAdapter, transferSpeed, cctpFees])

  const executeBridge = useCallback(async () => {
    if (!walletClient || !sourceChainId || !destChainId || !amount || !address) {
      return
    }

    const sourceChain = chainIdToBridgeKitName[sourceChainId] as BridgeChainIdentifier | undefined
    const destChain = chainIdToBridgeKitName[destChainId] as BridgeChainIdentifier | undefined

    if (!sourceChain || !destChain) {
      setError('Unsupported chain')
      return
    }

    const transferId = Date.now().toString()
    const startTime = Date.now()
    
    setState('confirming')
    setError(null)
    setTransferStartedAt(startTime)
    setCurrentTransferId(transferId)
    
    const initialSteps: EnhancedTransferStep[] = createInitialSteps()
    setSteps(initialSteps)

    // Create persisted transfer
    const persistedTransfer: PersistedTransfer = {
      id: transferId,
      version: 1,
      startedAt: startTime,
      sourceChainId,
      destChainId,
      amount,
      walletAddress: address,
      transferSpeed,
      currentStep: 'approve',
      steps: initialSteps,
      status: 'pending',
    }
    saveTransfer(persistedTransfer)

    // Track transaction for analytics (non-blocking)
    const analyticsId = await trackTransaction({
      sourceChainId,
      destChainId,
      amount,
      amountUsd: parseFloat(amount), // USDC is 1:1 with USD
      status: 'pending',
      transferSpeed,
      walletAddress: address,
      startedAt: startTime,
    })

    try {
      const adapter = await createAdapter()
      const kit = getBridgeKit()

      const updateStep = (
        stepName: StepName, 
        stepState: EnhancedTransferStep['state'], 
        txHash?: string
      ) => {
        const now = Date.now()
        setCurrentStep(stepName)
        setSteps(prev => prev.map(s => {
          if (s.name === stepName) {
            const updates: Partial<EnhancedTransferStep> = { 
              state: stepState,
              txHash,
              explorerUrl: txHash ? getExplorerTxUrl(
                stepName === 'mint' ? destChainId : sourceChainId, 
                txHash
              ) : undefined,
            }
            if (stepState === 'in_progress' && !s.startedAt) {
              updates.startedAt = now
            }
            if (stepState === 'success') {
              updates.completedAt = now
            }
            return { ...s, ...updates }
          }
          return s
        }))
        
        // Update persisted transfer
        updateTransfer(transferId, { 
          currentStep: stepName,
          burnTxHash: stepName === 'burn' && txHash ? txHash : undefined,
        })
      }

      kit.on('approve', (payload) => {
        updateStep('approve', 'success', payload.values?.txHash)
        updateStep('burn', 'in_progress')
      })
      kit.on('burn', (payload) => {
        updateStep('burn', 'success', payload.values?.txHash)
        updateTransfer(transferId, { burnTxHash: payload.values?.txHash })
        updateStep('fetchAttestation', 'in_progress')
      })
      kit.on('fetchAttestation', () => {
        updateStep('fetchAttestation', 'success')
        updateStep('mint', 'in_progress')
      })
      kit.on('mint', (payload) => {
        updateStep('mint', 'success', payload.values?.txHash)
      })

      setState('bridging')
      updateStep('approve', 'in_progress')

      const bridgeResult = await kit.bridge({
        from: { adapter, chain: sourceChain },
        to: { adapter, chain: destChain },
        amount,
      })

      const typedResult = bridgeResult as unknown as TransferResult
      const mintTxHash = getMintTxHash(typedResult)
      const completedAt = Date.now()
      const durationMs = completedAt - startTime
      
      // Update persisted transfer
      updateTransfer(transferId, {
        status: typedResult.state === 'success' ? 'success' : 'failed',
        completedAt,
        mintTxHash,
      })

      // Update analytics (non-blocking)
      if (analyticsId) {
        updateAnalyticsTransaction(analyticsId, {
          status: typedResult.state === 'success' ? 'success' : 'failed',
          mintTxHash,
          completedAt,
          durationMs,
        })
      }
      
      refreshTransactions()
      
      if (typedResult.state === 'success') {
        setState('success')
      } else {
        setState('error')
        setError('Transfer failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bridge transfer failed'
      setError(message)
      setState('error')
      updateTransfer(transferId, { status: 'failed' })
      
      // Update analytics on failure (non-blocking)
      if (analyticsId) {
        updateAnalyticsTransaction(analyticsId, {
          status: 'failed',
          completedAt: Date.now(),
          durationMs: Date.now() - startTime,
        })
      }
      
      refreshTransactions()
    }
  }, [walletClient, sourceChainId, destChainId, amount, address, createAdapter, transferSpeed, refreshTransactions])

  const resumeTransfer = useCallback(async (transfer: PersistedTransfer) => {
    if (!walletClient || !address) {
      setError('Wallet not connected')
      return
    }

    // Verify this is the same wallet that initiated the transfer
    if (transfer.walletAddress.toLowerCase() !== address.toLowerCase()) {
      setError('Connected wallet does not match transfer wallet')
      return
    }

    const sourceChain = chainIdToBridgeKitName[transfer.sourceChainId] as BridgeChainIdentifier | undefined
    const destChain = chainIdToBridgeKitName[transfer.destChainId] as BridgeChainIdentifier | undefined

    if (!sourceChain || !destChain) {
      setError('Unsupported chain')
      return
    }

    if (!transfer.burnTxHash) {
      setError('Cannot resume: missing burn transaction')
      return
    }

    setState('bridging')
    setError(null)
    setTransferStartedAt(transfer.startedAt)
    setCurrentTransferId(transfer.id)
    setSourceChainId(transfer.sourceChainId)
    setDestChainId(transfer.destChainId)
    setAmount(transfer.amount)
    setTransferSpeed(transfer.transferSpeed)

    // Restore step states
    const restoredSteps: EnhancedTransferStep[] = transfer.steps.map(s => ({
      ...s,
      state: s.state === 'in_progress' ? 'pending' : s.state, // Reset in_progress to pending
    }))
    
    // Mark appropriate step as in_progress
    const attestationStep = restoredSteps.find(s => s.name === 'fetchAttestation')
    const mintStep = restoredSteps.find(s => s.name === 'mint')
    
    if (attestationStep?.state !== 'success') {
      restoredSteps.forEach(s => {
        if (s.name === 'fetchAttestation') s.state = 'in_progress'
      })
      setCurrentStep('fetchAttestation')
    } else if (mintStep?.state !== 'success') {
      restoredSteps.forEach(s => {
        if (s.name === 'mint') s.state = 'in_progress'
      })
      setCurrentStep('mint')
    }
    
    setSteps(restoredSteps)

    try {
      const adapter = await createAdapter()
      const kit = getBridgeKit()

      // Set up event listeners
      kit.on('fetchAttestation', () => {
        setSteps(prev => prev.map(s => 
          s.name === 'fetchAttestation' 
            ? { ...s, state: 'success', completedAt: Date.now() }
            : s.name === 'mint'
            ? { ...s, state: 'in_progress', startedAt: Date.now() }
            : s
        ))
        setCurrentStep('mint')
      })
      
      kit.on('mint', (payload) => {
        setSteps(prev => prev.map(s => 
          s.name === 'mint' 
            ? { 
                ...s, 
                state: 'success', 
                completedAt: Date.now(),
                txHash: payload.values?.txHash,
                explorerUrl: payload.values?.txHash 
                  ? getExplorerTxUrl(transfer.destChainId, payload.values.txHash) 
                  : undefined,
              }
            : s
        ))
      })

      // Use retry to resume from where we left off
      const result = await kit.retry(
        {
          state: 'pending',
          steps: transfer.steps.map(s => ({
            name: s.name,
            state: s.state,
            values: s.txHash ? { txHash: s.txHash } : undefined,
          })),
          source: { chain: { name: sourceChain } as any },
          destination: { chain: { name: destChain } as any },
        } as any,
        {
          from: adapter,
          to: adapter,
        }
      )

      const typedResult = result as unknown as TransferResult
      const resumeMintTxHash = getMintTxHash(typedResult)
      
      // Update persisted transfer
      updateTransfer(transfer.id, {
        status: typedResult.state === 'success' ? 'success' : 'failed',
        completedAt: Date.now(),
        mintTxHash: resumeMintTxHash,
      })
      
      refreshTransactions()
      
      if (typedResult.state === 'success') {
        setState('success')
      } else {
        setState('error')
        setError('Transfer failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resume transfer'
      setError(message)
      setState('error')
      console.error('Resume transfer error:', err)
    }
  }, [walletClient, address, createAdapter, refreshTransactions, setSourceChainId, setDestChainId, setAmount, setTransferSpeed])

  const retry = useCallback(async () => {
    await executeBridge()
  }, [executeBridge])

  const reset = useCallback(() => {
    setState('idle')
    setSteps(createInitialSteps())
    setCurrentStep(null)
    setError(null)
    setTransferStartedAt(null)
    setCurrentTransferId(null)
  }, [])

  const addTransaction = useCallback((tx: Transaction) => {
    setTransactions(prev => [tx, ...prev].slice(0, 10))
  }, [])

  return (
    <BridgeContext.Provider value={{
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
      steps,
      currentStep,
      estimate,
      error,
      transferStartedAt,
      currentTransferId,
      estimateFees,
      executeBridge,
      retry,
      reset,
      resumeTransfer,
      transactions,
      pendingTransfers,
      addTransaction,
      refreshTransactions,
    }}>
      {children}
    </BridgeContext.Provider>
  )
}

export function useBridgeContext() {
  const context = useContext(BridgeContext)
  if (!context) {
    throw new Error('useBridgeContext must be used within BridgeProvider')
  }
  return context
}

// Re-export types for convenience
export type { EnhancedTransferStep, PersistedTransfer, StepName } from '@/lib/storage'
export { getElapsedTime } from '@/lib/storage'
