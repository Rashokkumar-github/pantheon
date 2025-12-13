import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  linkToHome?: boolean
}

export function Logo({ className, size = 'md', linkToHome = true }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }

  const logoContent = (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Logo mark - abstract "P" shape */}
      <div className={cn(
        'flex items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold',
        size === 'sm' && 'h-7 w-7 text-sm',
        size === 'md' && 'h-8 w-8 text-base',
        size === 'lg' && 'h-10 w-10 text-lg',
      )}>
        P
      </div>
      <span className={cn(
        'font-semibold tracking-tight text-foreground',
        sizeClasses[size]
      )}>
        Pantheon
      </span>
    </div>
  )

  if (linkToHome) {
    return (
      <Link href="/" className="transition-opacity hover:opacity-80">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}

