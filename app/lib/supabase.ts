import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(
  "https://yzelotspbdhimphfjzti.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZWxvdHNwYmRoaW1waGZqenRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MzQ4NDcsImV4cCI6MjA3MTQxMDg0N30.8-7D8ZNVC5afqmr7n3RMegNqouDTYl5-djBwsdavPmc"
);

// For server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)