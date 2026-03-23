import { createClient } from '@supabase/supabase-js'

// ============================================================
// PASTE YOUR SUPABASE CREDENTIALS BELOW
// Get them free at supabase.com → your project → Settings → API
// ============================================================
const SUPABASE_URL = 'https://qmmtjsoykqqajzjndfxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtbXRqc295a3FxYWp6am5kZnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyMjUxMTYsImV4cCI6MjA4OTgwMTExNn0.oRCYWTQnFJlGE01F8pXFJFQw9uVvd31itr9jJJ8Wwvg'
// ============================================================

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
