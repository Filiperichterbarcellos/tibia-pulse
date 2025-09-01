import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabase } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  const { supabase, res } = createRouteSupabase(req)
  await supabase.auth.signOut()
  const origin = new URL(req.url).origin
  return NextResponse.redirect(new URL('/', origin), { headers: res.headers })
}
