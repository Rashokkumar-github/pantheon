# Supabase MCP Server Setup Guide

## What is an MCP Server?

MCP (Model Context Protocol) is a protocol that allows AI assistants (like Cursor) to connect to external data sources and tools. A Supabase MCP server enables Cursor to directly interact with your Supabase database, making it easier to query data, manage schemas, and work with your database during development.

## How to Set Up Supabase MCP Server in Cursor

### Option 1: Using Official Supabase MCP Server (Recommended)

1. **Install the Supabase MCP Server**
   - The Supabase MCP server is typically available as an npm package or can be run as a standalone server
   - Check the [Supabase MCP repository](https://github.com/supabase/mcp-server-supabase) for the latest installation instructions

2. **Configure in Cursor Settings**
   - Open Cursor Settings (Cmd/Ctrl + ,)
   - Navigate to "Features" → "Model Context Protocol" or "MCP Servers"
   - Add a new MCP server configuration

3. **Configuration Format**
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "npx",
         "args": [
           "-y",
           "@supabase/mcp-server-supabase"
         ],
         "env": {
           "SUPABASE_URL": "your-supabase-project-url",
           "SUPABASE_SERVICE_ROLE_KEY": "your-service-role-key"
         }
       }
     }
   }
   ```

### Option 2: Manual Setup

1. **Install the MCP Server Package**
   ```bash
   npm install -g @supabase/mcp-server-supabase
   ```

2. **Create Cursor MCP Configuration**
   - Cursor's MCP configuration is typically stored in:
     - **macOS**: `~/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`
     - **Windows**: `%APPDATA%\Cursor\User\globalStorage\rooveterinaryinc.roo-cline\settings\cline_mcp_settings.json`
     - **Linux**: `~/.config/Cursor/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json`

3. **Add Configuration**
   Add the Supabase MCP server configuration to the settings file.

### Option 3: Using Environment Variables

You can also configure the MCP server to read from your `.env.local` file:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase"
      ],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_ROLE_KEY": "${SUPABASE_SERVICE_ROLE_KEY}"
      }
    }
  }
}
```

## Required Environment Variables

Make sure you have these in your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For MCP server
```

**Important Security Note:**
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security (RLS)
- Only use it in secure environments (local development, trusted servers)
- Never commit this key to Git
- The MCP server needs the service role key to perform administrative operations

## Finding Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (for MCP server)

## What the MCP Server Enables

Once configured, the Supabase MCP server allows Cursor to:
- Query your database directly
- View table schemas
- Generate SQL queries
- Understand your database structure
- Help with database migrations
- Assist with RLS policies

## Troubleshooting

1. **MCP Server Not Found**
   - Ensure the package is installed: `npm list -g @supabase/mcp-server-supabase`
   - Try using `npx` with the `-y` flag for automatic installation

2. **Connection Issues**
   - Verify your Supabase URL and keys are correct
   - Check that your Supabase project is active
   - Ensure the service role key has proper permissions

3. **Cursor Not Recognizing MCP Server**
   - Restart Cursor after adding the configuration
   - Check Cursor's MCP server logs for errors
   - Verify the configuration JSON syntax is correct

## Alternative: Community MCP Servers

If the official Supabase MCP server isn't available, you can:
1. Search for community-maintained Supabase MCP servers
2. Create a custom MCP server using the [MCP SDK](https://github.com/modelcontextprotocol/servers)
3. Use Supabase's REST API or PostgREST directly in your code

## Next Steps

After setting up the MCP server:
1. Test the connection by asking Cursor to query your database
2. Use it to help design your database schema (Phase 2.2 in your plan)
3. Leverage it for generating migrations and RLS policies

## Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [Supabase MCP Server (if available)](https://github.com/supabase/mcp-server-supabase)
- [Supabase Documentation](https://supabase.com/docs)
- [Cursor MCP Documentation](https://cursor.sh/docs/mcp)

