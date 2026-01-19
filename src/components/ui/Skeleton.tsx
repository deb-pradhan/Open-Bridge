import { clsx } from 'clsx'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-surface-subtle rounded-none',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  )
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-card border border-border-grid p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton width={120} height={20} />
        <Skeleton width={20} height={20} />
      </div>
      <SkeletonText lines={3} />
      <Skeleton className="w-full h-12" />
    </div>
  )
}
