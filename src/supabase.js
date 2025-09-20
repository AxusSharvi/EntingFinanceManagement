import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://bncuszeftxmmhfuzpojp.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJuY3VzemVmdHhtbWhmdXpwb2pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM0NDExOCwiZXhwIjoyMDczOTIwMTE4fQ.MogFiZBXfB0FFv13GcBiAEJ76T9S7q-4PU3K_vmobM4"  // get from Supabase dashboard
export const supabase = createClient(supabaseUrl, supabaseKey)
