import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero compacto */}
      <section className="mx-auto max-w-6xl px-6 py-14 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Tibia<span className="text-amber-600">Pulse</span>
        </h1>
        <p className="mt-3 text-neutral-600">
          GuildStats reimaginado — acompanhe mundos ao vivo, busque personagens e muito mais.
        </p>
      </section>

      {/* Notícias em destaque (somente notícias na home) */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">Notícias</h2>
          <Link href="/news" className="text-amber-700 hover:underline">ver todas →</Link>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <NewsCard
            title="Server Save: mudanças e ajustes desta semana"
            date="Hoje"
            href="/news"
            excerpt="Resumo rápido das alterações, balanceamentos e correções aplicadas durante o server save."
          />
          <NewsCard
            title="Evento: retorno da Percht Queen"
            date="Ontem"
            href="/news"
            excerpt="Prepare-se para o inverno eterno! Veja como participar e as recompensas disponíveis."
          />
          <NewsCard
            title="Char Bazaar: dicas para iniciantes"
            date="2 dias atrás"
            href="/news"
            excerpt="Como avaliar preço, histórico e evitar ciladas no leilão oficial de personagens."
          />
        </div>
      </section>
    </main>
  );
}

function NewsCard({
  title, date, excerpt, href,
}: { title: string; date: string; excerpt: string; href: string }) {
  return (
    <article className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition">
      <div className="text-xs text-neutral-500">{date}</div>
      <h3 className="mt-1 font-semibold leading-snug">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600 line-clamp-3">{excerpt}</p>
      <Link href={href} className="mt-3 inline-block text-amber-700 font-medium">
        Ler mais →
      </Link>
    </article>
  );
}
