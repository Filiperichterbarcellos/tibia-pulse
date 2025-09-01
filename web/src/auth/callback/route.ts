import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabase } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const { supabase, res } = createRouteSupabase(req)
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') ?? '/account'

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(new URL(next, url.origin), {
    headers: res.headers,
  })
}
