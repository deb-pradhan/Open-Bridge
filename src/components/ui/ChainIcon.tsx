import { useState } from 'react'
import { chainMeta } from '@/lib/chains'

interface ChainIconProps {
  chainId: number
  size?: number
  className?: string
}

export function ChainIcon({ chainId, size = 20, className = '' }: ChainIconProps) {
  const [error, setError] = useState(false)
  const meta = chainMeta[chainId]
  
  if (!meta?.icon || error) {
    return (
      <div
        className={`rounded-full flex items-center justify-center text-white font-medium shrink-0 ${className}`}
        style={{ 
          width: size, 
          height: size, 
          backgroundColor: meta?.color || '#627EEA',
          fontSize: size * 0.4,
        }}
      >
        {meta?.shortName?.slice(0, 2) || '??'}
      </div>
    )
  }

  return (
    <img
      src={meta.icon}
      alt={meta.name}
      width={size}
      height={size}
      className={`rounded-full shrink-0 object-contain ${className}`}
      onError={() => setError(true)}
      style={{ width: size, height: size }}
    />
  )
}
