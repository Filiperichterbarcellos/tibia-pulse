// src/lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js'
import { cookies as nextCookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

function requireEnv(name: string) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

/* -------------------------------------------
   Singletons clássicos do projeto (admin/anon)
-------------------------------------------- */
let _admin: ReturnType<typeof createClient> | null = null
let _anon: ReturnType<typeof createClient> | null = null

export function supabaseAdmin() {
  if (_admin) return _admin
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY') // server-only
  _admin = createClient(url, key, { auth: { persistSession: false } })
  return _admin
}

export function supabaseAnon() {
  if (_anon) return _anon
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') // leitura
  _anon = createClient(url, key, { auth: { persistSession: false } })
  return _anon
}

/* ---------------------------------------------------------
   Helper para Server Components (Next 15: cookies é assíncrono)
   Uso:
     const supabase = await createServerSupabase()
     const { data: { user } } = await supabase.auth.getUser()
---------------------------------------------------------- */
export async function createServerSupabase() {
  const cookieStore = await nextCookies()

  const supabase = createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  return supabase
}

/* ---------------------------------------------------------
   Helper para Route Handlers e middleware
   (precisamos ler e TAMBÉM escrever cookies)
   Uso em um route handler:
     export async function GET(req: NextRequest) {
       const { supabase, res } = createRouteSupabase(req)
       // ... sua lógica
       return res
     }
---------------------------------------------------------- */
export function createRouteSupabase(req: NextRequest) {
  // resposta base usada pelo SSR p/ set/remove cookies
  const res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.delete({ name, ...options })
        },
      },
    }
  )

  return { supabase, res }
}
