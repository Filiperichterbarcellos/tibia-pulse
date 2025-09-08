import TabNav from "@/components/TabNav";

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <TabNav
        items={[
          { href: "/stats", label: "Estatísticas gerais", icon: "📈" },
          { href: "/stats/rankings", label: "Rankings", icon: "🏆" },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </section>
  );
}
