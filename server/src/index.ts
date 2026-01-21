import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 4000

// Admin key for analytics dashboard access
const ANALYTICS_KEY = (process.env.ANALYTICS_KEY || 'admin').trim()

app.use(cors())
app.use(express.json())

// Middleware to check analytics key
function requireAnalyticsAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization
  const key = authHeader?.replace('Bearer ', '')
  
  if (key !== ANALYTICS_KEY) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

// ==================== PUBLIC TRACKING ENDPOINTS ====================

// Track a transaction
app.post('/api/track/transaction', async (req, res) => {
  try {
    const {
      sourceChainId,
      destChainId,
      amount,
      amountUsd,
      status,
      transferSpeed,
      walletAddress,
      burnTxHash,
      mintTxHash,
      startedAt,
      completedAt,
      durationMs,
    } = req.body

    const tx = await prisma.transaction.create({
      data: {
        sourceChainId,
        destChainId,
        amount,
        amountUsd,
        status,
        transferSpeed,
        walletAddress: walletAddress.toLowerCase(),
        burnTxHash,
        mintTxHash,
        startedAt: new Date(startedAt),
        completedAt: completedAt ? new Date(completedAt) : null,
        durationMs,
      },
    })

    res.json({ success: true, id: tx.id })
  } catch (error) {
    console.error('Track transaction error:', error)
    res.status(500).json({ error: 'Failed to track transaction' })
  }
})

// Update transaction status
app.patch('/api/track/transaction/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, mintTxHash, completedAt, durationMs } = req.body

    await prisma.transaction.update({
      where: { id },
      data: {
        status,
        mintTxHash,
        completedAt: completedAt ? new Date(completedAt) : undefined,
        durationMs,
      },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Update transaction error:', error)
    res.status(500).json({ error: 'Failed to update transaction' })
  }
})

// Track wallet connection
app.post('/api/track/wallet', async (req, res) => {
  try {
    const { walletAddress, chainId } = req.body

    await prisma.walletConnection.create({
      data: {
        walletAddress: walletAddress.toLowerCase(),
        chainId,
      },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Track wallet error:', error)
    res.status(500).json({ error: 'Failed to track wallet' })
  }
})

// Track page view
app.post('/api/track/pageview', async (req, res) => {
  try {
    const { path, referrer } = req.body
    const userAgent = req.headers['user-agent']

    await prisma.pageView.create({
      data: {
        path,
        referrer,
        userAgent,
      },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Track pageview error:', error)
    res.status(500).json({ error: 'Failed to track pageview' })
  }
})

// ==================== PROTECTED ANALYTICS ENDPOINTS ====================

// Get dashboard stats
app.get('/api/analytics/dashboard', requireAnalyticsAuth, async (_req, res) => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Total stats
    const [
      totalTransactions,
      successfulTransactions,
      totalVolume,
      uniqueWallets,
      totalPageViews,
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: 'success' } }),
      prisma.transaction.aggregate({
        _sum: { amountUsd: true },
        where: { status: 'success' },
      }),
      prisma.transaction.groupBy({
        by: ['walletAddress'],
        _count: true,
      }),
      prisma.pageView.count(),
    ])

    // Today's stats
    const [todayTx, todayVolume, todayWallets, todayPageViews] = await Promise.all([
      prisma.transaction.count({ where: { createdAt: { gte: today } } }),
      prisma.transaction.aggregate({
        _sum: { amountUsd: true },
        where: { createdAt: { gte: today }, status: 'success' },
      }),
      prisma.walletConnection.groupBy({
        by: ['walletAddress'],
        where: { createdAt: { gte: today } },
      }),
      prisma.pageView.count({ where: { createdAt: { gte: today } } }),
    ])

    // Last 7 days stats
    const [weekTx, weekVolume, weekWallets] = await Promise.all([
      prisma.transaction.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.transaction.aggregate({
        _sum: { amountUsd: true },
        where: { createdAt: { gte: weekAgo }, status: 'success' },
      }),
      prisma.transaction.groupBy({
        by: ['walletAddress'],
        where: { createdAt: { gte: weekAgo } },
      }),
    ])

    // Chain popularity
    const chainStats = await prisma.transaction.groupBy({
      by: ['sourceChainId', 'destChainId'],
      _count: true,
      _sum: { amountUsd: true },
      orderBy: { _count: { sourceChainId: 'desc' } },
      take: 10,
    })

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        sourceChainId: true,
        destChainId: true,
        amount: true,
        amountUsd: true,
        status: true,
        transferSpeed: true,
        durationMs: true,
      },
    })

    // Daily volume for chart (last 30 days)
    const dailyVolumeRaw = await prisma.$queryRaw<
      { date: Date; count: bigint; volume: number | null }[]
    >`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        SUM(amount_usd) as volume
      FROM "Transaction"
      WHERE created_at >= ${monthAgo}
        AND status = 'success'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    const dailyVolume = dailyVolumeRaw.map(d => ({
      date: d.date.toISOString().split('T')[0],
      count: Number(d.count),
      volume: d.volume || 0,
    }))

    res.json({
      totals: {
        transactions: totalTransactions,
        successfulTransactions,
        volume: totalVolume._sum.amountUsd || 0,
        uniqueWallets: uniqueWallets.length,
        pageViews: totalPageViews,
      },
      today: {
        transactions: todayTx,
        volume: todayVolume._sum.amountUsd || 0,
        uniqueWallets: todayWallets.length,
        pageViews: todayPageViews,
      },
      week: {
        transactions: weekTx,
        volume: weekVolume._sum.amountUsd || 0,
        uniqueWallets: weekWallets.length,
      },
      chainStats,
      recentTransactions,
      dailyVolume,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    res.status(500).json({ error: 'Failed to fetch dashboard stats' })
  }
})

// Get transactions with pagination
app.get('/api/analytics/transactions', requireAnalyticsAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100)
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count(),
    ])

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

// Verify analytics key (for frontend auth check)
app.post('/api/analytics/verify', (req, res) => {
  const { key } = req.body
  const trimmedKey = (key || '').trim()
  const isValid = trimmedKey === ANALYTICS_KEY
  console.log(`Auth attempt: valid=${isValid}, keyLength=${trimmedKey.length}, expectedLength=${ANALYTICS_KEY.length}`)
  res.json({ valid: isValid })
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})
