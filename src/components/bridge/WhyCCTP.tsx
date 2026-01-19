import type { ReactNode } from 'react'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ArrowRight,
  ArrowDown,
  Flame,
  Coins,
  Building2,
  Users,
  Lock
} from 'lucide-react'

// Mobile comparison row component
function ComparisonRow({ 
  label, 
  traditional, 
  cctp 
}: { 
  label: string
  traditional: ReactNode
  cctp: ReactNode 
}) {
  return (
    <div className="flex items-center border border-border-element bg-surface-subtle">
      <div className="w-20 shrink-0 px-2 py-2 text-label text-ink-tertiary border-r border-border-element">
        {label}
      </div>
      <div className="flex-1 px-2 py-2 text-center text-label border-r border-border-element bg-signal-error/5">
        {traditional}
      </div>
      <div className="flex-1 px-2 py-2 text-center text-label bg-signal-success/5">
        {cctp}
      </div>
    </div>
  )
}

export function WhyCCTP() {
  return (
    <div className="bg-surface-card border border-border-grid relative">
      {/* Crosshair decoration */}
      <div className="absolute -top-[5px] -right-[5px] text-accent-main font-mono text-sm">+</div>
      
      {/* Header */}
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border-element flex items-center gap-2">
        <Shield size={16} className="text-accent-main" />
        <span className="text-h2 text-ink-primary">Why CCTP?</span>
        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent-main border border-accent-main bg-accent-subtle">
          Learn
        </span>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-4 sm:space-y-6">
          
        {/* Visual Flow Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          {/* Traditional Bridge */}
          <div className="p-3 sm:p-4 border border-signal-error/30 bg-signal-error/5 space-y-3">
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-signal-error shrink-0" />
              <span className="text-label uppercase tracking-wider text-signal-error">Traditional Bridge</span>
            </div>
            
            {/* Mobile: Vertical flow, Desktop: Horizontal flow */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-1 text-body">
              <div className="flex items-center gap-2 sm:gap-1 sm:flex-col">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-subtle border border-border-element flex items-center justify-center shrink-0">
                  <Coins size={14} className="sm:w-4 sm:h-4 text-ink-secondary" />
                </div>
                <span className="text-label text-ink-tertiary">Your USDC</span>
              </div>
              
              <ArrowDown size={14} className="text-ink-tertiary sm:hidden" />
              <ArrowRight size={14} className="text-ink-tertiary hidden sm:block shrink-0" />
              
              <div className="flex items-center gap-2 sm:gap-1 sm:flex-col">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-signal-warning/20 border border-signal-warning flex items-center justify-center shrink-0">
                  <Lock size={14} className="sm:w-4 sm:h-4 text-signal-warning" />
                </div>
                <span className="text-label text-ink-tertiary">Locked</span>
              </div>
              
              <ArrowDown size={14} className="text-ink-tertiary sm:hidden" />
              <ArrowRight size={14} className="text-ink-tertiary hidden sm:block shrink-0" />
              
              <div className="flex items-center gap-2 sm:gap-1 sm:flex-col">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-signal-error/20 border border-signal-error flex items-center justify-center shrink-0">
                  <Users size={14} className="sm:w-4 sm:h-4 text-signal-error" />
                </div>
                <span className="text-label text-ink-tertiary">Validators</span>
              </div>
              
              <ArrowDown size={14} className="text-ink-tertiary sm:hidden" />
              <ArrowRight size={14} className="text-ink-tertiary hidden sm:block shrink-0" />
              
              <div className="flex items-center gap-2 sm:gap-1 sm:flex-col">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-signal-warning/20 border border-signal-warning flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-mono text-signal-warning">w</span>
                </div>
                <span className="text-label text-ink-tertiary">Wrapped</span>
              </div>
            </div>
            
            <p className="text-label text-ink-tertiary leading-relaxed">
              Your USDC gets locked → third-party validates → you receive wrapped token (IOU)
            </p>
          </div>

          {/* CCTP */}
          <div className="p-3 sm:p-4 border border-signal-success/30 bg-signal-success/5 space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-signal-success shrink-0" />
              <span className="text-label uppercase tracking-wider text-signal-success">CCTP (Circle)</span>
            </div>
            
            {/* Mobile: Vertical flow, Desktop: Horizontal flow */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-1 text-body">
              <div className="flex items-center gap-2 sm:gap-1 sm:flex-col">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-surface-subtle border border-border-element flex items-center justify-center shrink-0">
                  <Coins size={14} className="sm:w-4 sm:h-4 text-ink-secondary" />
                </div>
                <span className="text-label text-ink-tertiary">Your USDC</span>
              </div>
              
              <ArrowDown size={14} className="text-ink-tertiary sm:hidden" />
              <ArrowRight size={14} className="text-ink-tertiary hidden sm:block shrink-0" />
              
              <div className="flex items-center gap-2 sm:gap-1 sm:flex-col">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-signal-error/20 border border-signal-error flex items-center justify-center shrink-0">
                  <Flame size={14} className="sm:w-4 sm:h-4 text-signal-error" />
                </div>
                <span className="text-label text-ink-tertiary">Burned</span>
              </div>
              
              <ArrowDown size={14} className="text-ink-tertiary sm:hidden" />
              <ArrowRight size={14} className="text-ink-tertiary hidden sm:block shrink-0" />
              
              <div className="flex items-center gap-2 sm:gap-1 sm:flex-col">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent-subtle border border-accent-main flex items-center justify-center shrink-0">
                  <Building2 size={14} className="sm:w-4 sm:h-4 text-accent-main" />
                </div>
                <span className="text-label text-ink-tertiary">Circle</span>
              </div>
              
              <ArrowDown size={14} className="text-ink-tertiary sm:hidden" />
              <ArrowRight size={14} className="text-ink-tertiary hidden sm:block shrink-0" />
              
              <div className="flex items-center gap-2 sm:gap-1 sm:flex-col">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-signal-success/20 border border-signal-success flex items-center justify-center shrink-0">
                  <Coins size={14} className="sm:w-4 sm:h-4 text-signal-success" />
                </div>
                <span className="text-label text-ink-tertiary">Native</span>
              </div>
            </div>
            
            <p className="text-label text-ink-tertiary leading-relaxed">
              Circle burns your USDC → Circle attests → Circle mints native USDC
            </p>
          </div>
        </div>

        {/* Comparison - Cards on mobile, Table on desktop */}
        {/* Mobile: Stacked comparison cards */}
        <div className="sm:hidden space-y-2">
          <ComparisonRow 
            label="Token" 
            traditional={<span className="text-signal-warning">Wrapped</span>}
            cctp={<span className="text-signal-success flex items-center gap-1"><CheckCircle2 size={12} /> Native</span>}
          />
          <ComparisonRow 
            label="Trust" 
            traditional={<span className="text-ink-tertiary">Bridge + LPs</span>}
            cctp={<span className="text-ink-tertiary">Circle only</span>}
          />
          <ComparisonRow 
            label="Liquidity" 
            traditional={<span className="text-signal-error flex items-center gap-1"><XCircle size={12} /> Required</span>}
            cctp={<span className="text-signal-success flex items-center gap-1"><CheckCircle2 size={12} /> None</span>}
          />
          <ComparisonRow 
            label="Slippage" 
            traditional={<span className="text-signal-error">Variable</span>}
            cctp={<span className="text-signal-success">0%</span>}
          />
          <ComparisonRow 
            label="Pool risk" 
            traditional={<span className="text-signal-warning flex items-center gap-1"><AlertTriangle size={12} /> Yes</span>}
            cctp={<span className="text-signal-success flex items-center gap-1"><CheckCircle2 size={12} /> None</span>}
          />
        </div>
        
        {/* Desktop: Traditional table */}
        <div className="hidden sm:block border border-border-element overflow-hidden">
          <table className="w-full text-body">
            <thead>
              <tr className="bg-surface-subtle">
                <th className="text-left px-4 py-3 text-label uppercase tracking-wider text-ink-tertiary font-normal">Feature</th>
                <th className="text-center px-4 py-3 text-label uppercase tracking-wider text-signal-error font-normal">Traditional</th>
                <th className="text-center px-4 py-3 text-label uppercase tracking-wider text-signal-success font-normal">CCTP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-element">
              <tr>
                <td className="px-4 py-3 text-ink-secondary">Token received</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-signal-warning/10 text-signal-warning text-label">
                    Wrapped (IOU)
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-signal-success/10 text-signal-success text-label">
                    <CheckCircle2 size={12} /> Native USDC
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-ink-secondary">Trust model</td>
                <td className="px-4 py-3 text-center text-ink-tertiary text-label">Bridge + validators + LPs</td>
                <td className="px-4 py-3 text-center text-ink-tertiary text-label">Circle only</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-ink-secondary">Liquidity needed</td>
                <td className="px-4 py-3 text-center">
                  <XCircle size={14} className="inline text-signal-error" />
                  <span className="ml-1 text-label text-ink-tertiary">Yes</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <CheckCircle2 size={14} className="inline text-signal-success" />
                  <span className="ml-1 text-label text-ink-tertiary">None</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-ink-secondary">Slippage</td>
                <td className="px-4 py-3 text-center text-signal-error text-label">Variable</td>
                <td className="px-4 py-3 text-center text-signal-success text-label">0% (1:1)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-ink-secondary">Pool depletion</td>
                <td className="px-4 py-3 text-center">
                  <AlertTriangle size={14} className="inline text-signal-warning" />
                  <span className="ml-1 text-label text-ink-tertiary">Risk</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <CheckCircle2 size={14} className="inline text-signal-success" />
                  <span className="ml-1 text-label text-ink-tertiary">None</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Security Stats - 1 col on mobile, 3 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          <div className="p-3 sm:p-4 bg-signal-error/5 border border-signal-error/20 flex sm:flex-col items-center sm:items-center justify-between sm:justify-start sm:text-center gap-2">
            <div className="flex sm:flex-col items-center gap-2 sm:gap-0">
              <div className="text-xl sm:text-2xl font-mono text-signal-error">$2B+</div>
              <div className="text-label text-ink-tertiary sm:mt-1">Stolen from bridges</div>
            </div>
            <div className="text-[10px] text-ink-tertiary">2021-2024</div>
          </div>
          <div className="p-3 sm:p-4 bg-signal-success/5 border border-signal-success/20 flex sm:flex-col items-center sm:items-center justify-between sm:justify-start sm:text-center gap-2">
            <div className="flex sm:flex-col items-center gap-2 sm:gap-0">
              <div className="text-xl sm:text-2xl font-mono text-signal-success">$0</div>
              <div className="text-label text-ink-tertiary sm:mt-1">CCTP exploits</div>
            </div>
            <div className="text-[10px] text-ink-tertiary">Since launch</div>
          </div>
          <div className="p-3 sm:p-4 bg-accent-subtle border border-accent-main/20 flex sm:flex-col items-center sm:items-center justify-between sm:justify-start sm:text-center gap-2">
            <div className="flex sm:flex-col items-center gap-2 sm:gap-0">
              <div className="text-xl sm:text-2xl font-mono text-accent-main">1:1</div>
              <div className="text-label text-ink-tertiary sm:mt-1">Always native</div>
            </div>
            <div className="text-[10px] text-ink-tertiary">No wrapped tokens</div>
          </div>
        </div>

        {/* Key Insight */}
        <div className="p-3 sm:p-4 bg-accent-subtle/50 border-l-4 border-accent-main">
          <p className="text-body text-ink-secondary leading-relaxed">
            <strong className="text-ink-primary">Key insight:</strong> You already trust Circle when you hold USDC. 
            CCTP just removes the middlemen.
          </p>
        </div>

      </div>
    </div>
  )
}
