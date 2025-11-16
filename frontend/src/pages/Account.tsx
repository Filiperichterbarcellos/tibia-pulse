import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchTrackedCharacter, updateProfile } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/useAuthStore'
import type { CharacterSummary } from '@/features/characters/api'
import { useFavorites, type FavoriteRecord } from '@/features/favorites/useFavorites'
import { fmtNumber, fmtDateTime } from '@/lib/format'

type BossFavoriteSnapshot = {
  name?: string
  sprite?: string | null
  respawn?: string | null
}

type BossFavorite = FavoriteRecord<BossFavoriteSnapshot>

export default function Account() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const [form, setForm] = useState({ name: user?.name ?? '', mainCharacter: user?.mainCharacter ?? '' })
  const [saving, setSaving] = useState(false)
  const [formMessage, setFormMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const [character, setCharacter] = useState<CharacterSummary | null>(null)
  const [charLoading, setCharLoading] = useState(false)
  const [charError, setCharError] = useState<string | null>(null)

  const {
    favorites: bossFavorites,
    loading: favoritesLoading,
    error: favoritesError,
    removeFavorite,
  } = useFavorites<BossFavoriteSnapshot>('BOSS')
  const [favoriteMessage, setFavoriteMessage] = useState<string | null>(null)

  useEffect(() => {
    setForm({
      name: user?.name ?? '',
      mainCharacter: user?.mainCharacter ?? '',
    })
  }, [user?.name, user?.mainCharacter])

  const refreshTrackedCharacter = useCallback(async () => {
    setCharLoading(true)
    setCharError(null)
    try {
      const { character } = await fetchTrackedCharacter()
      setCharacter(character)
    } catch (err: any) {
      const status = err?.response?.status
      if (status === 400) {
        setCharError('Defina um personagem para visualizar aqui.')
      } else if (status === 404) {
        setCharError('Não encontramos esse personagem agora.')
      } else {
        setCharError('Não foi possível carregar os dados do personagem.')
      }
      setCharacter(null)
    } finally {
      setCharLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.mainCharacter) {
      refreshTrackedCharacter()
    } else {
      setCharacter(null)
      setCharError(null)
      setCharLoading(false)
    }
  }, [user?.mainCharacter, refreshTrackedCharacter])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    setFormMessage(null)

    const payload: { name?: string; mainCharacter?: string | null } = {}
    if (form.name !== (user?.name ?? '')) payload.name = form.name
    if (form.mainCharacter !== (user?.mainCharacter ?? '')) {
      payload.mainCharacter =
        form.mainCharacter.trim().length > 0 ? form.mainCharacter.trim() : null
    }

    if (!Object.keys(payload).length) {
      setFormMessage('Nada para atualizar.')
      setSaving(false)
      return
    }

    try {
      const { user: updated } = await updateProfile(payload)
      setUser(updated ?? null)
      setFormMessage('Preferências salvas!')
      if ((updated?.mainCharacter ?? '') !== (user?.mainCharacter ?? '')) {
        if (updated?.mainCharacter) refreshTrackedCharacter()
        else setCharacter(null)
      }
    } catch (err: any) {
      setFormError(err?.response?.data?.error ?? 'Não foi possível salvar agora.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemoveFavorite(favorite: BossFavorite) {
    try {
      await removeFavorite(favorite)
      setFavoriteMessage('Boss removido dos favoritos.')
    } catch {
      setFavoriteMessage('Não foi possível atualizar os favoritos.')
    }
  }

  useEffect(() => {
    if (!favoriteMessage) return
    const timer = setTimeout(() => setFavoriteMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [favoriteMessage])

  const accountInfo = useMemo(
    () => [
      { label: 'E-mail', value: user?.email },
      {
        label: 'Criada em',
        value: user?.createdAt ? fmtDateTime(user.createdAt) : undefined,
      },
    ],
    [user?.email, user?.createdAt],
  )

  return (
    <div className="retro-layout space-y-6 text-[#1b1f3b]">
      <section className="retro-hero">
        <div>
          <p className="retro-badge">Área do usuário</p>
          <h1>Minha conta</h1>
          <p>Gerencie suas preferências, configure o personagem principal e veja os bosses favoritados.</p>
        </div>
      </section>

      <section className="retro-panel space-y-6">
        <div>
          <p className="filter-label mb-2">Sua conta</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            {accountInfo.map((item) => (
              <AccountDetail key={item.label} label={item.label} value={item.value} />
            ))}
          </dl>
        </div>

        <div>
          <p className="filter-label mb-2">Preferências</p>
          <form onSubmit={handleSave} className="space-y-4">
            <label className="retro-input">
              <span>Nome</span>
              <div className="retro-input__field">
                <input
                  type="text"
                  placeholder="Opcional"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </label>

            <label className="retro-input">
              <span>Personagem principal</span>
              <div className="retro-input__field">
                <input
                  type="text"
                  placeholder="Ex.: Kaamez"
                  value={form.mainCharacter}
                  onChange={(e) => setForm((prev) => ({ ...prev, mainCharacter: e.target.value }))}
                />
              </div>
              <p className="text-xs text-slate-500">
                Mostramos os dados do personagem salvo logo abaixo.
              </p>
            </label>

            {formError && <FormAlert tone="error">{formError}</FormAlert>}
            {formMessage && <FormAlert tone="success">{formMessage}</FormAlert>}

            <button type="submit" className="retro-auth" disabled={saving}>
              {saving ? 'Salvando…' : 'Salvar preferências'}
            </button>
          </form>
        </div>
      </section>

      <section className="retro-panel space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="filter-label mb-1">Meu personagem monitorado</p>
            {user?.mainCharacter ? (
              <p className="text-sm text-slate-500">Atualize sempre que quiser o status do personagem salvo.</p>
            ) : (
              <p className="text-sm text-slate-500">Defina o personagem principal para mostrar os dados aqui.</p>
            )}
          </div>
          <button
            type="button"
            className="retro-auth retro-auth--ghost text-xs"
            onClick={refreshTrackedCharacter}
            disabled={charLoading || !user?.mainCharacter}
          >
            Atualizar dados
          </button>
        </header>

        {!user?.mainCharacter && (
          <p className="text-sm text-slate-500">Nenhum personagem vinculado ainda.</p>
        )}

        {user?.mainCharacter && (
          <>
            {charLoading && <p className="text-sm text-slate-400">Buscando informações…</p>}
            {charError && !charLoading && <FormAlert tone="error">{charError}</FormAlert>}
            {character && !charLoading && (
              <CharacterCard character={character} />
            )}
          </>
        )}
      </section>

      <section className="retro-panel space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="filter-label mb-1">Bosses favoritos</p>
            <p className="text-sm text-slate-500">Lista sincronizada com a página de bosses.</p>
          </div>
          {favoritesLoading && <span className="text-xs text-slate-500">Carregando…</span>}
        </header>

        {favoriteMessage && <FormAlert tone="success">{favoriteMessage}</FormAlert>}
        {favoritesError && <FormAlert tone="error">{favoritesError}</FormAlert>}

        {bossFavorites.length === 0 ? (
          <p className="text-sm text-slate-500">Você ainda não salvou nenhum boss.</p>
        ) : (
          <div className="space-y-3">
            {bossFavorites.map((fav) => (
              <FavoriteBossRow
                key={fav.id}
                favorite={fav as BossFavorite}
                onRemove={() => handleRemoveFavorite(fav as BossFavorite)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function AccountDetail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-white/60">{label}</p>
      <p className="text-sm font-medium text-white">{value ?? '—'}</p>
    </div>
  )
}

function FormAlert({
  children,
  tone,
}: {
  children: string
  tone: 'error' | 'success'
}) {
  const styles =
    tone === 'error'
      ? 'bg-red-100 text-red-900 border border-red-300'
      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
  return (
    <div className={`rounded-xl px-3 py-2 text-sm font-medium ${styles}`}>
      {children}
    </div>
  )
}

function CharacterCard({ character }: { character: CharacterSummary }) {
  const bestDayText = character.bestDayXP
    ? `${fmtNumber(character.bestDayXP.value)} XP em ${formatDateOnly(character.bestDayXP.date)}`
    : '—'
  const timeOnline = character.trackerStats?.timeOnline

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/60">Personagem</p>
          <h3 className="text-2xl font-bold">{character.name}</h3>
          <p className="text-sm text-white/70">
            {character.vocation ?? '—'} • {character.world ?? '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-white/60">Level</p>
          <p className="text-3xl font-bold text-emerald-300">{character.level}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MiniStat label="XP atual" value={fmtNumber(character.currentXP)} />
        <MiniStat label="XP para o próximo nível" value={fmtNumber(character.xpToNextLevel)} />
        <MiniStat label="Média diária" value={fmtNumber(character.averageDailyXP)} />
        <MiniStat label="Melhor dia" value={bestDayText} />
        <MiniStat label="Último login" value={character.lastLogin ? fmtDateTime(character.lastLogin) : '—'} />
        <MiniStat label="Status da conta" value={character.accountStatus ?? '—'} />
      </dl>

      {timeOnline && (
        <div className="mt-4 rounded-2xl border border-white/5 bg-black/20 p-3 text-sm text-white/80">
          <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Tempo online (rastreador)</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <MiniStat label="Último mês" value={timeOnline.lastMonth ?? '—'} />
            <MiniStat label="Mês atual" value={timeOnline.currentMonth ?? '—'} />
            <MiniStat label="Semana atual" value={timeOnline.currentWeek ?? '—'} />
          </div>
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className="text-sm font-semibold text-white">{value ?? '—'}</p>
    </div>
  )
}

function FavoriteBossRow({
  favorite,
  onRemove,
}: {
  favorite: BossFavorite
  onRemove: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="flex flex-1 items-center gap-3">
        {favorite.snapshot?.sprite && (
          <img
            src={favorite.snapshot.sprite}
            alt=""
            width={40}
            height={40}
            className="rounded-full border border-white/20 bg-black/20"
          />
        )}
        <div>
          <p className="font-semibold text-white">{favorite.snapshot?.name ?? favorite.key}</p>
          {favorite.snapshot?.respawn && (
            <p className="text-xs text-white/60">Respawn: {favorite.snapshot.respawn}</p>
          )}
          <p className="text-xs text-white/40">
            Salvo em {fmtDateTime(favorite.createdAt)}
          </p>
        </div>
      </div>
      <button
        type="button"
        className="retro-auth retro-auth--ghost text-xs"
        onClick={onRemove}
      >
        Remover
      </button>
    </div>
  )
}

function formatDateOnly(value?: string | null) {
  if (!value) return '—'
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(date)
  } catch {
    return value ?? '—'
  }
}
