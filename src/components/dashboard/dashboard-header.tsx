import { createClient } from '@/lib/db/supabase-server'
import { UserMenu } from './user-menu'

interface DashboardHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export async function DashboardHeader({
  title,
  description,
  children,
}: DashboardHeaderProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm lg:flex">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {children}
        <UserMenu email={user?.email} />
      </div>
    </header>
  )
}

