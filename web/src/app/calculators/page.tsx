'use client';

import { useMemo, useState } from 'react';

/**
 * === Constantes oficiais (TibiaWiki) ===
 * Fórmula de pontos para avançar 1 nível de skill:
 *   P = A * b^(skill - c)
 *   c=0 p/ Magic Level; c=10 p/ demais skills
 * A: Magic=1600; Melee/Fist=50; Distance=30; Shield=100
 * b: depende da vocação e do skill (tabela abaixo).
 *
 * Equivalência por charge (Exercise):
 * - melee/fist: 7.2 hits/charge
 * - bow (distance): 4.32 miss hits/charge
 * - shield: 14.4 blocks/charge
 * - wand/rod (magic): 600 mana/charge
 *
 * Dummy privado: +10% avanço (x1.1)
 * Double Skill: x2 de avanço
 */

type Vocation = 'Knight' | 'Paladin' | 'Sorcerer' | 'Druid' | 'Monk';
type SkillGroup = 'melee' | 'distance' | 'shield' | 'magic' | 'fist';
type WeaponType = 'regular' | 'durable' | 'lasting';
type WeaponChoice = 'auto' | WeaponType;

const A_CONST: Record<SkillGroup, number> = {
  magic: 1600,
  melee: 50,
  fist: 50,
  distance: 30,
  shield: 100,
};

const OFFSET_C: Record<SkillGroup, number> = {
  magic: 0,
  melee: 10,
  fist: 10,
  distance: 10,
  shield: 10,
};

// b (vocation constant) por vocação e grupo de skill (TibiaWiki)
const B_CONST: Record<Vocation, Record<SkillGroup, number>> = {
  Knight:   { magic: 3.0, melee: 1.1, fist: 1.1, distance: 1.4, shield: 1.1 },
  Paladin:  { magic: 1.4, melee: 1.2, fist: 1.2, distance: 1.1, shield: 1.1 },
  Sorcerer: { magic: 1.1, melee: 2.0, fist: 1.5, distance: 2.0, shield: 1.5 },
  Druid:    { magic: 1.1, melee: 1.8, fist: 1.5, distance: 1.8, shield: 1.5 },
  Monk:     { magic: 1.25, melee: 1.4, fist: 1.1, distance: 1.5, shield: 1.15 },
};

// equivalências por charge (Exercise)
const POINTS_PER_CHARGE: Record<SkillGroup, number> = {
  melee: 7.2,          // hits
  fist: 7.2,           // hits
  distance: 4.32,      // miss hits em dummy
  shield: 14.4,        // blocks
  magic: 600,          // mana
};

// charges por arma
const CHARGES: Record<WeaponType, number> = {
  regular: 500,
  durable: 1800,
  lasting: 14400,
};

// preço “de NPC” em gold
const GOLD_PRICE: Record<WeaponType, number> = {
  regular: 347_222,
  durable: 1_250_000,
  lasting: 10_000_000,
};

// preço em TC (Store)
const TC_PRICE: Record<WeaponType, number> = {
  regular: 25,
  durable: 90,
  lasting: 720,
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

// remove loyalty do valor “mostrado” no client
function removeLoyalty(shown: number, loyaltyPct: number) {
  const factor = 1 + loyaltyPct / 100;
  return Math.floor(shown / factor);
}

// pontos p/ avançar 1 nível do skill atual (usando skill base)
function pointsForNext(
  group: SkillGroup,
  vocation: Vocation,
  skillBase: number
) {
  const A = A_CONST[group];
  const b = B_CONST[vocation][group];
  const c = OFFSET_C[group];
  return A * Math.pow(b, skillBase - c);
}

// soma de pontos p/ sair de (skillBase + progress%) até target
function totalPointsNeeded(opts: {
  group: SkillGroup;
  vocation: Vocation;
  currentShown: number;
  percentToNext: number; // 0..100 (do mostrado)
  targetShown: number;
  loyaltyPct: number;
}) {
  const { group, vocation, currentShown, percentToNext, targetShown, loyaltyPct } = opts;

  const currentBase = removeLoyalty(currentShown, loyaltyPct);
  const targetBase = Math.max(currentBase, removeLoyalty(targetShown, loyaltyPct));

  if (currentBase === targetBase && percentToNext <= 0) return 0;

  // parte restante do nível atual
  const pCurrent = pointsForNext(group, vocation, currentBase);
  const rem = pCurrent * clamp(1 - percentToNext / 100, 0, 1);

  // níveis cheios entre (currentBase+1 .. targetBase-1)
  let mid = 0;
  for (let s = currentBase + 1; s < targetBase; s++) {
    mid += pointsForNext(group, vocation, s);
  }

  // se o alvo é o mesmo nível base, só a parte restante; se é maior, soma mid completo
  return rem + mid;
}

function prettifyInt(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return '-';
  return Math.round(n).toLocaleString();
}

function secondsToHMS(totalSeconds: number) {
  const s = Math.round(totalSeconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const parts = [];
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${sec}s`);
  return parts.join(' ');
}

export default function ExerciseCalculatorPage() {
  // UI state
  const [vocation, setVocation] = useState<Vocation>('Knight');
  const [group, setGroup] = useState<SkillGroup>('melee');
  const [current, setCurrent] = useState(100);
  const [pct, setPct] = useState(0);
  const [target, setTarget] = useState(120);
  const [loyalty, setLoyalty] = useState(0); // 0..50
  const [privateDummy, setPrivateDummy] = useState(false);
  const [doubleSkill, setDoubleSkill] = useState(false);
  const [tcPrice, setTcPrice] = useState(14000); // gold por TC (para comparar custo)
  const [weaponChoice, setWeaponChoice] = useState<WeaponChoice>('auto');

  const calc = useMemo(() => {
    // 1) pontos necessários
    const pts = totalPointsNeeded({
      group,
      vocation,
      currentShown: current,
      percentToNext: pct,
      targetShown: target,
      loyaltyPct: loyalty,
    });

    // 2) pontos ganhos por charge
    let perCharge = POINTS_PER_CHARGE[group];
    // multiplicadores (dummy privado +10%; Double Skill = x2)
    if (privateDummy) perCharge *= 1.1;
    if (doubleSkill) perCharge *= 2;

    // 3) charges totais
    const totalCharges = pts / Math.max(1e-9, perCharge);

    // 4) escolha/auto-otimização de arma por custo
    // custo em gold via TC x custo em gold direto
    const weaponTypes: WeaponType[] = ['regular', 'durable', 'lasting'];
    function goldCostFor(w: WeaponType) {
      const viaGold = GOLD_PRICE[w];
      const viaTC = TC_PRICE[w] * tcPrice;
      return Math.min(viaGold, viaTC);
    }

    let chosen: WeaponType = 'regular';
    if (weaponChoice === 'auto') {
      // pega a mais barata por charge
      let best: WeaponType = 'regular';
      let bestPerCharge = goldCostFor('regular') / CHARGES['regular'];
      for (const w of weaponTypes) {
        const perCh = goldCostFor(w) / CHARGES[w];
        if (perCh < bestPerCharge - 1e-6) {
          bestPerCharge = perCh;
          best = w;
        }
      }
      chosen = best;
    } else {
      chosen = weaponChoice;
    }

    const chargesPerWeapon = CHARGES[chosen];
    const weaponsNeeded = Math.ceil(totalCharges / chargesPerWeapon);

    // 5) custos
    const costGoldDirect = weaponsNeeded * GOLD_PRICE[chosen];
    const costInTc = weaponsNeeded * TC_PRICE[chosen];
    const costGoldViaTc = costInTc * tcPrice;
    const goldChosen = Math.min(costGoldDirect, costGoldViaTc);

    // 6) tempo total (2s por charge)
    const totalSeconds = totalCharges * 2;

    return {
      pts,
      perCharge,
      totalCharges,
      chosen,
      weaponsNeeded,
      costGoldDirect,
      costInTc,
      costGoldViaTc,
      goldChosen,
      totalSeconds,
    };
  }, [group, vocation, current, pct, target, loyalty, privateDummy, doubleSkill, tcPrice, weaponChoice]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Exercise weapons</h1>

      <div className="grid md:grid-cols-2 gap-4">
        {/* bloco de inputs */}
        <div className="border rounded p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">Vocação</label>
            <select
              className="border rounded px-2 py-1"
              value={vocation}
              onChange={(e) => setVocation(e.target.value as Vocation)}
            >
              {(['Knight','Paladin','Sorcerer','Druid','Monk'] as Vocation[]).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <label className="text-sm">Skill</label>
            <select
              className="border rounded px-2 py-1"
              value={group}
              onChange={(e) => setGroup(e.target.value as SkillGroup)}
            >
              <option value="melee">Axe/Club/Sword</option>
              <option value="distance">Distance</option>
              <option value="shield">Shielding</option>
              <option value="fist">Fist</option>
              <option value="magic">Magic level</option>
            </select>

            <label className="text-sm">Skill atual (mostrado)</label>
            <input
              type="number"
              className="border rounded px-2 py-1"
              value={current}
              onChange={(e) => setCurrent(Number(e.target.value))}
            />

            <label className="text-sm">% restante p/ próximo</label>
            <input
              type="number"
              className="border rounded px-2 py-1"
              value={pct}
              min={0}
              max={100}
              onChange={(e) => setPct(clamp(Number(e.target.value), 0, 100))}
            />

            <label className="text-sm">Skill alvo (mostrado)</label>
            <input
              type="number"
              className="border rounded px-2 py-1"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
            />

            <label className="text-sm">Loyalty (%)</label>
            <input
              type="number"
              className="border rounded px-2 py-1"
              value={loyalty}
              min={0}
              max={50}
              onChange={(e) => setLoyalty(clamp(Number(e.target.value), 0, 50))}
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center pt-2">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={privateDummy}
                onChange={(e) => setPrivateDummy(e.target.checked)}
              />
              Dummy privado (+10%)
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={doubleSkill}
                onChange={(e) => setDoubleSkill(e.target.checked)}
              />
              Double skill (x2)
            </label>
          </div>

          <hr />

          <div className="grid grid-cols-2 gap-2">
            <label className="text-sm">Escolha de arma</label>
            <select
              className="border rounded px-2 py-1"
              value={weaponChoice}
              onChange={(e) => setWeaponChoice(e.target.value as WeaponChoice)}
            >
              <option value="auto">Auto (mais barata)</option>
              <option value="regular">Regular (500)</option>
              <option value="durable">Durable (1.800)</option>
              <option value="lasting">Lasting (14.400)</option>
            </select>

            <label className="text-sm">Preço do TC (gold)</label>
            <input
              type="number"
              className="border rounded px-2 py-1"
              value={tcPrice}
              onChange={(e) => setTcPrice(Math.max(0, Number(e.target.value)))}
            />
          </div>
        </div>

        {/* bloco de resultados */}
        <div className="border rounded p-4 space-y-3">
          <div className="text-sm text-neutral-600">
            <div>
              <b>Pontos necessários</b>: {prettifyInt(calc.pts)}
            </div>
            <div>
              <b>Pontos por charge</b>: {calc.perCharge.toFixed(2)}{' '}
              {group === 'magic' ? 'mana' : group === 'shield' ? 'blocks' : 'hits'}
            </div>
            <div>
              <b>Charges totais</b>: {prettifyInt(calc.totalCharges)}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <div className="text-sm">
              <div>
                <b>Arma escolhida</b>: {calc.chosen} ({CHARGES[calc.chosen]} charges)
              </div>
              <div>
                <b>Qnt. de armas</b>: {prettifyInt(calc.weaponsNeeded)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="border rounded p-2">
              <div className="font-medium mb-1">Custo</div>
              <div>Gold (direto): {prettifyInt(calc.costGoldDirect)} gp</div>
              <div>TC: {prettifyInt(calc.costInTc)} tc</div>
              <div>Gold via TC: {prettifyInt(calc.costGoldViaTc)} gp</div>
              <div className="mt-1">
                <b>Total (escolhido): {prettifyInt(calc.goldChosen)} gp</b>
              </div>
            </div>
            <div className="border rounded p-2">
              <div className="font-medium mb-1">Tempo total</div>
              <div>{secondsToHMS(calc.totalSeconds)}</div>
              <div className="text-xs text-neutral-500">(2s por charge)</div>
            </div>
          </div>

          <div className="text-xs text-neutral-500 pt-1">
            <div>
              * Para Distance usamos a equivalência de “miss hits” (4,32/charge).
            </div>
            <div>
              * A lealdade (Loyalty) é removida do valor mostrado para usar o
              “skill base” nas fórmulas de avanço.
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs text-neutral-500">
        Fontes: fórmulas de skills e constantes A/b/c, tempo e equivalências por
        charge (TibiaWiki). Eventos Double Skill e bônus de dummy privado conforme
        documentação oficial/comunicados.
      </div>
    </div>
  );
}
