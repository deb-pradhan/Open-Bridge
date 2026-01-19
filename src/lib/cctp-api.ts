/**
 * Circle CCTP (Cross-Chain Transfer Protocol) API Client
 * Interfaces with Circle's Iris API for fee and allowance data
 * 
 * Docs: https://developers.circle.com/cctp/concepts/fees
 */

import { CCTP_DOMAINS } from './chains'

// Circle Iris API base URLs
const IRIS_API_MAINNET = 'https://iris-api.circle.com'
const IRIS_API_TESTNET = 'https://iris-api-sandbox.circle.com'

export type TransferSpeed = 'fast' | 'standard'

export interface CCTPFee {
  finalityThreshold: number // 1000 = fast, 2000 = standard
  minimumFee: number // in basis points (1 = 0.01%)
}

export interface CCTPFeeResult {
  fastFee: number // in basis points
  standardFee: number // always 0
  fastFeeUsdc: string // human readable
  standardFeeUsdc: string // always "0"
}

export interface FastTransferAllowance {
  allowance: string // remaining allowance in USDC
  isAvailable: boolean
}

/**
 * Get CCTP domain ID for a chain
 */
export function getCCTPDomain(chainId: number): number | null {
  return CCTP_DOMAINS[chainId] ?? null
}

/**
 * Fetch transfer fees from Circle Iris API
 * @param sourceDomain - CCTP domain ID of source chain
 * @param destDomain - CCTP domain ID of destination chain
 * @param isTestnet - Whether to use testnet API
 */
export async function fetchCCTPFees(
  sourceDomain: number,
  destDomain: number,
  isTestnet = false
): Promise<CCTPFeeResult> {
  const baseUrl = isTestnet ? IRIS_API_TESTNET : IRIS_API_MAINNET
  
  try {
    const response = await fetch(
      `${baseUrl}/v2/burn/USDC/fees/${sourceDomain}/${destDomain}`,
      {
        headers: { 'Accept': 'application/json' },
      }
    )
    
    if (!response.ok) {
      throw new Error(`Failed to fetch fees: ${response.status}`)
    }
    
    const data: CCTPFee[] = await response.json()
    
    // Find fast (threshold 1000) and standard (threshold 2000) fees
    const fastFeeData = data.find(f => f.finalityThreshold === 1000)
    const standardFeeData = data.find(f => f.finalityThreshold === 2000)
    
    const fastFeeBps = fastFeeData?.minimumFee ?? 1 // default 1 bps = 0.01%
    const standardFeeBps = standardFeeData?.minimumFee ?? 0
    
    return {
      fastFee: fastFeeBps,
      standardFee: standardFeeBps,
      fastFeeUsdc: bpsToUsdc(fastFeeBps, 1000), // example for $1000 transfer
      standardFeeUsdc: '0',
    }
  } catch (error) {
    console.error('Failed to fetch CCTP fees:', error)
    // Return default fees on error
    return {
      fastFee: 1, // 0.01%
      standardFee: 0,
      fastFeeUsdc: '0.10',
      standardFeeUsdc: '0',
    }
  }
}

/**
 * Fetch Fast Transfer allowance from Circle Iris API
 */
export async function fetchFastTransferAllowance(
  isTestnet = false
): Promise<FastTransferAllowance> {
  const baseUrl = isTestnet ? IRIS_API_TESTNET : IRIS_API_MAINNET
  
  try {
    const response = await fetch(
      `${baseUrl}/v2/fastBurn/USDC/allowance`,
      {
        headers: { 'Accept': 'application/json' },
      }
    )
    
    if (!response.ok) {
      throw new Error(`Failed to fetch allowance: ${response.status}`)
    }
    
    const data = await response.json()
    const allowance = data.allowance ?? '0'
    
    return {
      allowance,
      isAvailable: parseFloat(allowance) > 0,
    }
  } catch (error) {
    console.error('Failed to fetch Fast Transfer allowance:', error)
    return {
      allowance: '0',
      isAvailable: false,
    }
  }
}

/**
 * Calculate CCTP fee in USDC for a given amount
 * @param amount - Transfer amount in USDC
 * @param feeBps - Fee in basis points
 */
export function calculateCCTPFee(amount: string, feeBps: number): string {
  const amountNum = parseFloat(amount)
  if (isNaN(amountNum) || amountNum <= 0) return '0'
  
  // 1 basis point = 0.01% = 0.0001
  const fee = amountNum * (feeBps / 10000)
  
  // Minimum fee is typically 0.01 USDC for fast transfers
  const minFee = feeBps > 0 ? 0.01 : 0
  
  return Math.max(fee, minFee).toFixed(6)
}

/**
 * Convert basis points to USDC for display
 */
function bpsToUsdc(bps: number, amount: number): string {
  const fee = amount * (bps / 10000)
  return fee.toFixed(2)
}

/**
 * Get estimated finality time based on transfer speed
 */
export function getEstimatedFinality(speed: TransferSpeed): {
  label: string
  seconds: number
  description: string
} {
  if (speed === 'fast') {
    return {
      label: '~15 seconds',
      seconds: 15,
      description: 'Fast Transfer uses soft finality for quick confirmation',
    }
  }
  return {
    label: '~13-19 minutes',
    seconds: 13 * 60, // 13 minutes average
    description: 'Standard Transfer waits for hard finality on source chain',
  }
}

/**
 * Get minFinalityThreshold value for BridgeKit based on transfer speed
 */
export function getMinFinalityThreshold(speed: TransferSpeed): number {
  return speed === 'fast' ? 1000 : 2000
}

/**
 * Check if Fast Transfer is available for the given amount
 */
export async function checkFastTransferAvailability(
  amount: string,
  isTestnet = false
): Promise<{ available: boolean; reason?: string }> {
  const allowance = await fetchFastTransferAllowance(isTestnet)
  const amountNum = parseFloat(amount)
  const allowanceNum = parseFloat(allowance.allowance)
  
  if (!allowance.isAvailable) {
    return {
      available: false,
      reason: 'Fast Transfer allowance is depleted. Use Standard Transfer.',
    }
  }
  
  if (amountNum > allowanceNum) {
    return {
      available: false,
      reason: `Amount exceeds Fast Transfer allowance (${allowance.allowance} USDC available)`,
    }
  }
  
  return { available: true }
}
