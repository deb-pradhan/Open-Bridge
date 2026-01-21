import '@rainbow-me/rainbowkit/styles.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { config } from '@/lib/wagmi'
import { ConnectButton } from '@/components/wallet/ConnectButton'
import { BridgeForm } from '@/components/bridge'
import { ProgressPanel } from '@/components/bridge/ProgressPanel'
import { RecentTransactions } from '@/components/bridge/RecentTransactions'
import { PendingRecoveryBanner } from '@/components/bridge/PendingRecoveryBanner'
import { WhyCCTP } from '@/components/bridge/WhyCCTP'
import { ArrowUpRight } from 'lucide-react'
import { BridgeProvider } from '@/context/BridgeContext'
import Analytics from '@/pages/Analytics'

const queryClient = new QueryClient()

function App() {
  return (
    <BrowserRouter>
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
            <Routes>
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={
                <BridgeProvider>
                  <AppContent />
                </BridgeProvider>
              } />
            </Routes>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  )
}

function AppContent() {
  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-border-grid bg-surface-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img src="/logo.png" alt="Open Bridge" className="h-6 sm:h-8 w-auto shrink-0" />
              <span className="text-lg sm:text-h1 font-normal text-ink-primary tracking-tight truncate">OpenBridge</span>
            </div>
            <span className="hidden sm:inline-block px-2 py-1 text-label uppercase tracking-wider text-ink-tertiary border border-border-element bg-surface-subtle shrink-0">
              CCTP V2
            </span>
          </div>
          <div className="shrink-0">
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-8">
        {/* Pending Recovery Banner */}
        <PendingRecoveryBanner />
        
        {/* 
          Mobile: Single column - BridgeForm, Progress, Recent, WhyCCTP
          Desktop: Two columns - Left (BridgeForm, Recent, WhyCCTP), Right (Progress sticky)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 sm:gap-6">
          {/* Bridge Form */}
          <div className="lg:col-start-1 lg:row-start-1">
            <BridgeForm />
          </div>
          
          {/* Progress Panel - After BridgeForm on mobile, right column on desktop */}
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-3 lg:sticky lg:top-8 lg:self-start">
            <ProgressPanel />
          </div>
          
          {/* Recent Transactions */}
          <div className="lg:col-start-1 lg:row-start-2">
            <RecentTransactions />
          </div>
          
          {/* Why CCTP */}
          <div className="lg:col-start-1 lg:row-start-3">
            <WhyCCTP />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-grid bg-surface-card mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="text-label text-ink-tertiary text-center sm:text-left">
                Powered by{' '}
                <a
                  href="https://developers.circle.com/bridge-kit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-main hover:underline"
                >
                  Circle Bridge Kit
                </a>{' '}
                & CCTP
              </div>
              <div className="flex items-center gap-4 sm:gap-6">
                <FooterLink href="https://developers.circle.com/stablecoins/cctp-getting-started" label="CCTP Docs" />
                <FooterLink href="https://github.com/deb-pradhan/Open-Bridge" label="GitHub" />
              </div>
            </div>
            <div className="text-label text-ink-muted text-center">
              Made by{' '}
              <a
                href="https://x.com/WhatIsDeb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-secondary hover:text-accent-main transition-colors"
              >
                Deb
              </a>{' '}
              from{' '}
              <a
                href="https://x.com/jlabsdigital"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink-secondary hover:text-accent-main transition-colors"
              >
                jlabs digital
              </a>
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
