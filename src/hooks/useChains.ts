import { useMemo } from 'react'
import { useAccount, useBalance, useReadContracts } from 'wagmi'
import { supportedChains, chainMeta } from '@/lib/chains'
import { formatUnits, erc20Abi } from 'viem'

// USDC contract addresses (Mainnet only)
export const USDC_ADDRESSES: Record<number, `0x${string}`> = {
  1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Ethereum
  42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum
  43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // Avalanche
  8453: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
  10: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // Optimism
  137: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // Polygon
  59144: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff', // Linea
}

export interface ChainWithBalance {
  id: number
  name: string
  usdcBalance: string | null
  nativeBalance: string | null
  meta: {
    name: string
    shortName: string
    color: string
  }
}

export interface MultiChainBalance {
  usdc: string | null
  native: string | null
  nativeSymbol: string
  isLoading: boolean
}

export function useChains() {
  const { chain: connectedChain } = useAccount()

  const chains = useMemo(() => {
    return supportedChains.map(chain => ({
      ...chain,
      meta: chainMeta[chain.id] || { name: chain.name, shortName: chain.name.slice(0, 4), color: '#888' },
    }))
  }, [])

  return {
    chains,
    availableChains: chains,
    connectedChain,
  }
}

// Fetch USDC balance for a specific chain
export function useUsdcBalance(chainId: number | undefined) {
  const { address } = useAccount()
  
  const usdcAddress = chainId ? USDC_ADDRESSES[chainId] : undefined
  
  const { data: balance, isLoading } = useBalance({
    address,
    token: usdcAddress,
    chainId: chainId as 1 | 10 | 42161 | 43114 | 8453 | 137 | 59144 | undefined,
    query: {
      enabled: !!address && !!chainId && !!usdcAddress,
    },
  })

  const formatted = balance ? formatUnits(balance.value, balance.decimals) : null

  return {
    balance: formatted,
    isLoading,
    raw: balance,
  }
}

// Fetch native token balance for a specific chain
export function useNativeBalance(chainId: number | undefined) {
  const { address } = useAccount()
  
  const { data: balance, isLoading } = useBalance({
    address,
    chainId: chainId as 1 | 10 | 42161 | 43114 | 8453 | 137 | 59144 | undefined,
    query: {
      enabled: !!address && !!chainId,
    },
  })

  const formatted = balance ? formatUnits(balance.value, balance.decimals) : null

  return {
    balance: formatted,
    symbol: balance?.symbol,
    isLoading,
    raw: balance,
  }
}

// Fetch USDC balances across all supported chains
export function useMultiChainBalances(): {
  balances: Record<number, MultiChainBalance>
  totalUsdc: string
  isLoading: boolean
} {
  const { address } = useAccount()

  // Create contract calls for all chains
  const contracts = useMemo(() => {
    if (!address) return []
    
    return supportedChains.flatMap(chain => {
      const usdcAddress = USDC_ADDRESSES[chain.id]
      if (!usdcAddress) return []
      
      return [{
        address: usdcAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
        chainId: chain.id,
      }]
    })
  }, [address])

  const { data: usdcResults, isLoading: usdcLoading } = useReadContracts({
    contracts,
    query: {
      enabled: !!address && contracts.length > 0,
    },
  })

  // Fetch native balances for each chain
  const eth = useBalance({ address, chainId: 1, query: { enabled: !!address } })
  const arb = useBalance({ address, chainId: 42161, query: { enabled: !!address } })
  const avax = useBalance({ address, chainId: 43114, query: { enabled: !!address } })
  const baseChain = useBalance({ address, chainId: 8453, query: { enabled: !!address } })
  const op = useBalance({ address, chainId: 10, query: { enabled: !!address } })
  const pol = useBalance({ address, chainId: 137, query: { enabled: !!address } })
  const lineaChain = useBalance({ address, chainId: 59144, query: { enabled: !!address } })

  const nativeBalances: Record<number, { balance: string | null; symbol: string; isLoading: boolean }> = {
    1: { balance: eth.data ? formatUnits(eth.data.value, eth.data.decimals) : null, symbol: 'ETH', isLoading: eth.isLoading },
    42161: { balance: arb.data ? formatUnits(arb.data.value, arb.data.decimals) : null, symbol: 'ETH', isLoading: arb.isLoading },
    43114: { balance: avax.data ? formatUnits(avax.data.value, avax.data.decimals) : null, symbol: 'AVAX', isLoading: avax.isLoading },
    8453: { balance: baseChain.data ? formatUnits(baseChain.data.value, baseChain.data.decimals) : null, symbol: 'ETH', isLoading: baseChain.isLoading },
    10: { balance: op.data ? formatUnits(op.data.value, op.data.decimals) : null, symbol: 'ETH', isLoading: op.isLoading },
    137: { balance: pol.data ? formatUnits(pol.data.value, pol.data.decimals) : null, symbol: 'POL', isLoading: pol.isLoading },
    59144: { balance: lineaChain.data ? formatUnits(lineaChain.data.value, lineaChain.data.decimals) : null, symbol: 'ETH', isLoading: lineaChain.isLoading },
  }

  const balances = useMemo(() => {
    const result: Record<number, MultiChainBalance> = {}
    
    supportedChains.forEach((chain, index) => {
      const usdcResult = usdcResults?.[index]
      const usdcBalance = usdcResult?.status === 'success' && usdcResult.result 
        ? formatUnits(usdcResult.result as bigint, 6) 
        : null
      
      const native = nativeBalances[chain.id]
      
      result[chain.id] = {
        usdc: usdcBalance,
        native: native?.balance ?? null,
        nativeSymbol: native?.symbol ?? 'ETH',
        isLoading: usdcLoading || (native?.isLoading ?? false),
      }
    })
    
    return result
  }, [usdcResults, usdcLoading, nativeBalances])

  const totalUsdc = useMemo(() => {
    let total = 0
    Object.values(balances).forEach(b => {
      if (b.usdc) {
        total += parseFloat(b.usdc)
      }
    })
    return total.toFixed(2)
  }, [balances])

  return {
    balances,
    totalUsdc,
    isLoading: usdcLoading,
  }
}
