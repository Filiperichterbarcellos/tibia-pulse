import { createServerSupabase } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

async function updateProfile(formData: FormData) {
  "use server"

  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const username = (formData.get('username') as string | null)?.trim() || null
  const avatar_url = (formData.get('avatar_url') as string | null)?.trim() || null

  const { error } = await supabase
    .from('profiles')
    .update({ username, avatar_url })
    .eq('id', user.id)

  if (error) throw error
  revalidatePath('/account')
}

export default async function AccountPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Minha conta</h1>
        <p>Você precisa estar logado para acessar esta página.</p>
      </main>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Minha conta</h1>

      <div className="rounded-xl border bg-white p-4">
        <div className="text-sm text-neutral-500">E-mail</div>
        <div className="font-medium">{user.email}</div>
      </div>

      <form action={updateProfile} className="space-y-4 rounded-xl border bg-white p-4">
        <div>
          <label className="block text-sm text-neutral-600">Username</label>
          <input
            type="text"
            name="username"
            defaultValue={profile?.username ?? ''}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-600">Avatar URL</label>
          <input
            type="text"
            name="avatar_url"
            defaultValue={profile?.avatar_url ?? ''}
            placeholder="https://..."
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
          {profile?.avatar_url ? (
            <div className="mt-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="h-16 w-16 rounded-full border object-cover"
              />
            </div>
          ) : null}
        </div>

        <button className="rounded-lg bg-black px-4 py-2 text-white hover:opacity-90">
          Salvar alterações
        </button>
      </form>
    </main>
  )
}
