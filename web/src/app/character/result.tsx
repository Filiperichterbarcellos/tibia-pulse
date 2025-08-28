type Props = { name: string };

export default async function CharacterResult({ name }: Props) {
  // TibiaData v4 – endpoint de character
  const URL = `https://api.tibiadata.com/v4/characters/${encodeURIComponent(name)}`;
  let data: any = null;
  let error: string | null = null;

  try {
    const res = await fetch(URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`fetch failed (${res.status})`);
    data = await res.json();
  } catch (e: any) {
    error = e?.message ?? "Erro ao consultar personagem";
  }

  const ch =
    data?.characters?.character ??
    data?.character ??
    null;

  if (error) {
    return <div className="rounded-md border bg-white p-4 text-sm text-red-700">Erro: {error}</div>;
  }
  if (!ch) {
    return <div className="rounded-md border bg-white p-4 text-sm text-neutral-700">Nenhum resultado para “{name}”.</div>;
  }

  return (
    <div className="rounded-2xl border bg-white p-6">
      <h2 className="text-xl font-semibold">{ch.name}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Info label="Vocation" value={ch.vocation} />
        <Info label="Level" value={ch.level} />
        <Info label="World" value={ch.world} />
        <Info label="Residence" value={ch.residence} />
        <Info label="Guild" value={ch.guild?.name} />
        <Info label="Account Status" value={ch.account_status} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="text-sm">
      <div className="text-neutral-500">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}
