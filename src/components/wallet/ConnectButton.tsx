import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import { Wallet, ChevronDown, Loader2 } from 'lucide-react'
import { useMultiChainBalances } from '@/hooks/useChains'
import { USDC_ICON } from '@/lib/chains'

export function ConnectButton() {
  const { totalUsdc, isLoading: balanceLoading } = useMultiChainBalances()

  return (
    <RainbowConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading'
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === 'authenticated')

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="flex items-center gap-2 px-6 py-3 bg-accent-main text-ink-on-accent rounded-pill font-medium text-body hover:bg-accent-hover transition-colors"
                  >
                    <Wallet size={18} />
                    <span>Connect Wallet</span>
                  </button>
                )
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 px-6 py-3 bg-signal-error text-ink-on-accent rounded-pill font-medium text-body hover:opacity-90 transition-opacity"
                  >
                    Wrong network
                    <ChevronDown size={16} />
                  </button>
                )
              }

              return (
                <div className="flex items-center gap-2">
                  {/* Total USDC Balance */}
                  <div className="hidden md:flex items-center gap-2 px-4 py-3 bg-surface-subtle border border-border-element rounded-pill">
                    <img src={USDC_ICON} alt="USDC" className="w-4 h-4 rounded-full" />
                    {balanceLoading ? (
                      <Loader2 size={14} className="animate-spin text-ink-tertiary" />
                    ) : (
                      <span className="text-body font-mono text-ink-primary">
                        {parseFloat(totalUsdc).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                    <span className="text-label text-ink-tertiary uppercase">Total</span>
                  </div>

                  {/* Chain selector */}
                  <button
                    onClick={openChainModal}
                    className="flex items-center gap-2 px-4 py-3 bg-surface-card border border-border-grid rounded-pill text-body hover:border-accent-main transition-colors"
                  >
                    {chain.hasIcon && (
                      <div
                        className="w-5 h-5 rounded-full overflow-hidden"
                        style={{ background: chain.iconBackground }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-5 h-5"
                          />
                        )}
                      </div>
                    )}
                    <span className="hidden sm:inline">{chain.name}</span>
                    <ChevronDown size={16} className="text-ink-tertiary" />
                  </button>

                  {/* Account */}
                  <button
                    onClick={openAccountModal}
                    className="flex items-center gap-2 px-4 py-3 bg-accent-main text-ink-on-accent rounded-pill font-medium text-body hover:bg-accent-hover transition-colors"
                  >
                    <span className="font-mono">{account.displayName}</span>
                  </button>
                </div>
              )
            })()}
          </div>
        )
      }}
    </RainbowConnectButton.Custom>
  )
}
