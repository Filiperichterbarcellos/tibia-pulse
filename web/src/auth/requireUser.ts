// src/auth/requireUser.ts
import { createServerSupabase } from '@/lib/supabaseServer'

export type RequiredUser = {
  id: string
  email: string | null
}

/** Exige usuário autenticado; lança erro se não houver sessão. */
export async function requireUser(): Promise<RequiredUser> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.auth.getUser()
  const user = data?.user

  if (error || !user) {
    throw new Error('UNAUTHORIZED')
  }

  return {
    id: user.id,
    email: user.email ?? null, // <-- normaliza undefined -> null
  }
}

/** Versão opcional: retorna null se não houver usuário (não lança erro). */
export async function getUserOrNull(): Promise<RequiredUser | null> {
  const supabase = await createServerSupabase()
  const { data } = await supabase.auth.getUser()
  const user = data?.user
  if (!user) return null
  return { id: user.id, email: user.email ?? null }
}
