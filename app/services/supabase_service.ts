import env from '#start/env'
import { createClient } from '@supabase/supabase-js'

// For now, we'll get these from the Supabase MCP tools
// TODO: Add SUPABASE_URL and SUPABASE_ANON_KEY to .env file
const supabaseUrl = env.get('SUPABASE_URL', '')
const supabaseAnonKey = env.get('SUPABASE_ANON_KEY', '')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // We'll handle sessions through AdonisJS
  },
})

export default supabase
