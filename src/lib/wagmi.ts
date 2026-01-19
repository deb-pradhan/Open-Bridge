import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import {
  mainnet,
  arbitrum,
  avalanche,
  base,
  optimism,
  polygon,
  linea,
} from 'wagmi/chains'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo'
const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY

// Configure transports with optional Alchemy endpoints
function getTransport(alchemyNetwork?: string) {
  if (alchemyKey && alchemyNetwork) {
    return http(`https://${alchemyNetwork}.g.alchemy.com/v2/${alchemyKey}`)
  }
  return http()
}

export const config = getDefaultConfig({
  appName: 'Open Bridge',
  projectId,
  chains: [
    mainnet,
    arbitrum,
    avalanche,
    base,
    optimism,
    polygon,
    linea,
  ],
  transports: {
    [mainnet.id]: getTransport('eth-mainnet'),
    [arbitrum.id]: getTransport('arb-mainnet'),
    [avalanche.id]: http(), // Alchemy doesn't support Avalanche
    [base.id]: getTransport('base-mainnet'),
    [optimism.id]: getTransport('opt-mainnet'),
    [polygon.id]: getTransport('polygon-mainnet'),
    [linea.id]: getTransport('linea-mainnet'),
  },
  ssr: false,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
