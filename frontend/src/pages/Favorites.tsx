import Container from '@/components/Container'
import BazaarAuctionCard from '@/features/bazaar/AuctionCard'
import type { Auction } from '@/features/bazaar/api'
import { useFavoriteAuctions, type FavoriteAuction } from '@/features/favorites/useFavoriteAuctions'

export default function Favorites() {
  const { favorites, loading, error, removeFavorite, updatingKey } = useFavoriteAuctions()

  const renderContent = () => {
    if (loading) {
      return <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-6">Carregando favoritos…</div>
    }

    if (error) {
      return (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-6 text-red-200">
          {error}
        </div>
      )
    }

    if (!favorites.length) {
      return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-6 text-zinc-400">
          Você ainda não salvou nenhum personagem. Volte ao bazar e marque seus favoritos.
        </div>
      )
    }

    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {favorites.map((fav) => {
          const auction = snapshotToAuction(fav)
          return (
            <BazaarAuctionCard
              key={fav.id}
              {...auction}
              isFavorite
              disableFavorite={updatingKey === fav.key}
              onFavoriteToggle={() => removeFavorite(fav)}
            />
          )
        })}
      </div>
    )
  }

  return (
    <Container>
      <div className="mb-6 space-y-1">
        <p className="text-sm uppercase tracking-wide text-indigo-300">Meus Favoritos</p>
        <h1 className="text-3xl font-semibold text-white">Personagens salvos</h1>
        <p className="text-white/70">Tudo que você marcou no bazar fica salvo aqui para comparar depois.</p>
      </div>

      {renderContent()}
    </Container>
  )
}

function snapshotToAuction(fav: FavoriteAuction): Auction {
  const snapshot = fav.snapshot ?? null
  return {
    id: snapshot?.id ?? null,
    name: snapshot?.name ?? fav.key,
    level: snapshot?.level ?? 0,
    vocation: snapshot?.vocation ?? '—',
    world: snapshot?.world ?? '—',
    currentBid: snapshot?.currentBid ?? 0,
    minimumBid: snapshot?.minimumBid ?? snapshot?.currentBid ?? 0,
    hasBid: snapshot?.hasBid ?? false,
    endDate: snapshot?.endDate ?? null,
    url: snapshot?.url ?? null,
    outfitUrl: snapshot?.outfitUrl ?? null,
    pvpType: snapshot?.pvpType ?? null,
    charmPoints: snapshot?.charmPoints ?? null,
    charmInfo: snapshot?.charmInfo ?? (snapshot?.charmPoints != null
      ? { total: snapshot.charmPoints, expansion: Boolean(snapshot?.charmInfo?.expansion) }
      : null),
    bossPoints: snapshot?.bossPoints ?? null,
    skills: snapshot?.skills ?? null,
    items: snapshot?.items ?? null,
    storeItems: snapshot?.storeItems ?? null,
    imbuements: snapshot?.imbuements ?? null,
    quests: snapshot?.quests ?? null,
    hirelings: snapshot?.hirelings ?? null,
    gems: snapshot?.gems ?? null,
    greaterGems: snapshot?.greaterGems ?? null,
    preySlot: snapshot?.preySlot ?? false,
    huntingSlot: snapshot?.huntingSlot ?? false,
    battleye: snapshot?.battleye ?? null,
    serverLocation: snapshot?.serverLocation ?? null,
    transfer: snapshot?.transfer ?? false,
  }
}
