import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations, we'll use the same client for now
// In a real app, you'd want to use the service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey)