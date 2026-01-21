// Analytics tracking utilities
// In production, set VITE_API_URL to your API service URL
// Falls back to same-origin /api for simpler deployments, or localhost for local dev
const API_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD ? '' : 'http://localhost:4000'
)

interface TrackTransactionData {
  sourceChainId: number
  destChainId: number
  amount: string
  amountUsd?: number
  status: 'pending' | 'success' | 'failed'
  transferSpeed: 'standard' | 'fast'
  walletAddress: string
  burnTxHash?: string
  mintTxHash?: string
  startedAt: number
  completedAt?: number
  durationMs?: number
}

interface UpdateTransactionData {
  status?: 'pending' | 'success' | 'failed'
  mintTxHash?: string
  completedAt?: number
  durationMs?: number
}

// Track new transaction
export async function trackTransaction(data: TrackTransactionData): Promise<string | null> {
  if (!API_URL) return null
  
  try {
    const res = await fetch(`${API_URL}/api/track/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    return json.id || null
  } catch (error) {
    console.error('Failed to track transaction:', error)
    return null
  }
}

// Update transaction status
export async function updateTransaction(id: string, data: UpdateTransactionData): Promise<void> {
  if (!API_URL || !id) return
  
  try {
    await fetch(`${API_URL}/api/track/transaction/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  } catch (error) {
    console.error('Failed to update transaction:', error)
  }
}

// Track wallet connection
export async function trackWalletConnection(walletAddress: string, chainId?: number): Promise<void> {
  if (!API_URL) return
  
  try {
    await fetch(`${API_URL}/api/track/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress, chainId }),
    })
  } catch (error) {
    console.error('Failed to track wallet connection:', error)
  }
}

// Track page view
export async function trackPageView(path: string): Promise<void> {
  if (!API_URL) return
  
  try {
    await fetch(`${API_URL}/api/track/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        path, 
        referrer: document.referrer || undefined,
      }),
    })
  } catch (error) {
    console.error('Failed to track page view:', error)
  }
}

// Verify analytics key
export async function verifyAnalyticsKey(key: string): Promise<boolean> {
  if (!API_URL) return false
  
  try {
    const res = await fetch(`${API_URL}/api/analytics/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
    const json = await res.json()
    return json.valid === true
  } catch (error) {
    console.error('Failed to verify key:', error)
    return false
  }
}

// Fetch dashboard stats
export async function fetchDashboardStats(key: string) {
  if (!API_URL) return null
  
  const res = await fetch(`${API_URL}/api/analytics/dashboard`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  
  if (!res.ok) throw new Error('Failed to fetch dashboard stats')
  return res.json()
}

// Fetch transactions
export async function fetchTransactions(key: string, page = 1, limit = 50) {
  if (!API_URL) return null
  
  const res = await fetch(`${API_URL}/api/analytics/transactions?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${key}` },
  })
  
  if (!res.ok) throw new Error('Failed to fetch transactions')
  return res.json()
}
