import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zgbaiotmuxmtthobzbol.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnYmFpb3RtdXhtdHRob2J6Ym9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNjQ1MTYsImV4cCI6MjEwNjg0MDUxNn0.bR_DUms4l686U4vY8tR-0bNb0BzGmq3AM4S1D30vvjE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)