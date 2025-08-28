// Server Component (padrão do App Router)
// Tipagem correta de searchParams sem usar `any`.

type SearchParams = { [key: string]: string | string[] | undefined };

export default function ResultPage(
  { searchParams }: { searchParams?: SearchParams }
) {
  // Normaliza `name` vindo da URL (?name=...)
  const raw = searchParams?.name;
  const name =
    typeof raw === "string" ? raw :
    Array.isArray(raw) ? (raw[0] ?? "") :
    "";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Resultado</h1>

      {name ? (
        <div className="space-y-3">
          <p>Você pesquisou por: <b>{name}</b></p>
          <a
            href={`/character?name=${encodeURIComponent(name)}`}
            className="inline-block px-4 py-2 rounded bg-orange-600 text-white hover:opacity-90"
          >
            Ver detalhes do personagem
          </a>
        </div>
      ) : (
        <p className="text-neutral-600">
          Nenhum nome informado. Volte e faça uma busca.
        </p>
      )}
    </div>
  );
}
