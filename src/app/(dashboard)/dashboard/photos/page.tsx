import Link from 'next/link'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ImageIcon, Sparkles, Wand2, ArrowRight, Camera } from 'lucide-react'
import { PhotoList } from '@/components/photos/photo-list'
import { createClient } from '@/lib/db/supabase-server'

export default async function PhotosPage() {
  const supabase = await createClient()
  
  // Get photo count for conditional rendering
  const { count } = await supabase
    .from('photos')
    .select('*', { count: 'exact', head: true })

  const hasPhotos = (count ?? 0) > 0

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Photo Studio"
        description="Create professional headshots with AI enhancement and generation."
      />

      <div className="flex-1 p-6 lg:p-8">
        {/* Action Cards - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Enhance Card */}
          <Card className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-all group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Sparkles className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  Quick
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Enhance Photo
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Improve your existing photo with AI-powered face enhancement, 
                lighting correction, and quality upscaling.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-6">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-blue-500" />
                  Face restoration & enhancement
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-blue-500" />
                  Background enhancement
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-blue-500" />
                  Quality upscaling (2x)
                </li>
              </ul>
              <Button asChild className="w-full gap-2 group-hover:bg-primary/90">
                <Link href="/dashboard/photos/new">
                  <Sparkles className="h-4 w-4" />
                  Enhance a Photo
                  <ArrowRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Generate Card */}
          <Card className="relative overflow-hidden border-border/50 hover:border-purple-500/30 transition-all group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-bl-full" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Wand2 className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                  AI Powered
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Generate Headshot
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create a completely new professional headshot with custom 
                background, professional attire, and studio lighting.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 mb-6">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-purple-500" />
                  Professional backgrounds
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-purple-500" />
                  Business attire options
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-purple-500" />
                  Multiple style presets
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full gap-2 border-purple-500/30 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400">
                <Link href="/dashboard/photos/generate">
                  <Wand2 className="h-4 w-4" />
                  Generate Headshot
                  <ArrowRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>

        {/* Photo Gallery or Empty State */}
        {hasPhotos ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Your Photos</h2>
              <span className="text-sm text-muted-foreground">{count} photo{count !== 1 ? 's' : ''}</span>
            </div>
            <PhotoList />
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
            <div className="mb-6 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/10 blur-2xl scale-150" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 ring-1 ring-primary/20">
                <Camera className="h-10 w-10 text-primary/60" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-foreground">
              Your photo gallery is empty
            </h3>
            <p className="mt-2 max-w-md text-muted-foreground">
              Get started by enhancing an existing photo or generating a brand new 
              professional headshot with AI.
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
