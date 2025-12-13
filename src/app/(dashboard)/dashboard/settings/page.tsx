import { createClient } from '@/lib/db/supabase-server'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Settings"
        description="Manage your account and preferences."
      />

      <div className="flex-1 space-y-6 p-6 lg:p-8">
        {/* Profile Section */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold">Profile</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account information
          </p>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="max-w-md"
              />
              <p className="text-xs text-muted-foreground">
                Your email address is managed through your authentication provider.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="created">Member since</Label>
              <Input
                id="created"
                type="text"
                value={
                  user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Unknown'
                }
                disabled
                className="max-w-md"
              />
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50 p-6">
          <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Irreversible and destructive actions
          </p>

          <Separator className="my-6" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Sign out of your account</p>
              <p className="text-sm text-muted-foreground">
                You will need to sign in again to access your data.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/auth/sign-out">Sign Out</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

