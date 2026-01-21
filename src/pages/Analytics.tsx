import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui'
import { 
  verifyAnalyticsKey, 
  fetchDashboardStats,
} from '@/lib/analytics'
import { 
  TrendingUp, 
  Wallet, 
  Activity, 
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Lock,
  LogOut,
} from 'lucide-react'

// Chain name mapping
const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  10: 'Optimism',
  137: 'Polygon',
  8453: 'Base',
  42161: 'Arbitrum',
  43114: 'Avalanche',
  59144: 'Linea',
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`
  return `$${value.toFixed(2)}`
}

function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`
  return value.toLocaleString()
}

interface DashboardStats {
  totals: {
    transactions: number
    successfulTransactions: number
    volume: number
    uniqueWallets: number
    pageViews: number
  }
  today: {
    transactions: number
    volume: number
    uniqueWallets: number
    pageViews: number
  }
  week: {
    transactions: number
    volume: number
    uniqueWallets: number
  }
  chainStats: Array<{
    sourceChainId: number
    destChainId: number
    _count: number
    _sum: { amountUsd: number | null }
  }>
  recentTransactions: Array<{
    id: string
    createdAt: string
    sourceChainId: number
    destChainId: number
    amount: string
    amountUsd: number | null
    status: string
    transferSpeed: string
    durationMs: number | null
  }>
  dailyVolume: Array<{
    date: string
    count: number
    volume: number
  }>
}

export function Analytics() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [keyInput, setKeyInput] = useState('')
  const [analyticsKey, setAnalyticsKey] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)

  // Check for stored key on mount
  useEffect(() => {
    const storedKey = sessionStorage.getItem('analytics_key')
    if (storedKey) {
      verifyAndSetKey(storedKey)
    }
  }, [])

  const verifyAndSetKey = async (key: string) => {
    setIsLoading(true)
    setError(null)
    
    const valid = await verifyAnalyticsKey(key)
    
    if (valid) {
      setAnalyticsKey(key)
      setIsAuthenticated(true)
      sessionStorage.setItem('analytics_key', key)
    } else {
      setError('Invalid analytics key')
      sessionStorage.removeItem('analytics_key')
    }
    
    setIsLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await verifyAndSetKey(keyInput)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setAnalyticsKey(null)
    setStats(null)
    sessionStorage.removeItem('analytics_key')
  }

  const loadStats = useCallback(async () => {
    if (!analyticsKey) return
    
    setIsLoading(true)
    try {
      const data = await fetchDashboardStats(analyticsKey)
      setStats(data)
    } catch (err) {
      setError('Failed to load stats')
    } finally {
      setIsLoading(false)
    }
  }, [analyticsKey])

  // Load stats when authenticated
  useEffect(() => {
    if (isAuthenticated && analyticsKey) {
      loadStats()
      // Refresh every 30 seconds
      const interval = setInterval(loadStats, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, analyticsKey, loadStats])

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-canvas flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center">
              <Lock className="w-8 h-8 text-accent-main" />
            </div>
            
            <div className="text-center">
              <h1 className="text-h1 text-ink-primary mb-2">Analytics Dashboard</h1>
              <p className="text-body text-ink-secondary">Enter your analytics key to continue</p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4">
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Analytics key"
                className="w-full px-4 py-3 bg-surface-subtle border border-border-element text-ink-primary placeholder:text-ink-tertiary focus:outline-none focus:border-accent-main"
                disabled={isLoading}
              />
              
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || !keyInput}
                className="w-full px-4 py-3 bg-accent-main text-white font-medium rounded-full hover:bg-accent-emphasis disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Access Dashboard'
                )}
              </button>
            </form>
          </div>
        </Card>
      </div>
    )
  }

  // Dashboard
  return (
    <div className="min-h-screen bg-surface-canvas">
      {/* Header */}
      <header className="border-b border-border-grid bg-surface-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-accent-main" />
            <h1 className="text-h1 text-ink-primary">Analytics Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={loadStats}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary flex items-center gap-1.5"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm text-ink-secondary hover:text-ink-primary flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Volume"
            value={formatUsd(stats?.totals.volume || 0)}
            subtitle={`Today: ${formatUsd(stats?.today.volume || 0)}`}
            icon={TrendingUp}
            trend={stats?.today.volume ? 'up' : undefined}
          />
          <MetricCard
            title="Transactions"
            value={formatNumber(stats?.totals.transactions || 0)}
            subtitle={`Today: ${stats?.today.transactions || 0}`}
            icon={Activity}
            trend={stats?.today.transactions ? 'up' : undefined}
          />
          <MetricCard
            title="Unique Wallets"
            value={formatNumber(stats?.totals.uniqueWallets || 0)}
            subtitle={`Today: ${stats?.today.uniqueWallets || 0}`}
            icon={Wallet}
          />
          <MetricCard
            title="Page Views"
            value={formatNumber(stats?.totals.pageViews || 0)}
            subtitle={`Today: ${stats?.today.pageViews || 0}`}
            icon={Eye}
          />
        </div>

        {/* Success Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="p-6">
            <h3 className="text-label text-ink-tertiary uppercase tracking-wider mb-4">Success Rate</h3>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center">
                <span className="text-h1 text-ink-primary">
                  {stats?.totals.transactions 
                    ? Math.round((stats.totals.successfulTransactions / stats.totals.transactions) * 100)
                    : 0}%
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-body text-ink-secondary">
                  <span className="text-green-500">{stats?.totals.successfulTransactions || 0}</span> successful
                </p>
                <p className="text-body text-ink-secondary">
                  <span className="text-red-500">{(stats?.totals.transactions || 0) - (stats?.totals.successfulTransactions || 0)}</span> failed
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h3 className="text-label text-ink-tertiary uppercase tracking-wider mb-4">7-Day Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-h2 text-ink-primary">{formatNumber(stats?.week.transactions || 0)}</p>
                <p className="text-label text-ink-tertiary">Transactions</p>
              </div>
              <div>
                <p className="text-h2 text-ink-primary">{formatUsd(stats?.week.volume || 0)}</p>
                <p className="text-label text-ink-tertiary">Volume</p>
              </div>
              <div>
                <p className="text-h2 text-ink-primary">{formatNumber(stats?.week.uniqueWallets || 0)}</p>
                <p className="text-label text-ink-tertiary">Unique Wallets</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Volume Chart */}
        {stats?.dailyVolume && stats.dailyVolume.length > 0 && (
          <Card className="p-6">
            <h3 className="text-label text-ink-tertiary uppercase tracking-wider mb-4">Daily Volume (30 Days)</h3>
            <div className="h-48 flex items-end gap-1">
              {stats.dailyVolume.map((day) => {
                const maxVolume = Math.max(...stats.dailyVolume.map(d => d.volume))
                const height = maxVolume > 0 ? (day.volume / maxVolume) * 100 : 0
                return (
                  <div
                    key={day.date}
                    className="flex-1 bg-accent-main/80 hover:bg-accent-main transition-colors rounded-t relative group"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  >
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-surface-card border border-border-element px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <p className="font-medium">{day.date}</p>
                      <p className="text-ink-secondary">{formatUsd(day.volume)}</p>
                      <p className="text-ink-tertiary">{day.count} txs</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* Popular Routes */}
        {stats?.chainStats && stats.chainStats.length > 0 && (
          <Card className="p-6">
            <h3 className="text-label text-ink-tertiary uppercase tracking-wider mb-4">Popular Routes</h3>
            <div className="space-y-3">
              {stats.chainStats.slice(0, 5).map((route, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border-grid last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body text-ink-primary">
                      {CHAIN_NAMES[route.sourceChainId] || `Chain ${route.sourceChainId}`}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-ink-tertiary" />
                    <span className="text-body text-ink-primary">
                      {CHAIN_NAMES[route.destChainId] || `Chain ${route.destChainId}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-body text-ink-primary">{route._count} txs</p>
                    <p className="text-label text-ink-tertiary">{formatUsd(route._sum.amountUsd || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card className="p-6">
          <h3 className="text-label text-ink-tertiary uppercase tracking-wider mb-4">Recent Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-label text-ink-tertiary uppercase tracking-wider">
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Route</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Speed</th>
                  <th className="pb-3 pr-4">Duration</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-border-grid">
                    <td className="py-3 pr-4 text-body text-ink-secondary">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-body text-ink-primary">
                      {CHAIN_NAMES[tx.sourceChainId] || tx.sourceChainId} → {CHAIN_NAMES[tx.destChainId] || tx.destChainId}
                    </td>
                    <td className="py-3 pr-4 text-body text-ink-primary">
                      {tx.amount} USDC
                      {tx.amountUsd && (
                        <span className="text-ink-tertiary ml-1">({formatUsd(tx.amountUsd)})</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-label px-2 py-0.5 rounded ${
                        tx.transferSpeed === 'fast' 
                          ? 'bg-yellow-500/20 text-yellow-500' 
                          : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {tx.transferSpeed}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-body text-ink-secondary">
                      {tx.durationMs ? `${(tx.durationMs / 1000).toFixed(1)}s` : '-'}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                  </tr>
                ))}
                {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-ink-tertiary">
                      No transactions yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend 
}: { 
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  trend?: 'up' | 'down'
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent-main/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-accent-main" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          </div>
        )}
      </div>
      <h3 className="text-label text-ink-tertiary uppercase tracking-wider mb-1">{title}</h3>
      <p className="text-h1 text-ink-primary mb-1">{value}</p>
      <p className="text-label text-ink-tertiary">{subtitle}</p>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return (
        <span className="flex items-center gap-1 text-green-500">
          <CheckCircle className="w-4 h-4" />
          <span className="text-label">Success</span>
        </span>
      )
    case 'failed':
      return (
        <span className="flex items-center gap-1 text-red-500">
          <XCircle className="w-4 h-4" />
          <span className="text-label">Failed</span>
        </span>
      )
    default:
      return (
        <span className="flex items-center gap-1 text-yellow-500">
          <Clock className="w-4 h-4" />
          <span className="text-label">Pending</span>
        </span>
      )
  }
}

export default Analytics
