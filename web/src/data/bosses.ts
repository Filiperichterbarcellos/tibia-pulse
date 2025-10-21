// src/data/bosses.ts
export type BossSpawn = {
  label?: string;
  x: number;
  y: number;
  z: number; // 0..15
};

export type Rarity = 'common' | 'rare' | 'very-rare';

export type Boss = {
  id: string;
  name: string;
  rarity: Rarity;
  /** caminho do gif animado dentro de /public (ex.: "/bosses/orshabaal.gif") */
  sprite: string;
  spawns: BossSpawn[];
  notes?: string;
};

export const BOSSES: Boss[] = [
  {
    id: 'orshabaal',
    name: 'Orshabaal',
    rarity: 'very-rare',
    sprite: '/bosses/orshabaal.gif',
    notes: 'Aparece em Edron e Darama (broadcast server-wide).',
    spawns: [
      { label: 'Edron', x: 33220, y: 31810, z: 7 },
      { label: 'Darama', x: 33280, y: 32450, z: 7 },
    ],
  },
  {
    id: 'demodras',
    name: 'Demodras',
    rarity: 'rare',
    sprite: '/bosses/demodras.gif',
    spawns: [{ label: 'Plains of Havoc', x: 32870, y: 32268, z: 15 }],
  },
  {
    id: 'yeti',
    name: 'Yeti',
    rarity: 'rare',
    sprite: '/bosses/yeti.gif',
    spawns: [{ label: 'Svargrond (área ártica)', x: 32353, y: 31160, z: 7 }],
  },
  // 🔧 adicione mais bosses seguindo o mesmo formato
];
