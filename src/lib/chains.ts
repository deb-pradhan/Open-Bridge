import {
  mainnet,
  arbitrum,
  avalanche,
  base,
  optimism,
  polygon,
  linea,
} from 'wagmi/chains'
import type { Chain } from 'wagmi/chains'

// CCTP V2 Supported Chains (Mainnet only)
export const supportedChains = [
  mainnet,
  arbitrum,
  avalanche,
  base,
  optimism,
  polygon,
  linea,
] as const

export type SupportedChain = (typeof supportedChains)[number]

// Chain icon URLs from reliable sources
const CHAIN_ICONS = {
  ethereum: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  arbitrum: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png',
  avalanche: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanchec/info/logo.png',
  base: 'https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.png',
  optimism: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png',
  polygon: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
  linea: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/linea/info/logo.png',
} as const

// USDC token icon
export const USDC_ICON = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'

// Chain metadata for UI display
export const chainMeta: Record<number, { 
  name: string
  shortName: string
  color: string
  icon: string
}> = {
  [mainnet.id]: { 
    name: 'Ethereum', 
    shortName: 'ETH', 
    color: '#627EEA',
    icon: CHAIN_ICONS.ethereum,
  },
  [arbitrum.id]: { 
    name: 'Arbitrum One', 
    shortName: 'ARB', 
    color: '#28A0F0',
    icon: CHAIN_ICONS.arbitrum,
  },
  [avalanche.id]: { 
    name: 'Avalanche', 
    shortName: 'AVAX', 
    color: '#E84142',
    icon: CHAIN_ICONS.avalanche,
  },
  [base.id]: { 
    name: 'Base', 
    shortName: 'BASE', 
    color: '#0052FF',
    icon: CHAIN_ICONS.base,
  },
  [optimism.id]: { 
    name: 'Optimism', 
    shortName: 'OP', 
    color: '#FF0420',
    icon: CHAIN_ICONS.optimism,
  },
  [polygon.id]: { 
    name: 'Polygon', 
    shortName: 'POL', 
    color: '#8247E5',
    icon: CHAIN_ICONS.polygon,
  },
  [linea.id]: { 
    name: 'Linea', 
    shortName: 'LINEA', 
    color: '#121212',
    icon: CHAIN_ICONS.linea,
  },
}

// Map chain ID to Bridge Kit chain name
export const chainIdToBridgeKitName: Record<number, string> = {
  [mainnet.id]: 'Ethereum',
  [arbitrum.id]: 'Arbitrum',
  [avalanche.id]: 'Avalanche',
  [base.id]: 'Base',
  [optimism.id]: 'OP Mainnet',
  [polygon.id]: 'Polygon PoS',
  [linea.id]: 'Linea',
}

// CCTP Domain IDs (required for Circle Iris API)
export const CCTP_DOMAINS: Record<number, number> = {
  [mainnet.id]: 0,      // Ethereum
  [avalanche.id]: 1,    // Avalanche
  [optimism.id]: 2,     // Optimism
  [arbitrum.id]: 3,     // Arbitrum
  [base.id]: 6,         // Base
  [polygon.id]: 7,      // Polygon
  [linea.id]: 11,       // Linea
}

// Block explorer URLs
export const BLOCK_EXPLORERS: Record<number, string> = {
  [mainnet.id]: 'https://etherscan.io',
  [arbitrum.id]: 'https://arbiscan.io',
  [avalanche.id]: 'https://snowtrace.io',
  [base.id]: 'https://basescan.org',
  [optimism.id]: 'https://optimistic.etherscan.io',
  [polygon.id]: 'https://polygonscan.com',
  [linea.id]: 'https://lineascan.build',
}

export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const explorer = BLOCK_EXPLORERS[chainId] || 'https://etherscan.io'
  return `${explorer}/tx/${txHash}`
}

export function getChainById(chainId: number): Chain | undefined {
  return supportedChains.find((c) => c.id === chainId)
}
