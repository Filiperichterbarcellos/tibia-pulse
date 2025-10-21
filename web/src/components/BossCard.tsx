// src/components/BossCard.tsx
'use client';

import Image from 'next/image';
import type { Boss } from '@/data/bosses';
import clsx from 'clsx';

const rarityStyle: Record<Boss['rarity'], string> = {
  common: 'border-neutral-300',
  rare: 'border-amber-400',
  'very-rare': 'border-rose-500',
};

export default function BossCard({
  boss,
  active,
  onClick,
}: {
  boss: Boss;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'group w-full text-left rounded-lg border p-3 flex items-center gap-3 hover:bg-neutral-50 transition',
        rarityStyle[boss.rarity],
        active && 'ring-2 ring-orange-500'
      )}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded">
        <Image
          src={boss.sprite}
          alt={boss.name}
          fill
          sizes="48px"
          unoptimized
          className="object-contain"
        />
      </div>

      <div className="min-w-0">
        <div className="font-medium truncate">{boss.name}</div>
        <div className="text-xs capitalize text-neutral-500">{boss.rarity}</div>
      </div>
    </button>
  );
}
