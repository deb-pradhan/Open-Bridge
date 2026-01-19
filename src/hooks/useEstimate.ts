import { useState, useEffect, useCallback, useRef } from 'react'
import { useWalletClient } from 'wagmi'
import { createAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import type { EIP1193Provider } from 'viem'
import type { BridgeChainIdentifier } from '@circle-fin/bridge-kit'
import { getBridgeKit } from '@/lib/bridge-kit'
import { chainIdToBridgeKitName } from '@/lib/chains'

export interface EstimateData {
  gasFees: {
    source: string | null
    destination: string | null
  }
  providerFee: string | null
  totalFeeUsd: string | null
}

interface UseEstimateReturn {
  estimate: EstimateData | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEstimate(
  sourceChainId: number | null,
  destChainId: number | null,
  amount: string
): UseEstimateReturn {
  const { data: walletClient } = useWalletClient()
  const [estimate, setEstimate] = useState<EstimateData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Debounce timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchEstimate = useCallback(async () => {
    // Clear any pending request
    if (abortRef.current) {
      abortRef.current.abort()
    }
    
    if (!walletClient || !sourceChainId || !destChainId || !amount || parseFloat(amount) <= 0) {
      setEstimate(null)
      return
    }

    const sourceChain = chainIdToBridgeKitName[sourceChainId] as BridgeChainIdentifier | undefined
    const destChain = chainIdToBridgeKitName[destChainId] as BridgeChainIdentifier | undefined

    if (!sourceChain || !destChain) {
      setError('Unsupported chain combination')
      return
    }

    abortRef.current = new AbortController()
    setIsLoading(true)
    setError(null)

    try {
      const adapter = await createAdapterFromProvider({
        provider: walletClient.transport as unknown as EIP1193Provider,
      })

      const kit = getBridgeKit()
      const result = await kit.estimate({
        from: { adapter, chain: sourceChain },
        to: { adapter, chain: destChain },
        amount,
      })

      // Check if request was aborted
      if (abortRef.current?.signal.aborted) {
        return
      }

      const sourceGasFee = result.gasFees.find(f => f.name === 'source')
      const destGasFee = result.gasFees.find(f => f.name === 'destination')
      const providerFee = result.fees.find(f => f.type === 'provider')?.amount

      setEstimate({
        gasFees: {
          source: sourceGasFee?.fees ? String(sourceGasFee.fees) : null,
          destination: destGasFee?.fees ? String(destGasFee.fees) : null,
        },
        providerFee: providerFee ?? null,
        totalFeeUsd: null, // Could be calculated with price feeds
      })
    } catch (err) {
      if (abortRef.current?.signal.aborted) {
        return
      }
      
      const message = err instanceof Error ? err.message : 'Failed to estimate'
      
      // Handle specific error cases
      if (message.includes('insufficient')) {
        setError('Insufficient balance for this transfer')
      } else if (message.includes('network')) {
        setError('Network error - please try again')
      } else {
        setError(message)
      }
    } finally {
      if (!abortRef.current?.signal.aborted) {
        setIsLoading(false)
      }
    }
  }, [walletClient, sourceChainId, destChainId, amount])

  // Debounced fetch on param change
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      fetchEstimate()
    }, 500)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [fetchEstimate])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort()
      }
    }
  }, [])

  return {
    estimate,
    isLoading,
    error,
    refetch: fetchEstimate,
  }
}
