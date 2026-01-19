import { useState, useCallback } from 'react'
import { useWalletClient } from 'wagmi'
import { createAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import type { EIP1193Provider } from 'viem'
import type { BridgeChainIdentifier } from '@circle-fin/bridge-kit'
import {
  getBridgeKit,
  type TransferResult,
  type TransferStep,
} from '@/lib/bridge-kit'
import { chainIdToBridgeKitName } from '@/lib/chains'

export type TransferState = 'idle' | 'estimating' | 'confirming' | 'bridging' | 'success' | 'error'

export interface EstimateResult {
  gasFees: {
    source: string | null
    destination: string | null
  }
  providerFee: string | null
}

export interface UseBridgeReturn {
  state: TransferState
  steps: TransferStep[]
  currentStep: string | null
  estimate: EstimateResult | null
  error: string | null
  result: TransferResult | null
  estimateFees: (sourceChainId: number, destChainId: number, amount: string) => Promise<EstimateResult | null>
  executeBridge: (sourceChainId: number, destChainId: number, amount: string) => Promise<TransferResult | null>
  retry: () => Promise<TransferResult | null>
  reset: () => void
}

export function useBridge(): UseBridgeReturn {
  const { data: walletClient } = useWalletClient()
  
  const [state, setState] = useState<TransferState>('idle')
  const [steps, setSteps] = useState<TransferStep[]>([])
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<TransferResult | null>(null)
  const [lastParams, setLastParams] = useState<{
    sourceChainId: number
    destChainId: number
    amount: string
  } | null>(null)

  const createAdapter = useCallback(async () => {
    if (!walletClient) {
      throw new Error('Wallet not connected')
    }
    
    return createAdapterFromProvider({
      provider: walletClient.transport as unknown as EIP1193Provider,
    })
  }, [walletClient])

  const estimateFees = useCallback(async (
    sourceChainId: number,
    destChainId: number,
    amount: string
  ): Promise<EstimateResult | null> => {
    if (!walletClient || !amount || parseFloat(amount) <= 0) {
      return null
    }

    const sourceChain = chainIdToBridgeKitName[sourceChainId] as BridgeChainIdentifier | undefined
    const destChain = chainIdToBridgeKitName[destChainId] as BridgeChainIdentifier | undefined

    if (!sourceChain || !destChain) {
      setError('Unsupported chain')
      return null
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

      const estimateData: EstimateResult = {
        gasFees: {
          source: sourceGasFee?.fees ? String(sourceGasFee.fees) : null,
          destination: destGasFee?.fees ? String(destGasFee.fees) : null,
        },
        providerFee: result.fees.find(f => f.type === 'provider')?.amount ?? null,
      }

      setEstimate(estimateData)
      setState('idle')
      return estimateData
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to estimate fees'
      setError(message)
      setState('error')
      return null
    }
  }, [walletClient, createAdapter])

  const executeBridgeTransfer = useCallback(async (
    sourceChainId: number,
    destChainId: number,
    amount: string
  ): Promise<TransferResult | null> => {
    if (!walletClient) {
      setError('Wallet not connected')
      return null
    }

    const sourceChain = chainIdToBridgeKitName[sourceChainId] as BridgeChainIdentifier | undefined
    const destChain = chainIdToBridgeKitName[destChainId] as BridgeChainIdentifier | undefined

    if (!sourceChain || !destChain) {
      setError('Unsupported chain')
      return null
    }

    setLastParams({ sourceChainId, destChainId, amount })
    setState('confirming')
    setError(null)
    setSteps([
      { name: 'approve', state: 'pending' },
      { name: 'burn', state: 'pending' },
      { name: 'fetchAttestation', state: 'pending' },
      { name: 'mint', state: 'pending' },
    ])

    try {
      const adapter = await createAdapter()
      const kit = getBridgeKit()

      // Set up event listeners
      const updateStep = (stepName: string, stepState: TransferStep['state'], txHash?: string) => {
        setCurrentStep(stepName)
        setSteps(prev => prev.map(s => 
          s.name === stepName ? { ...s, state: stepState, txHash } : s
        ))
      }

      kit.on('approve', (payload) => {
        updateStep('approve', 'success', payload.values?.txHash)
      })
      kit.on('burn', (payload) => {
        updateStep('burn', 'success', payload.values?.txHash)
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
      setResult(typedResult)
      
      if (typedResult.state === 'success') {
        setState('success')
      } else {
        setState('error')
        setError('Transfer failed')
      }

      return typedResult
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Bridge transfer failed'
      setError(message)
      setState('error')
      return null
    }
  }, [walletClient, createAdapter])

  const retry = useCallback(async (): Promise<TransferResult | null> => {
    if (!result || !lastParams) {
      return null
    }
    
    return executeBridgeTransfer(
      lastParams.sourceChainId,
      lastParams.destChainId,
      lastParams.amount
    )
  }, [result, lastParams, executeBridgeTransfer])

  const reset = useCallback(() => {
    setState('idle')
    setSteps([])
    setCurrentStep(null)
    setEstimate(null)
    setError(null)
    setResult(null)
  }, [])

  return {
    state,
    steps,
    currentStep,
    estimate,
    error,
    result,
    estimateFees,
    executeBridge: executeBridgeTransfer,
    retry,
    reset,
  }
}
