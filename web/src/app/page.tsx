import Link from "next/link";
import NewsFeed from "@/components/NewsFeed";

export const revalidate = 60; // Home mais fresquinha

export default async function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* HERO */}
      <section className="rounded-3xl border p-8 bg-gradient-to-br from-amber-50 to-orange-50">
        <h1 className="text-3xl sm:text-4xl font-extrabold">
          <span className="text-neutral-900">Tibia</span>
          <span className="text-amber-600">Pulse</span>
        </h1>
        <p className="mt-2 text-neutral-700">
          GuildStats reimaginado — mundos ao vivo, busca de personagens e ferramentas úteis para jogadores de Tibia.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/worlds" className="rounded-lg bg-amber-600 text-white px-4 py-2 hover:bg-amber-700">
            Ver Worlds agora
          </Link>
          <Link href="/character" className="rounded-lg border px-4 py-2 hover:bg-amber-50">
            Buscar personagem
          </Link>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="grid md:grid-cols-3 gap-5">
        <Link href="/worlds" className="rounded-2xl border p-5 bg-white hover:bg-amber-50/40 transition">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🌍</span>
            <h3 className="text-lg font-semibold">Worlds (online)</h3>
          </div>
          <p className="text-sm text-neutral-700">
            Acompanhe quantos jogadores estão online por mundo, em tempo quase real.
          </p>
          <span className="mt-3 inline-block text-amber-700 text-sm">Acessar →</span>
        </Link>

        <Link href="/character" className="rounded-2xl border p-5 bg-white hover:bg-amber-50/40 transition">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🧙‍♂️</span>
            <h3 className="text-lg font-semibold">Buscar personagem</h3>
          </div>
          <p className="text-sm text-neutral-700">
            Consulte level, vocation, world, guild e mais (via TibiaData v4).
          </p>
          <span className="mt-3 inline-block text-amber-700 text-sm">Acessar →</span>
        </Link>

        <Link href="/account" className="rounded-2xl border p-5 bg-white hover:bg-amber-50/40 transition">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⭐</span>
            <h3 className="text-lg font-semibold">Minha conta</h3>
          </div>
          <p className="text-sm text-neutral-700">
            Acesse favoritos, preferências e histórico.
          </p>
          <span className="mt-3 inline-block text-amber-700 text-sm">Acessar →</span>
        </Link>
      </section>

      {/* NEWS */}
      <NewsFeed />
    </main>
  );
}
