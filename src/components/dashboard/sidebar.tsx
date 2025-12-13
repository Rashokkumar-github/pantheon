'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import {
  Briefcase,
  FileText,
  ImageIcon,
  LayoutDashboard,
  ListChecks,
  Settings,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Job Applications',
    href: '/dashboard/jobs',
    icon: Briefcase,
  },
  {
    name: 'Cover Letters',
    href: '/dashboard/cover-letters',
    icon: FileText,
  },
  {
    name: 'Resume Bullets',
    href: '/dashboard/resume-bullets',
    icon: ListChecks,
  },
  {
    name: 'Photo Enhancement',
    href: '/dashboard/photos',
    icon: ImageIcon,
  },
]

const bottomNavigation = [
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  collapsed?: boolean
}

export function Sidebar({ collapsed = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className={cn(
      'flex h-screen flex-col border-r border-sidebar-border bg-sidebar',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-sidebar-border',
        collapsed ? 'justify-center px-2' : 'px-6'
      )}>
        {collapsed ? (
          <Link href="/dashboard" className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            P
          </Link>
        ) : (
          <Logo size="md" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 lg:px-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive
                    ? 'text-sidebar-primary'
                    : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
                )}
              />
              {!collapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto px-2 pb-4 lg:px-3">
        <Separator className="mb-4" />
        
        {bottomNavigation.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                collapsed && 'justify-center px-2',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-colors',
                  isActive
                    ? 'text-sidebar-primary'
                    : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground/70'
                )}
              />
              {!collapsed && item.name}
            </Link>
          )
        })}

        <Button
          variant="ghost"
          title={collapsed ? 'Sign Out' : undefined}
          className={cn(
            'mt-2 w-full gap-3 px-3 text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
            collapsed ? 'justify-center px-2' : 'justify-start'
          )}
          asChild
        >
          <Link href="/auth/sign-out">
            <LogOut className="h-5 w-5 text-sidebar-foreground/50" />
            {!collapsed && 'Sign Out'}
          </Link>
        </Button>
      </div>
    </aside>
  )
}
