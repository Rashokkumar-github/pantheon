import { createClient } from '@/lib/db/supabase-server'
import { redirect } from 'next/navigation'
import SignUpForm from './sign-up-form'

export default async function SignUpPage() {
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
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to get started
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}

