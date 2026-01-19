import { BridgeKit, type BridgeChainIdentifier } from '@circle-fin/bridge-kit'
import { createAdapterFromProvider } from '@circle-fin/adapter-viem-v2'
import type { WalletClient } from 'viem'
import type { EIP1193Provider } from 'viem'

// Singleton BridgeKit instance
let bridgeKitInstance: BridgeKit | null = null

export function getBridgeKit(): BridgeKit {
  if (!bridgeKitInstance) {
    bridgeKitInstance = new BridgeKit()
  }
  return bridgeKitInstance
}

// Create adapter from wagmi wallet client
export async function createAdapter(walletClient: WalletClient) {
  return createAdapterFromProvider({
    provider: walletClient.transport as unknown as EIP1193Provider,
  })
}

// Create adapter directly from window.ethereum or similar provider
export async function createAdapterFromWindowProvider() {
  if (typeof window === 'undefined') {
    throw new Error('No wallet provider found')
  }
  
  const ethereum = (window as unknown as { ethereum?: EIP1193Provider }).ethereum
  if (!ethereum) {
    throw new Error('No wallet provider found')
  }
  
  return createAdapterFromProvider({
    provider: ethereum,
  })
}

// Types for Bridge Kit operations
export interface BridgeTransferParams {
  sourceChain: BridgeChainIdentifier
  destChain: BridgeChainIdentifier
  amount: string
  adapter: Awaited<ReturnType<typeof createAdapterFromProvider>>
}

export interface TransferStep {
  name: 'approve' | 'burn' | 'fetchAttestation' | 'mint'
  state: 'pending' | 'in_progress' | 'success' | 'error'
  txHash?: string
  error?: string
}

export interface TransferResult {
  state: 'pending' | 'success' | 'error'
  steps: TransferStep[]
  source?: {
    address: string
    chain: string
  }
  destination?: {
    address: string
    chain: string
  }
}

// Helper to extract the mint tx hash from a transfer result
export function getMintTxHash(result: TransferResult): string | undefined {
  const mintStep = result.steps?.find(s => s.name === 'mint')
  return mintStep?.txHash
}

// Helper to extract the burn tx hash from a transfer result
export function getBurnTxHash(result: TransferResult): string | undefined {
  const burnStep = result.steps?.find(s => s.name === 'burn')
  return burnStep?.txHash
}

// Estimate fees for a bridge transfer
export async function estimateBridgeFees(params: BridgeTransferParams) {
  const kit = getBridgeKit()
  
  return kit.estimate({
    from: { adapter: params.adapter, chain: params.sourceChain },
    to: { adapter: params.adapter, chain: params.destChain },
    amount: params.amount,
  })
}

// Execute a bridge transfer
export async function executeBridge(
  params: BridgeTransferParams,
  onProgress?: (step: string, status: string) => void
): Promise<TransferResult> {
  const kit = getBridgeKit()
  
  // Set up event listeners for progress tracking
  if (onProgress) {
    kit.on('approve', (payload) => {
      onProgress('approve', payload.values?.txHash ? 'success' : 'in_progress')
    })
    kit.on('burn', (payload) => {
      onProgress('burn', payload.values?.txHash ? 'success' : 'in_progress')
    })
    kit.on('fetchAttestation', () => {
      onProgress('fetchAttestation', 'in_progress')
    })
    kit.on('mint', (payload) => {
      onProgress('mint', payload.values?.txHash ? 'success' : 'in_progress')
    })
  }

  const result = await kit.bridge({
    from: { adapter: params.adapter, chain: params.sourceChain },
    to: { adapter: params.adapter, chain: params.destChain },
    amount: params.amount,
  })

  return result as unknown as TransferResult
}

// Retry a failed transfer
export async function retryBridge(
  failedResult: TransferResult,
  adapter: Awaited<ReturnType<typeof createAdapterFromProvider>>
) {
  const kit = getBridgeKit()
  
  return kit.retry(failedResult as unknown as Parameters<typeof kit.retry>[0], {
    from: adapter,
    to: adapter,
  })
}

// Window ethereum is declared by wagmi/viem
