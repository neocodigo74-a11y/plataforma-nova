import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Isso ajudará você a ver o erro nos logs do build sem travar tudo imediatamente
  console.warn("Atenção: Variáveis de ambiente do Supabase não encontradas.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);