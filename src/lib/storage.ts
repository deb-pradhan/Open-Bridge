/**
 * LocalStorage persistence layer for bridge transactions
 * Enables recovery of interrupted transfers across page refreshes
 */

const STORAGE_VERSION = 1
const STORAGE_KEY = 'openbridge_transfers'

export type StepName = 'approve' | 'burn' | 'fetchAttestation' | 'mint'

export interface EnhancedTransferStep {
  name: StepName
  state: 'pending' | 'in_progress' | 'success' | 'error'
  txHash?: string
  startedAt?: number
  completedAt?: number
  blockNumber?: number
  explorerUrl?: string
  error?: string
}

export interface PersistedTransfer {
  id: string
  version: number
  startedAt: number
  completedAt?: number
  sourceChainId: number
  destChainId: number
  amount: string
  walletAddress: string
  transferSpeed: 'fast' | 'standard'
  currentStep: StepName
  steps: EnhancedTransferStep[]
  burnTxHash?: string
  mintTxHash?: string
  attestation?: string
  status: 'pending' | 'success' | 'failed'
}

export interface StorageData {
  version: number
  transfers: PersistedTransfer[]
}

/**
 * Initialize storage with default structure
 */
function initStorage(): StorageData {
  return {
    version: STORAGE_VERSION,
    transfers: [],
  }
}

/**
 * Get all stored data
 */
function getStorageData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initStorage()
    
    const data = JSON.parse(raw) as StorageData
    
    // Handle version migrations if needed
    if (data.version !== STORAGE_VERSION) {
      console.log('Storage version mismatch, resetting...')
      return initStorage()
    }
    
    return data
  } catch (error) {
    console.error('Failed to read storage:', error)
    return initStorage()
  }
}

/**
 * Save storage data
 */
function saveStorageData(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save storage:', error)
  }
}

/**
 * Get all transfers for a wallet address
 */
export function getTransfers(walletAddress?: string): PersistedTransfer[] {
  const data = getStorageData()
  if (!walletAddress) return data.transfers
  return data.transfers.filter(t => t.walletAddress.toLowerCase() === walletAddress.toLowerCase())
}

/**
 * Get pending (incomplete) transfers for a wallet
 */
export function getPendingTransfers(walletAddress: string): PersistedTransfer[] {
  return getTransfers(walletAddress).filter(t => t.status === 'pending')
}

/**
 * Get completed transfers for a wallet
 */
export function getCompletedTransfers(walletAddress: string): PersistedTransfer[] {
  return getTransfers(walletAddress)
    .filter(t => t.status !== 'pending')
    .slice(0, 10) // Keep last 10
}

/**
 * Save or update a transfer
 */
export function saveTransfer(transfer: PersistedTransfer): void {
  const data = getStorageData()
  const existingIndex = data.transfers.findIndex(t => t.id === transfer.id)
  
  if (existingIndex >= 0) {
    data.transfers[existingIndex] = { ...transfer, version: STORAGE_VERSION }
  } else {
    data.transfers.unshift({ ...transfer, version: STORAGE_VERSION })
  }
  
  // Keep only last 50 transfers total
  data.transfers = data.transfers.slice(0, 50)
  
  saveStorageData(data)
}

/**
 * Update a specific transfer
 */
export function updateTransfer(
  id: string,
  updates: Partial<PersistedTransfer>
): PersistedTransfer | null {
  const data = getStorageData()
  const transfer = data.transfers.find(t => t.id === id)
  
  if (!transfer) return null
  
  const updated = { ...transfer, ...updates }
  saveTransfer(updated)
  
  return updated
}

/**
 * Update a step in a transfer
 */
export function updateTransferStep(
  transferId: string,
  stepName: StepName,
  stepUpdates: Partial<EnhancedTransferStep>
): void {
  const data = getStorageData()
  const transfer = data.transfers.find(t => t.id === transferId)
  
  if (!transfer) return
  
  transfer.steps = transfer.steps.map(step => 
    step.name === stepName ? { ...step, ...stepUpdates } : step
  )
  
  saveTransfer(transfer)
}

/**
 * Mark a transfer as complete
 */
export function completeTransfer(
  id: string,
  status: 'success' | 'failed',
  mintTxHash?: string
): void {
  updateTransfer(id, {
    status,
    completedAt: Date.now(),
    mintTxHash,
  })
}

/**
 * Delete a transfer
 */
export function deleteTransfer(id: string): void {
  const data = getStorageData()
  data.transfers = data.transfers.filter(t => t.id !== id)
  saveStorageData(data)
}

/**
 * Clear all transfers for a wallet
 */
export function clearTransfers(walletAddress: string): void {
  const data = getStorageData()
  data.transfers = data.transfers.filter(
    t => t.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
  )
  saveStorageData(data)
}

/**
 * Create initial step state
 */
export function createInitialSteps(): EnhancedTransferStep[] {
  return [
    { name: 'approve', state: 'pending' },
    { name: 'burn', state: 'pending' },
    { name: 'fetchAttestation', state: 'pending' },
    { name: 'mint', state: 'pending' },
  ]
}

/**
 * Check if a transfer can be resumed
 * A transfer can be resumed if:
 * - It's pending
 * - Burn step is complete (has txHash)
 * - Mint step is not complete
 */
export function canResumeTransfer(transfer: PersistedTransfer): boolean {
  if (transfer.status !== 'pending') return false
  
  const burnStep = transfer.steps.find(s => s.name === 'burn')
  const mintStep = transfer.steps.find(s => s.name === 'mint')
  
  // Can resume if burn is done but mint is not
  return (
    burnStep?.state === 'success' &&
    burnStep?.txHash !== undefined &&
    mintStep?.state !== 'success'
  )
}

/**
 * Get the resumption point for a transfer
 */
export function getResumptionPoint(transfer: PersistedTransfer): StepName | null {
  if (!canResumeTransfer(transfer)) return null
  
  const attestationStep = transfer.steps.find(s => s.name === 'fetchAttestation')
  
  // If attestation already fetched, resume from mint
  if (attestationStep?.state === 'success' && transfer.attestation) {
    return 'mint'
  }
  
  // Otherwise resume from attestation
  return 'fetchAttestation'
}

/**
 * Calculate elapsed time for a step or transfer
 */
export function getElapsedTime(startedAt: number, completedAt?: number): string {
  const endTime = completedAt ?? Date.now()
  const elapsed = Math.floor((endTime - startedAt) / 1000)
  
  if (elapsed < 60) {
    return `${elapsed}s`
  }
  
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60
  
  if (minutes < 60) {
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMins = minutes % 60
  return `${hours}h ${remainingMins}m`
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
