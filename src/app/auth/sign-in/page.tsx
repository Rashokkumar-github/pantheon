import { createClient } from '@/lib/db/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignInForm from './sign-in-form'
import { Logo } from '@/components/logo'

export default async function SignInPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Redirect if already signed in
    if (user) {
      redirect('/dashboard')
    }
  } catch {
    // Supabase not configured, continue to show sign-in form
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOGMxMC45NDEgMCAxOC04LjA1OSAxOC0xOHMtOC4wNTktMTgtMTgtMTh6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
        
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo size="lg" linkToHome className="[&_span]:text-white [&_div]:bg-white/20 [&_div]:text-white" />
          
          <div className="space-y-6">
            <blockquote className="space-y-2">
              <p className="text-lg text-white/90">
                &ldquo;Pantheon has completely transformed how I manage my job search.
                The AI-generated cover letters save me hours every week.&rdquo;
              </p>
              <footer className="text-sm text-white/70">
                — Sarah K., Software Engineer
              </footer>
            </blockquote>
          </div>
          
          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} Pantheon. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex w-full items-center justify-center px-4 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="flex justify-center lg:hidden">
            <Logo size="lg" />
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <SignInForm />

          <p className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
