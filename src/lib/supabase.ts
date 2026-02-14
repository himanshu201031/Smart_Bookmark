import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Bookmark = {
    id: string
    user_id: string
    title: string
    url: string
    category: string
    description?: string
    is_favorite: boolean
    favicon_url?: string
    created_at: string
}
