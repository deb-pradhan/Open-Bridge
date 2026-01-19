import { BridgeKit } from '@circle-fin/bridge-kit'

// Singleton BridgeKit instance
let bridgeKitInstance: BridgeKit | null = null

export function getBridgeKit(): BridgeKit {
  if (!bridgeKitInstance) {
    bridgeKitInstance = new BridgeKit()
  }
  return bridgeKitInstance
}

// Types for Bridge Kit operations
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
