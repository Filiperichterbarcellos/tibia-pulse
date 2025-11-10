import { useMemo, useState } from 'react'
import {
  IMBUEMENT_RECIPES,
  IMBUEMENT_TIERS,
  TIER_BASE_PRICE,
  TIER_NAME,
  TIER_TOKEN_PATTERNS,
} from './constants'

type MaterialPrices = Record<string, number>

type ShoppingResult = {
  lowestCost: number
  marketCost: number
  tokenCost: number
  pattern: boolean[]
}

function calculateBestOption(
  recipeIndex: number,
  tier: number,
  goldTokenPrice: number,
  prices: MaterialPrices,
): ShoppingResult {
  const recipe = IMBUEMENT_RECIPES[recipeIndex]
  const baseCost = TIER_BASE_PRICE[tier]
  const patterns = TIER_TOKEN_PATTERNS[tier]

  const possibilities = patterns.map((pattern) => {
    let total = baseCost
    pattern.forEach((buyWithTokens, materialIndex) => {
      if (buyWithTokens) {
        total += goldTokenPrice * 2 // dois gold tokens por tier
      } else {
        const material = recipe.materials[materialIndex]
        const price = prices[material.name] ?? 0
        total += price * material.amount
      }
    })
    return { total, pattern }
  })

  possibilities.sort((a, b) => a.total - b.total)
  const tokenOnly = possibilities.find(({ pattern }) => pattern.every(Boolean)) ?? possibilities[0]
  const marketOnly = possibilities.find(({ pattern }) => pattern.every((value) => !value)) ?? possibilities[0]

  return {
    lowestCost: possibilities[0].total,
    pattern: possibilities[0].pattern,
    tokenCost: tokenOnly.total,
    marketCost: marketOnly.total,
  }
}

const tierLabel = (tier: number) => TIER_NAME[tier] ?? ''

export default function ImbuementCalculator() {
  const [recipeIndex, setRecipeIndex] = useState(0)
  const [tier, setTier] = useState(3)
  const [goldTokenPrice, setGoldTokenPrice] = useState(20000)
  const [materialPrices, setMaterialPrices] = useState<MaterialPrices>({})

  const recipe = IMBUEMENT_RECIPES[recipeIndex]

  const shopping = useMemo(
    () => calculateBestOption(recipeIndex, tier, goldTokenPrice, materialPrices),
    [recipeIndex, tier, goldTokenPrice, materialPrices],
  )

  const npcLine = `${recipe.npc} ${tierLabel(tier)} yes`

  return (
    <section className="retro-panel space-y-4">
      <div>
        <p className="filter-label">Imbuements</p>
        <h2 className="text-xl font-semibold text-slate-900">Compare comprar itens x usar tokens</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="retro-input">
          <span>Receita</span>
          <div className="retro-input__field">
            <select value={recipeIndex} onChange={(e) => setRecipeIndex(Number(e.target.value))}>
              {IMBUEMENT_RECIPES.map((entry, idx) => (
                <option key={entry.id} value={idx}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="retro-input">
          <span>Tier</span>
          <div className="retro-input__field">
            <select value={tier} onChange={(e) => setTier(Number(e.target.value))}>
              {IMBUEMENT_TIERS.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="retro-input">
          <span>Gold token (gp)</span>
          <div className="retro-input__field">
            <input
              type="number"
              min={0}
              step={1000}
              value={goldTokenPrice}
              onChange={(e) => setGoldTokenPrice(Number(e.target.value) || 0)}
            />
          </div>
        </label>
      </div>

      <div className="grid gap-3">
        {recipe.materials.slice(0, tier).map((material) => (
          <label key={material.name} className="retro-input">
            <span>{material.name}</span>
            <div className="retro-input__field">
              <img src={material.icon} alt="" className="size-6 rounded" />
              <input
                type="number"
                min={0}
                step={100}
                value={materialPrices[material.name] ?? ''}
                placeholder="Preço unitário em gp"
                onChange={(e) =>
                  setMaterialPrices((prev) => ({
                    ...prev,
                    [material.name]: Number(e.target.value) || 0,
                  }))
                }
              />
              <span className="text-xs text-slate-500">x{material.amount}</span>
            </div>
          </label>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="stat-card stat-card--highlight">
          <p>Melhor combinação</p>
          <strong>{shopping.lowestCost.toLocaleString('pt-BR')} gp</strong>
        </div>
        <div className="stat-card">
          <p>Apenas Tokens</p>
          <strong>{shopping.tokenCost.toLocaleString('pt-BR')} gp</strong>
        </div>
        <div className="stat-card">
          <p>Apenas mercado</p>
          <strong>{shopping.marketCost.toLocaleString('pt-BR')} gp</strong>
        </div>
      </div>

      <div className="retro-panel border-dashed border-indigo-200 bg-indigo-50 text-sm text-indigo-900">
        <p className="font-semibold mb-2">Diálogo com o NPC</p>
        <div className="flex items-center gap-2">
          <code className="bg-white rounded px-2 py-1">{npcLine}</code>
          <button
            type="button"
            className="retro-auth retro-auth--ghost !py-1 !px-3 text-xs"
            onClick={() => navigator.clipboard?.writeText(npcLine)}
          >
            Copiar
          </button>
        </div>
      </div>
    </section>
  )
}
