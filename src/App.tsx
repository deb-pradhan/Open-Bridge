import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { config } from '@/lib/wagmi'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { BridgeForm } from '@/components/bridge'
import { ProgressPanel } from '@/components/bridge/ProgressPanel'
import { RecentTransactions } from '@/components/bridge/RecentTransactions'
import { PendingRecoveryBanner } from '@/components/bridge/PendingRecoveryBanner'
import { ArrowUpRight } from 'lucide-react'
import { BridgeProvider } from '@/context/BridgeContext'

const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#3A2E6F',
            accentColorForeground: 'white',
            borderRadius: 'none',
            fontStack: 'system',
          })}
        >
          <BridgeProvider>
            <AppContent />
          </BridgeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

function AppContent() {
  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col">
      {/* Header */}
      <header className="border-b border-border-grid bg-surface-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Open Bridge" className="h-8 w-auto" />
              <span className="text-h1 font-normal text-ink-primary tracking-tight">OpenBridge</span>
            </div>
            <span className="px-2 py-1 text-label uppercase tracking-wider text-ink-tertiary border border-border-element bg-surface-subtle">
              CCTP V2
            </span>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Pending Recovery Banner */}
        <PendingRecoveryBanner />
        
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Column - Bridge Form */}
          <div className="flex-1 min-w-0 space-y-6">
            <BridgeForm />
            <RecentTransactions />
          </div>
          
          {/* Right Column - Progress Panel */}
          <div className="w-full lg:w-[340px] lg:shrink-0 lg:sticky lg:top-8">
            <ProgressPanel />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-grid bg-surface-card mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-label text-ink-tertiary">
              Powered by{' '}
              <a
                href="https://developers.circle.com/bridge-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-main hover:underline"
              >
                Circle Bridge Kit
              </a>{' '}
              and CCTP V2
            </div>
            <div className="flex items-center gap-6">
              <FooterLink href="https://developers.circle.com" label="Docs" />
              <FooterLink href="https://github.com" label="GitHub" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-label text-ink-secondary hover:text-accent-main transition-colors"
    >
      {label}
      <ArrowUpRight size={12} />
    </a>
  )
}

export default App
