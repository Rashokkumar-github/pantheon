# Supabase Setup Instructions

## ✅ What's Already Done

1. ✅ Supabase project created: **Pantheon**
2. ✅ Project URL: `https://vlmixrndwmklqcpwprfk.supabase.co`
3. ✅ Supabase client library installed (`@supabase/supabase-js`)
4. ✅ Database connection utilities created in `src/lib/db/`
5. ✅ Test API route created at `/api/test-db`

## 🔧 Next Steps: Configure Environment Variables

### 1. Get Your Supabase API Keys

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your **Pantheon** project
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** (already in template)
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

### 2. Update Your `.env.local` File

Open `.env.local` and add your keys:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vlmixrndwmklqcpwprfk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=paste-your-service-role-key-here
```

### 3. Test the Connection

After adding your keys, test the connection:

```bash
# Start the dev server
npm run dev

# In another terminal, test the API route
curl http://localhost:3000/api/test-db
```

Or visit `http://localhost:3000/api/test-db` in your browser.

## 📁 Project Structure

```
src/lib/db/
├── supabase.ts          # Supabase client configuration
├── index.ts            # Exports
└── test-connection.ts  # Connection test utility
```

## 🔑 Using Supabase in Your Code

### In Client Components

```typescript
import { supabase } from '@/lib/db'

const { data, error } = await supabase
  .from('your_table')
  .select('*')
```

### In API Routes / Server Components

```typescript
import { supabase, createServerClient } from '@/lib/db'

// Use regular client (respects RLS)
const { data } = await supabase.from('table').select('*')

// Use server client (bypasses RLS - admin only)
const adminClient = createServerClient()
const { data } = await adminClient.from('table').select('*')
```

## 🛡️ Security Notes

- **Anon Key**: Safe to expose in client-side code (protected by RLS)
- **Service Role Key**: ⚠️ **NEVER** expose in client-side code
  - Only use in API routes or server components
  - Bypasses Row Level Security
  - Has full database access

## ✅ Verification Checklist

- [ ] `.env.local` file exists with Supabase keys
- [ ] `npm run dev` starts without errors
- [ ] `/api/test-db` returns success response
- [ ] Can query Supabase from your code

## 🐛 Troubleshooting

**Error: Missing env.NEXT_PUBLIC_SUPABASE_URL**
- Make sure `.env.local` exists in the project root
- Restart your dev server after adding environment variables

**Connection errors**
- Verify your keys are correct in Supabase Dashboard
- Check that your Supabase project is active
- Ensure you're using the correct project URL

## 📚 Next Steps

Once the connection is working:
1. Design your database schema (Phase 2.2)
2. Create migrations using Supabase MCP
3. Set up Row Level Security (RLS) policies
4. Start building features!

