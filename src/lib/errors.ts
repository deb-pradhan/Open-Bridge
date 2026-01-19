// Error types and utilities for bridge operations

export enum BridgeErrorCode {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  UNSUPPORTED_CHAIN = 'UNSUPPORTED_CHAIN',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INSUFFICIENT_GAS = 'INSUFFICIENT_GAS',
  USER_REJECTED = 'USER_REJECTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  ATTESTATION_TIMEOUT = 'ATTESTATION_TIMEOUT',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  UNKNOWN = 'UNKNOWN',
}

export interface BridgeError {
  code: BridgeErrorCode
  message: string
  details?: string
  recoverable: boolean
}

export function parseBridgeError(error: unknown): BridgeError {
  const message = error instanceof Error ? error.message : String(error)
  const lowerMessage = message.toLowerCase()

  // User rejected transaction
  if (lowerMessage.includes('user rejected') || lowerMessage.includes('user denied')) {
    return {
      code: BridgeErrorCode.USER_REJECTED,
      message: 'Transaction was rejected',
      details: 'You declined the transaction in your wallet.',
      recoverable: true,
    }
  }

  // Insufficient balance
  if (lowerMessage.includes('insufficient') && lowerMessage.includes('balance')) {
    return {
      code: BridgeErrorCode.INSUFFICIENT_BALANCE,
      message: 'Insufficient USDC balance',
      details: 'You don\'t have enough USDC for this transfer.',
      recoverable: false,
    }
  }

  // Insufficient gas
  if (lowerMessage.includes('insufficient') && (lowerMessage.includes('gas') || lowerMessage.includes('funds'))) {
    return {
      code: BridgeErrorCode.INSUFFICIENT_GAS,
      message: 'Insufficient gas',
      details: 'You need more native tokens to pay for gas fees.',
      recoverable: false,
    }
  }

  // Network errors
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || lowerMessage.includes('timeout')) {
    return {
      code: BridgeErrorCode.NETWORK_ERROR,
      message: 'Network error',
      details: 'Please check your connection and try again.',
      recoverable: true,
    }
  }

  // Attestation timeout
  if (lowerMessage.includes('attestation')) {
    return {
      code: BridgeErrorCode.ATTESTATION_TIMEOUT,
      message: 'Attestation timeout',
      details: 'Circle attestation is taking longer than expected. The transfer may still complete.',
      recoverable: true,
    }
  }

  // Transaction failed
  if (lowerMessage.includes('reverted') || lowerMessage.includes('failed')) {
    return {
      code: BridgeErrorCode.TRANSACTION_FAILED,
      message: 'Transaction failed',
      details: message,
      recoverable: true,
    }
  }

  // Unknown error
  return {
    code: BridgeErrorCode.UNKNOWN,
    message: 'An error occurred',
    details: message,
    recoverable: true,
  }
}

export function isRecoverableError(error: unknown): boolean {
  const parsed = parseBridgeError(error)
  return parsed.recoverable
}

export function getErrorUserMessage(error: unknown): string {
  const parsed = parseBridgeError(error)
  return parsed.message
}
