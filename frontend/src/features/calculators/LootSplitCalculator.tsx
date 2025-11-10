import { useMemo, useState } from 'react'

export default function LootSplitCalculator() {
  const [totalLoot, setTotalLoot] = useState(150000)
  const [players, setPlayers] = useState(5)
  const [supplies, setSupplies] = useState(20000)

  const result = useMemo(() => {
    const loot = Math.max(0, totalLoot)
    const team = Math.max(1, players)
    const supply = Math.max(0, supplies)
    const totalSupplies = supply * team
    const net = loot - totalSupplies
    const perPlayer = net / team
    return {
      perPlayer,
      net,
      totalSupplies,
    }
  }, [totalLoot, players, supplies])

  return (
    <section className="retro-panel space-y-4">
      <div>
        <p className="filter-label">Loot Split</p>
        <h2 className="text-xl font-semibold text-slate-900">Divida o lucro entre o time</h2>
      </div>

      <label className="retro-input">
        <span>Loot total (gp)</span>
        <div className="retro-input__field">
          <input
            type="number"
            min={0}
            value={totalLoot}
            onChange={(e) => setTotalLoot(Number(e.target.value) || 0)}
          />
        </div>
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="retro-input">
          <span>Jogadores</span>
          <div className="retro-input__field">
            <input
              type="number"
              min={1}
              value={players}
              onChange={(e) => setPlayers(Number(e.target.value) || 1)}
            />
          </div>
        </label>

        <label className="retro-input">
          <span>Supplies por jogador (gp)</span>
          <div className="retro-input__field">
            <input
              type="number"
              min={0}
              value={supplies}
              onChange={(e) => setSupplies(Number(e.target.value) || 0)}
            />
          </div>
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="stat-card">
          <p>Supplies totais</p>
          <strong>{result.totalSupplies.toLocaleString('pt-BR')} gp</strong>
        </div>
        <div className="stat-card">
          <p>Lucro líquido</p>
          <strong>{result.net.toLocaleString('pt-BR')} gp</strong>
        </div>
        <div className="stat-card stat-card--highlight">
          <p>Por jogador</p>
          <strong>{result.perPlayer.toLocaleString('pt-BR')} gp</strong>
        </div>
      </div>
    </section>
  )
}
