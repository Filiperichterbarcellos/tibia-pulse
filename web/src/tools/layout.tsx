import TabNav from "@/components/TabNav";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <TabNav
        items={[
          { href: "/tools", label: "Calculadoras", icon: "🧮" },
          { href: "/tools/auction-price", label: "Estimar leilões", icon: "🏷️" },
          { href: "/tools/exercise", label: "Exercise weapons", icon: "⚔️" },
          { href: "/tools/split-loot", label: "Dividir loot", icon: "💰" },
          { href: "/tools/stamina", label: "Stamina", icon: "⏳" },
          { href: "/tools/imbuements", label: "Custo de Imbuements", icon: "🧿" },
          { href: "/tools/charm-damage", label: "Charm Damage", icon: "✨" },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </section>
  );
}
