import { createClient } from '@/lib/db/supabase-server'
import { redirect } from 'next/navigation'
import SignInForm from './sign-in-form'

export default async function SignInPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect if already signed in
  if (user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8">
        <div>
          <h1 className="text-2xl font-bold">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}

