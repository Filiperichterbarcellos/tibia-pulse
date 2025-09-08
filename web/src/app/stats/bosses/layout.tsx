import TabNav from "@/components/TabNav";

export default function BossesLayout({ children }: { children: React.ReactNode }) {
  return (
    <section>
      <TabNav
        items={[
          { href: "/bosses", label: "Boss Tracker", icon: "👹" },
          { href: "/bosses/groups", label: "Grupos de caça", icon: "🛡️" },
        ]}
      />
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </section>
  );
}
