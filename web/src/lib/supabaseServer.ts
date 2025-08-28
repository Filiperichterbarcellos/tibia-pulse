// src/lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js';

/**
 * IMPORTANTE:
 * - NUNCA importe supabaseAdmin em componentes "use client".
 * - Use supabaseAdmin SOMENTE em rotas / server actions / edge / RSC.
 */

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

// Singletons para evitar recriação em hot-reload
let _admin: ReturnType<typeof createClient> | null = null;
let _anon: ReturnType<typeof createClient> | null = null;

export function supabaseAdmin() {
  if (_admin) return _admin;
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = requireEnv('SUPABASE_SERVICE_ROLE_KEY'); // server-only
  _admin = createClient(url, key, { auth: { persistSession: false } });
  return _admin;
}

export function supabaseAnon() {
  if (_anon) return _anon;
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'); // leitura
  _anon = createClient(url, key, { auth: { persistSession: false } });
  return _anon;
}
