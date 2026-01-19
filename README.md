# Open Bridge

A production-grade USDC bridging application built with Circle's Bridge Kit SDK and CCTP V2.

## Features

- **Cross-chain USDC transfers** via Circle's CCTP V2 protocol
- **17+ supported chains** including Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche, and more
- **Maximum wallet compatibility** with MetaMask, Coinbase Wallet, WalletConnect, Rainbow, and all major wallets
- **Real-time fee estimation** before transfers
- **Transfer progress tracking** with step-by-step status
- **Error recovery** with automatic retry capabilities
- **Clean UI** following the Technical Blueprint design system

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. **Clone and install dependencies:**

```bash
cd open-bridge
npm install
```

2. **Configure environment variables:**

Create a `.env` file in the root directory:

```bash
# Required: WalletConnect Project ID
# Get yours free at https://cloud.walletconnect.com
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional: Alchemy API Key for better RPC reliability
# Get yours at https://www.alchemy.com
VITE_ALCHEMY_API_KEY=your_alchemy_key_here
```

3. **Start development server:**

```bash
npm run dev
```

4. **Build for production:**

```bash
npm run build
```

## Required Credentials

### WalletConnect Project ID (Required)

1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Sign up or log in
3. Create a new project
4. Copy the Project ID

### Alchemy API Key (Recommended for Production)

1. Go to [alchemy.com](https://www.alchemy.com)
2. Sign up or log in
3. Create a new app
4. Copy the API Key

Using Alchemy ensures reliable RPC connections and prevents rate limiting on public endpoints.

## Supported Chains

### Mainnets
- Ethereum
- Arbitrum
- Avalanche
- Base
- Optimism (OP Mainnet)
- Polygon PoS
- Linea

### Testnets
- Ethereum Sepolia
- Arbitrum Sepolia
- Base Sepolia
- OP Sepolia
- Polygon Amoy
- Avalanche Fuji
- Linea Sepolia

## Architecture

```
src/
├── components/
│   ├── ui/           # Design system components
│   ├── bridge/       # Bridge-specific components
│   └── wallet/       # Wallet connection
├── hooks/            # React hooks
├── lib/              # Core utilities
│   ├── wagmi.ts      # Wallet configuration
│   ├── chains.ts     # Chain definitions
│   ├── bridge-kit.ts # Bridge Kit integration
│   └── errors.ts     # Error handling
└── styles/           # CSS and design tokens
```

## How It Works

1. **Connect Wallet**: Users connect via RainbowKit (supports all major wallets)
2. **Select Chains**: Choose source and destination chains
3. **Enter Amount**: Input USDC amount to transfer
4. **Review Fees**: See estimated gas and protocol fees
5. **Execute Bridge**: 
   - Approve USDC spending
   - Burn USDC on source chain
   - Wait for Circle attestation (~15 seconds)
   - Mint USDC on destination chain

## Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **Wallet**: wagmi v2 + viem + RainbowKit
- **Bridge**: Circle Bridge Kit + CCTP V2
- **Styling**: Tailwind CSS
- **State**: React Context + TanStack Query

## Resources

- [Circle Bridge Kit Documentation](https://developers.circle.com/bridge-kit)
- [CCTP Documentation](https://developers.circle.com/cctp)
- [RainbowKit Documentation](https://rainbowkit.com/docs)
- [wagmi Documentation](https://wagmi.sh)

## License

MIT
