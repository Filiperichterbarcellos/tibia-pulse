// web/src/app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="rounded-2xl border p-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          TibiaPulse
        </h1>
        <p className="mt-2 text-base md:text-lg text-gray-600">
          GuildStats reimaginado — mundos ao vivo, busca de personagens e
          ferramentas úteis para jogadores de Tibia.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/worlds"
            className="rounded-xl bg-black text-white px-4 py-2 font-medium"
          >
            Ver Worlds agora
          </Link>
          <Link
            href="/character"
            className="rounded-xl border px-4 py-2 font-medium"
          >
            Buscar personagem
          </Link>
          <Link
            href="/login"
            className="rounded-xl border px-4 py-2 font-medium"
          >
            Entrar / Criar conta
          </Link>
        </div>
      </section>

      {/* Atalhos principais */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <Link href="/worlds" className="rounded-2xl border p-5 hover:bg-gray-50">
          <div className="text-xl font-semibold">Worlds (online)</div>
          <p className="text-sm text-gray-600 mt-1">
            Acompanhe quantos jogadores estão online por mundo, em tempo quase real.
          </p>
        </Link>

        <Link href="/character" className="rounded-2xl border p-5 hover:bg-gray-50">
          <div className="text-xl font-semibold">Buscar personagem</div>
          <p className="text-sm text-gray-600 mt-1">
            Consulte level, vocation, world, guild e mais (via TibiaData v4).
          </p>
        </Link>

        <Link href="/account" className="rounded-2xl border p-5 hover:bg-gray-50">
          <div className="text-xl font-semibold">Minha conta</div>
          <p className="text-sm text-gray-600 mt-1">
            Acesse seus favoritos (em breve), preferências e histórico.
          </p>
        </Link>
      </section>

      {/* Roadmap do TCC / Em breve */}
      <section className="rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Próximas entregas do TCC</h2>
        <ul className="list-disc ml-6 mt-3 space-y-1 text-sm text-gray-700">
          <li>Detalhe do mundo com gráfico de histórico (7 dias).</li>
          <li>Calculadoras: XP/h, imbuements, loot split, market.</li>
          <li>Respawn de bosses: janelas de spawn e alertas.</li>
          <li>Favoritos/Watchlist (personagens, mundos, bosses).</li>
          <li>Melhorias de UX/UI e tema escuro.</li>
        </ul>
      </section>
    </main>
  );
}
