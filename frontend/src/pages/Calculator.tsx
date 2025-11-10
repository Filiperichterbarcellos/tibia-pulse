import {
  CharmDamageCalculator,
  ImbuementCalculator,
  LootSplitCalculator,
  SkillProgressCalculator,
  StaminaCalculator,
} from '@/features/calculators'

export default function Calculator() {
  return (
    <div className="retro-layout space-y-8">
      <section className="retro-hero">
        <div>
          <p className="retro-badge">Calculators</p>
          <h1>Ferramentas inspiradas no Exevo Pan</h1>
          <p>
            Utilize os mesmos cálculos de charms, stamina, divisão de loot e custo de imbuements que
            usamos no bazar. Mais ferramentas serão adicionadas em breve.
          </p>
        </div>
        <div className="retro-hero__box">
          <p>Disponíveis agora</p>
          <ul>
            <li>Stamina regen e Low Blow</li>
            <li>Charm elemental médio</li>
            <li>Loot Split automático</li>
            <li>Comparador de Imbuements</li>
          </ul>
        </div>
      </section>

      <div className="grid gap-6">
        <StaminaCalculator />
        <SkillProgressCalculator />
        <CharmDamageCalculator />
        <LootSplitCalculator />
        <ImbuementCalculator />
      </div>
    </div>
  )
}
