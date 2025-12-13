import { redirect } from 'next/navigation'
import { createClient } from '@/lib/db/supabase-server'
import { Sidebar } from '@/components/dashboard/sidebar'
import Link from 'next/link'
import { Briefcase, FileText, ImageIcon, LayoutDashboard, Settings } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to sign-in if not authenticated
  if (!user) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Icon only on tablet, full on desktop, hidden on mobile */}
      <div className="hidden sm:block">
        {/* Collapsed sidebar for sm-lg screens */}
        <div className="block lg:hidden">
          <Sidebar collapsed />
        </div>
        {/* Full sidebar for lg+ screens */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>
      </div>

      {/* Mobile bottom navigation - only on small screens */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background sm:hidden">
        <MobileNavLink href="/dashboard" icon="dashboard" label="Home" />
        <MobileNavLink href="/dashboard/jobs" icon="briefcase" label="Jobs" />
        <MobileNavLink href="/dashboard/cover-letters" icon="file" label="Letters" />
        <MobileNavLink href="/dashboard/photos" icon="image" label="Photos" />
        <MobileNavLink href="/dashboard/settings" icon="settings" label="Settings" />
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 sm:pb-0">
        {children}
      </main>
    </div>
  )
}

function MobileNavLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const icons = {
    dashboard: LayoutDashboard,
    briefcase: Briefcase,
    file: FileText,
    image: ImageIcon,
    settings: Settings,
  }
  const Icon = icons[icon as keyof typeof icons]

  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </Link>
  )
}
