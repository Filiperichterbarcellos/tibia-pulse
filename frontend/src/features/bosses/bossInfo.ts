export type BossInfo = {
  locations?: Array<{ description: string; mapUrl: string }>
  loot?: string[]
  raidMessages?: Array<{ time: string; message: string; style?: 'regular' | 'highlight' | 'unannounced' }>
}

export const bossInfo: Record<string, BossInfo> = {
  "Albino Dragon": {
    "locations": [
      {
        "description": "Dragon Lair (Ankrahmun)",
        "mapUrl": "https://tibiamaps.io/map/embed#33090,32594,5:1"
      },
      {
        "description": "Dragon Lair (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33156,31270,5:1"
      },
      {
        "description": "Dragon Lair (Fenrock)",
        "mapUrl": "https://tibiamaps.io/map/embed#32592,31383,15:1"
      },
      {
        "description": "Dragon Lair (Goroma)",
        "mapUrl": "https://tibiamaps.io/map/embed#32086,32566,14:1"
      },
      {
        "description": "Pits of Inferno",
        "mapUrl": "https://tibiamaps.io/map/embed#32770,32311,12:1"
      }
    ],
    "loot": [
      "Albino Dragon Leather"
    ]
  },
  "Apprentice Sheng": {
    "locations": [
      {
        "description": "Minotaur Hell (Rookgaard)",
        "mapUrl": "https://tibiamaps.io/map/embed#32130,32059,12:1"
      }
    ],
    "loot": [
      "Magic Light Wand",
      "Knife"
    ]
  },
  "Arachir the Ancient One": {
    "locations": [
      {
        "description": "Drefia (Darashia)",
        "mapUrl": "https://tibiamaps.io/map/embed#32969,32399,12:1"
      }
    ],
    "loot": [
      "Vampire Lord Token"
    ]
  },
  "Arthom The Hunter": {
    "locations": [
      {
        "description": "Hunter Camp (Port Hope)",
        "mapUrl": "https://tibiamaps.io/map/embed#32887,32787,7:1"
      }
    ]
  },
  "Barbaria": {
    "locations": [
      {
        "description": "Barbarian Camp, Krimhorn (Svargrond)",
        "mapUrl": "https://tibiamaps.io/map/embed#32007,31415,7:1"
      }
    ]
  },
  "Battlemaster Zunzu": {
    "locations": [
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33208,31241,7:1"
      },
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33237,31240,7:1"
      },
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33284,31241,7:1"
      }
    ]
  },
  "Big Boss Trolliver": {
    "locations": [
      {
        "description": "Troll Cave (Edron)",
        "mapUrl": "https://tibiamaps.io/map/embed#33134,31721,10:1"
      }
    ]
  },
  "Burster": {
    "locations": [
      {
        "description": "Otherworld (Kazordoon)",
        "mapUrl": "https://tibiamaps.io/map/embed#32449,32416,10:1"
      }
    ]
  },
  "Captain Jones": {
    "locations": [
      {
        "description": "Ghost Ship (Darashia)",
        "mapUrl": "https://tibiamaps.io/map/embed#33321,32183,7:1"
      }
    ]
  },
  "Chizzoron the Distorter": {
    "locations": [
      {
        "description": "Zzaion (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33351,31609,2:1"
      }
    ],
    "loot": [
      "Crystal Boots"
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "A massive orc force is gathering at the gates of Zzaion.",
        "style": "regular"
      },
      {
        "time": "00:03:00",
        "message": "Orc reinforcements have arrived at the gates of Zzaion! The gates are under heavy attack!",
        "style": "regular"
      },
      {
        "time": "00:05:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:07:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:10:00",
        "message": "More orc reinforcements have arrived at the gates of Zzaion! The gates are under heavy attack!",
        "style": "regular"
      },
      {
        "time": "00:11:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:13:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:15:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:17:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:19:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:20:00",
        "message": "The gates to Zzaion have been breached! Orcs are invading the city!",
        "style": "regular"
      },
      {
        "time": "00:30:00",
        "message": "More orcs have arrived in Zzaion! The city is under attack! Strong lizard leaders have come to defend the city.",
        "style": "highlight"
      }
    ]
  },
  "Chopper": {
    "locations": [
      {
        "description": "The Hive (Gray Beach)",
        "mapUrl": "https://tibiamaps.io/map/embed#33522,31254,8:1"
      }
    ]
  },
  "Countess Sorrow": {
    "locations": [
      {
        "description": "Pits of Inferno",
        "mapUrl": "https://tibiamaps.io/map/embed#32794,32363,15:1"
      }
    ],
    "loot": [
      "Silver Mace",
      "Countess Sorrow's Frozen Tear"
    ]
  },
  "Crustacea Gigantica": {
    "locations": [
      {
        "description": "Treasure Island (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32181,32939,9:1"
      },
      {
        "description": "Calassa (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32113,32733,12:1"
      },
      {
        "description": "Calassa (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32114,32804,12:1"
      },
      {
        "description": "Seacrest Grounds (Oramond)",
        "mapUrl": "https://tibiamaps.io/map/embed#33517,31804,15:1"
      },
      {
        "description": "Seacrest Grounds (Oramond)",
        "mapUrl": "https://tibiamaps.io/map/embed#33471,31654,15:1"
      },
      {
        "description": "Seacrest Grounds (Oramond)",
        "mapUrl": "https://tibiamaps.io/map/embed#33507,31635,14:1"
      },
      {
        "description": "Seacrest Grounds (Oramond)",
        "mapUrl": "https://tibiamaps.io/map/embed#33534,31658,15:1"
      },
      {
        "description": "Seacrest Grounds (Oramond)",
        "mapUrl": "https://tibiamaps.io/map/embed#33555,31788,14:1"
      }
    ]
  },
  "Cublarc the Plunderer": {
    "locations": [
      {
        "description": "Zao Steppe (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33090,31391,7:1"
      },
      {
        "description": "Zao Steppe (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33229,31428,7:1"
      },
      {
        "description": "Zzaion (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33317,31453,7:1"
      }
    ],
    "loot": [
      "Disgusting Trophy"
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "An orcish horde, ready for murder and plunder, is amassing to begin its travel through the steppes of Zao. Beware!",
        "style": "regular"
      },
      {
        "time": "00:05:00",
        "message": "(unannounced raid)",
        "style": "highlight"
      },
      {
        "time": "00:10:00",
        "message": "The great march of the orcish horde has begun!",
        "style": "regular"
      },
      {
        "time": "00:12:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:16:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:18:00",
        "message": "(unannounced raid)",
        "style": "highlight"
      },
      {
        "time": "00:30:00",
        "message": "(unannounced raid)",
        "style": "highlight"
      }
    ]
  },
  "Dharalion": {
    "locations": [
      {
        "description": "Shadowthorn (Venore)",
        "mapUrl": "https://tibiamaps.io/map/embed#33040,32177,9:1"
      }
    ],
    "loot": [
      "Cornucopia"
    ]
  },
  "Diblis the Fair": {
    "locations": [
      {
        "description": "Nargor Undead Cave (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32008,32793,10:1"
      }
    ],
    "loot": [
      "Vampire Lord Token"
    ]
  },
  "Dracola": {
    "locations": [
      {
        "description": "Pits of Inferno",
        "mapUrl": "https://tibiamaps.io/map/embed#32838,32307,15:1"
      }
    ],
    "loot": [
      "Reaper's Axe",
      "Dracola's Eye"
    ]
  },
  "Draptor": {
    "locations": [
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33189,31236,7:1"
      },
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33215,31228,7:1"
      },
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33234,31186,7:1"
      },
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33286,31251,7:1"
      },
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33253,31162,7:1"
      },
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33291,31158,7:1"
      },
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33333,31188,7:1"
      },
      {
        "description": "Razachai (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33110,31079,10:1"
      },
      {
        "description": "Razachai (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33058,31116,10:1"
      }
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "The dragons of the Dragonblaze Mountains have descended to Zao to protect the lizardkin!",
        "style": "regular"
      },
      {
        "time": "00:15:00",
        "message": "(unannounced raid)",
        "style": "highlight"
      },
      {
        "time": "00:20:00",
        "message": "(unannounced raid)",
        "style": "highlight"
      },
      {
        "time": "00:25:00",
        "message": "(unannounced raid)",
        "style": "highlight"
      }
    ]
  },
  "Dreadful Disruptor": {
    "locations": [
      {
        "description": "Otherworld (Edron)",
        "mapUrl": "https://tibiamaps.io/map/embed#32021,31379,11:1"
      }
    ]
  },
  "Dreadmaw": {
    "locations": [
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33270,31163,7:1"
      },
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33296,31149,7:1"
      }
    ]
  },
  "Elvira Hammerthrust": {
    "locations": [
      {
        "description": "Dwarf Mines (Kazordoon)",
        "mapUrl": "https://tibiamaps.io/map/embed#32531,31926,11:1"
      }
    ]
  },
  "Fernfang": {
    "locations": [
      {
        "description": "Isle of Mists (Plains of Havoc)",
        "mapUrl": "https://tibiamaps.io/map/embed#32854,32333,7:1"
      }
    ],
    "loot": [
      "Wooden Whistle"
    ]
  },
  "Feroxa": {
    "locations": [
      {
        "description": "Grimvale (Edron)",
        "mapUrl": "https://tibiamaps.io/map/embed#33298,31722,7:1"
      }
    ],
    "loot": [
      "Werewolf Helmet",
      "Wolf Backpack"
    ]
  },
  "Ferumbras": {
    "locations": [
      {
        "description": "Ferumbras' Citadel (Goroma)",
        "mapUrl": "https://tibiamaps.io/map/embed#32121,32687,4:1"
      }
    ],
    "loot": [
      "Teddy Bear",
      "Spellbook of Dark Mysteries",
      "Skullcrusher",
      "Demonwing Axe",
      "Great Axe",
      "Impaler",
      "Ornamented Axe",
      "Havoc Blade",
      "Tempest Shield",
      "Phoenix Shield",
      "Great Shield",
      "Ferumbras' Hat"
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "The seals on Ferumbras' old citadel are glowing. Prepare for HIS return, mortals.",
        "style": "regular"
      },
      {
        "time": "00:10:00",
        "message": "Ferumbras' return is at hand. The Edron Academy calls for heroes to fight that evil.",
        "style": "regular"
      },
      {
        "time": "00:20:00",
        "message": "Ferumbras has returned to his citadel once more. Stop him before it is too late.",
        "style": "highlight"
      }
    ]
  },
  "Flamecaller Zazrak": {
    "locations": [
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33180,31220,7:1"
      },
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33251,31152,6:1"
      }
    ]
  },
  "Fleabringer": {
    "locations": [
      {
        "description": "Zao Steppe (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33092,31384,8:1"
      },
      {
        "description": "Zao Steppe (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33112,31457,8:1"
      },
      {
        "description": "Zao Steppe (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33251,31423,7:1"
      }
    ]
  },
  "Foreman Kneebiter": {
    "locations": [
      {
        "description": "Dwarf Mines (Kazordoon)",
        "mapUrl": "https://tibiamaps.io/map/embed#32553,31897,14:1"
      },
      {
        "description": "Dwarf Mines (Kazordoon)",
        "mapUrl": "https://tibiamaps.io/map/embed#32555,31880,15:1"
      }
    ]
  },
  "Furyosa": {
    "locations": [
      {
        "description": "Fury Gate (Edron)",
        "mapUrl": "https://tibiamaps.io/map/embed#33314,31842,15:1"
      }
    ],
    "loot": [
      "Furious Frock",
      "Phoenix Shield"
    ]
  },
  "General Murius": {
    "locations": [
      {
        "description": "Mintwallin (Thais)",
        "mapUrl": "https://tibiamaps.io/map/embed#32414,32119,15:1"
      }
    ]
  },
  "Ghazbaran": {
    "locations": [
      {
        "description": "Formorgar Mines (Svargrond)",
        "mapUrl": "https://tibiamaps.io/map/embed#32227,31157,15:1"
      }
    ],
    "loot": [
      "Blue Tome",
      "Teddy Bear",
      "Robe of the Ice Queen",
      "Golden Boots",
      "Spellbook of Dark Mysteries",
      "Havoc Blade",
      "Ravenwing",
      "Mythril Axe",
      "Twin Axe",
      "Demonbone"
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "An ancient evil is awakening in the mines beneath Hrodmir.",
        "style": "regular"
      },
      {
        "time": "00:10:00",
        "message": "Demonic entities are entering the mortal realm in the Hrodmir mines.",
        "style": "regular"
      },
      {
        "time": "00:20:00",
        "message": "The demonic master has revealed itself in the mines of Hrodmir.",
        "style": "highlight"
      }
    ]
  },
  "Grand Mother Foulscale": {
    "locations": [
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33309,31173,7:1"
      }
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "The dragons of the Dragonblaze Mountains have descended to Zao to protect the lizardkin!",
        "style": "regular"
      },
      {
        "time": "00:15:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:20:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:25:00",
        "message": "(unannounced raid)",
        "style": "highlight"
      }
    ]
  },
  "Grandfather Tridian": {
    "locations": [
      {
        "description": "Cult Cave (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32413,32778,11:1"
      }
    ]
  },
  "Gravelord Oshuran": {
    "locations": [
      {
        "description": "Drefia (Darashia)",
        "mapUrl": "https://tibiamaps.io/map/embed#32979,32395,12:1"
      }
    ]
  },
  "Groam": {
    "locations": [
      {
        "description": "Sunken Mines (Kazordoon)",
        "mapUrl": "https://tibiamaps.io/map/embed#32629,32020,10:1"
      }
    ]
  },
  "Grorlam": {
    "locations": [
      {
        "description": "Grorlam",
        "mapUrl": "https://tibiamaps.io/map/embed#32483,32058,8:1"
      }
    ]
  },
  "Hairman the Huge": {
    "locations": [
      {
        "description": "Banuta (Port Hope)",
        "mapUrl": "https://tibiamaps.io/map/embed#32846,32509,8:1"
      }
    ]
  },
  "Hatebreeder": {
    "locations": [
      {
        "description": "WOTE (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33085,31103,14:1"
      }
    ]
  },
  "High Templar Cobrass": {
    "locations": [
      {
        "description": "Chor (Port Hope)",
        "mapUrl": "https://tibiamaps.io/map/embed#32957,32842,8:1"
      }
    ]
  },
  "Hirintror": {
    "locations": [
      {
        "description": "Formorgar Mines (Svargrond)",
        "mapUrl": "https://tibiamaps.io/map/embed#32145,31257,10:1"
      },
      {
        "description": "Nibelor (Svargrond)",
        "mapUrl": "https://tibiamaps.io/map/embed#32366,31053,8:1"
      }
    ]
  },
  "Jesse the Wicked": {
    "locations": [
      {
        "description": "Ancient Temple (Thais)",
        "mapUrl": "https://tibiamaps.io/map/embed#32372,32221,11:1"
      }
    ]
  },
  "Mahatheb": {
    "locations": [
      {
        "description": "Forgotten Tomb (Ankrahmun)",
        "mapUrl": "https://tibiamaps.io/map/embed#33390,31702,13:1"
      }
    ]
  },
  "Man in the Cave": {
    "locations": [
      {
        "description": "Svargrond",
        "mapUrl": "https://tibiamaps.io/map/embed#32133,31147,2:1"
      }
    ],
    "loot": [
      "Fur Cap"
    ]
  },
  "Massacre": {
    "locations": [
      {
        "description": "Pits of Inferno",
        "mapUrl": "https://tibiamaps.io/map/embed#32872,32280,15:1"
      }
    ],
    "loot": [
      "Great Shield",
      "Heavy Mace",
      "Piece of Massacre's Shell"
    ]
  },
  "Maw": {
    "locations": [
      {
        "description": "The Hive (Gray Beach)",
        "mapUrl": "https://tibiamaps.io/map/embed#33506,31246,8:1"
      }
    ]
  },
  "Midnight Panther": {
    "locations": [
      {
        "description": "Tiquanda (Port hope)",
        "mapUrl": "https://tibiamaps.io/map/embed#32854,32744,7:1"
      },
      {
        "description": "Tiquanda (Port hope)",
        "mapUrl": "https://tibiamaps.io/map/embed#32831,32706,7:1"
      },
      {
        "description": "Tiquanda (Port hope)",
        "mapUrl": "https://tibiamaps.io/map/embed#32886,32721,7:1"
      }
    ]
  },
  "Mindmasher": {
    "locations": [
      {
        "description": "The Hive (Gray Beach)",
        "mapUrl": "https://tibiamaps.io/map/embed#33457,31222,8:1"
      }
    ]
  },
  "Morgaroth": {
    "locations": [
      {
        "description": "Goroma (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32061,32615,14:1"
      }
    ],
    "loot": [
      "Morgaroth's Heart",
      "Teddy Bear",
      "Molten Plate",
      "Dark Lord's Cape",
      "Great Shield",
      "Thunder Hammer",
      "The Stomper",
      "The Devileye",
      "Chain Bolter"
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "The ancient volcano on Goroma slowly becomes active once again.",
        "style": "regular"
      },
      {
        "time": "00:06:00",
        "message": "There is an evil presence at the volcano of Goroma.",
        "style": "regular"
      },
      {
        "time": "00:12:00",
        "message": "Evil Cultists have called an ancient evil into the volcano on Goroma. Beware of its power mortals.",
        "style": "highlight"
      }
    ]
  },
  "Mornenion": {
    "locations": [
      {
        "description": "Shadowthorn (Venore)",
        "mapUrl": "https://tibiamaps.io/map/embed#33087,32157,7:1"
      }
    ]
  },
  "Morshabaal": {
    "locations": [
      {
        "description": "Edron",
        "mapUrl": "https://tibiamaps.io/map/embed#33118,31700,7:1"
      }
    ],
    "loot": [
      "Morshabaal's Brain",
      "Morshabaal's Extract",
      "Morshabaal's Mask",
      "Green Demon Legs",
      "Green Demon Helmet",
      "Green Demon Armor",
      "Green Demon Slippers",
      "Thunder Hammer"
    ]
  },
  "Mr. Punish": {
    "locations": [
      {
        "description": "Pits of Inferno",
        "mapUrl": "https://tibiamaps.io/map/embed#32762,32243,15:1"
      }
    ],
    "loot": [
      "Impaler",
      "Ravager's Axe",
      "Mr. Punish's Handcuffs"
    ]
  },
  "Munster": {
    "locations": [
      {
        "description": "Rat Cave (Rookgaard)",
        "mapUrl": "https://tibiamaps.io/map/embed#32102,32217,9:1"
      }
    ],
    "loot": [
      "Cookie",
      "Die"
    ]
  },
  "Ocyakao": {
    "locations": [
      {
        "description": "Nibelor (Svargrond)",
        "mapUrl": "https://tibiamaps.io/map/embed#32351,31052,7:1"
      }
    ],
    "loot": [
      "Eye of the Storm"
    ]
  },
  "Omrafir": {
    "locations": [
      {
        "description": "Roshamuul Prison (Roshamuul)",
        "mapUrl": "https://tibiamaps.io/map/embed#33589,32379,12:1"
      }
    ],
    "loot": [
      "Dream Warden Mask",
      "Eye Pod",
      "Nightmare Horn",
      "Nightmare Hook",
      "Psychedelic Tapestry"
    ]
  },
  "Oodok Witchmaster": {
    "locations": [
      {
        "description": "Hunter Camp (Port Hope)",
        "mapUrl": "https://tibiamaps.io/map/embed#32887,32787,7:1"
      }
    ]
  },
  "Orshabaal": {
    "locations": [
      {
        "description": "Edron",
        "mapUrl": "https://tibiamaps.io/map/embed#33118,31700,7:1"
      }
    ],
    "loot": [
      "Orshabaal's Brain",
      "Teddy Bear",
      "Thunder Hammer"
    ],
    "raidMessages": [
      {
        "time": "00:04:00",
        "message": "Orshabaal is about to make his way into the mortal realm. Run for your lives!",
        "style": "regular"
      },
      {
        "time": "00:05:00",
        "message": "Orshabaal's minions are working on his return to the World. LEAVE Edron at once, mortals.",
        "style": "regular"
      },
      {
        "time": "00:06:40",
        "message": "Orshabaal has been summoned from hell to plague the lands of mortals again.",
        "style": "highlight"
      }
    ]
  },
  "Robby the Reckless": {
    "locations": [
      {
        "description": "Ghostlands (Carlin)",
        "mapUrl": "https://tibiamaps.io/map/embed#32198,31809,9:1"
      }
    ]
  },
  "Rotrender": {
    "locations": [
      {
        "description": "Azzilon Castle (Edron)",
        "mapUrl": "https://tibiamaps.io/map/embed#33925,32337,8:1"
      }
    ],
    "loot": [
      "Rotrender's Sceptre",
      "Mighty Demonic Core Essence",
      "Rotrender Scalp",
      "Rotrender Claw",
      "Demon in a Golden Box"
    ]
  },
  "Rotspit": {
    "locations": [
      {
        "description": "The Hive (Gray Beach)",
        "mapUrl": "https://tibiamaps.io/map/embed#33450,31228,8:1"
      }
    ]
  },
  "Rottie the Rotworm": {
    "locations": [
      {
        "description": "Katana Quest (Rookgaard)",
        "mapUrl": "https://tibiamaps.io/map/embed#32180,32149,11:1"
      },
      {
        "description": "Poison Spider Cave (Rookgaard)",
        "mapUrl": "https://tibiamaps.io/map/embed#31975,32066,13:1"
      }
    ]
  },
  "Rotworm Queen": {
    "locations": [
      {
        "description": "Rotworm Cave (Darashia)",
        "mapUrl": "https://tibiamaps.io/map/embed#33046,32373,9:1"
      },
      {
        "description": "Rotworm Cave (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32263,32689,10:1"
      },
      {
        "description": "Rotworm Cave (Edron)",
        "mapUrl": "https://tibiamaps.io/map/embed#33238,31840,9:1"
      },
      {
        "description": "Hellgate (Ab'Dendriel)",
        "mapUrl": "https://tibiamaps.io/map/embed#32779,31604,12:1"
      }
    ]
  },
  "Rukor Zad": {
    "locations": [
      {
        "description": "Dark Cathedral (Plains of Havoc)",
        "mapUrl": "https://tibiamaps.io/map/embed#32601,32383,10:1"
      }
    ]
  },
  "Shadowstalker": {
    "locations": [
      {
        "description": "The Hive (Gray Beach)",
        "mapUrl": "https://tibiamaps.io/map/embed#33480,31233,8:1"
      }
    ]
  },
  "Shlorg": {
    "locations": [
      {
        "description": "Earth Elemental Cave (Edron)",
        "mapUrl": "https://tibiamaps.io/map/embed#33169,31732,9:1"
      }
    ],
    "loot": [
      "Glass of Goo",
      "Goo Shell"
    ]
  },
  "Sir Leopold": {
    "locations": [
      {
        "description": "Book World (Edron)",
        "mapUrl": "https://tibiamaps.io/map/embed#32538,32512,10:1"
      }
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "Once more, the sinister Sir Leopold leads his henchmen out of the book pages to wreak havoc.",
        "style": "regular"
      },
      {
        "time": "00:10:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:20:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:30:00",
        "message": "(unannounced raid)",
        "style": "highlight"
      }
    ]
  },
  "Sir Valorcrest": {
    "locations": [
      {
        "description": "Undead Cave (Edron)",
        "mapUrl": "https://tibiamaps.io/map/embed#33266,31768,10:1"
      }
    ],
    "loot": [
      "Vampire Lord Token"
    ]
  },
  "Smuggler Baron Silvertoe": {
    "locations": [
      {
        "description": "Bandit Caves (Port Hope)",
        "mapUrl": "https://tibiamaps.io/map/embed#32541,32648,10:1"
      }
    ]
  },
  "Teleskor": {
    "locations": [
      {
        "description": "Premium Area (Rookgaard)",
        "mapUrl": "https://tibiamaps.io/map/embed#31981,32246,10:1"
      }
    ]
  },
  "The Abomination": {
    "locations": [
      {
        "description": "",
        "mapUrl": "https://tibiamaps.io/map/embed#32430,31027,15:1"
      }
    ],
    "loot": [
      "Fiery Horseshoe",
      "Abomination's Eye",
      "Abomination's Tongue",
      "Abomination's Tail"
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "Something abnominale is rising! Search for its spawns! Gather an army and destroy this threat!",
        "style": "regular"
      }
    ]
  },
  "The Big Bad One": {
    "locations": [
      {
        "description": "Edron",
        "mapUrl": "https://tibiamaps.io/map/embed#33173,31678,7:1"
      }
    ]
  },
  "The Blightfather": {
    "locations": [
      {
        "description": "Muggy Plains (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33306,31154,7:1"
      }
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "Like a swarm of locusts the dreaded lancer beetles are pouring over the fertile parts of Zao.",
        "style": "regular"
      },
      {
        "time": "00:30:00",
        "message": "(unannounced raid)",
        "style": "highlight"
      }
    ]
  },
  "The Evil Eye": {
    "locations": [
      {
        "description": "Hellgate Library (Ab'Dendriel)",
        "mapUrl": "https://tibiamaps.io/map/embed#32806,31611,14:1"
      }
    ]
  },
  "The Frog Prince": {
    "locations": [
      {
        "description": "Alatar Lake (Thais)",
        "mapUrl": "https://tibiamaps.io/map/embed#32383,32128,7:1"
      }
    ]
  },
  "The Handmaiden": {
    "locations": [
      {
        "description": "Pits of Inferno",
        "mapUrl": "https://tibiamaps.io/map/embed#32785,32285,15:1"
      }
    ],
    "loot": [
      "The Handmaiden's Protector"
    ]
  },
  "The Hungerer": {
    "locations": [
      {
        "description": "Hive Outpost (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32155,32862,9:1"
      }
    ]
  },
  "The Imperor": {
    "locations": [
      {
        "description": "Pits of Inferno",
        "mapUrl": "https://tibiamaps.io/map/embed#32891,32236,15:1"
      }
    ],
    "loot": [
      "Tempest Shield",
      "The Imperor's Trident"
    ]
  },
  "The Manhunter": {
    "locations": [
      {
        "description": "Hive Outpost (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32167,32865,9:1"
      }
    ]
  },
  "The Mean Masher": {
    "locations": [
      {
        "description": "Hive Outpost (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32167,32865,9:1"
      }
    ]
  },
  "The Old Whopper": {
    "locations": [
      {
        "description": "Cyclopolis (Edron)",
        "mapUrl": "https://tibiamaps.io/map/embed#33313,31667,11:1"
      }
    ]
  },
  "The Pale Count": {
    "locations": [
      {
        "description": "Drefia (Darashia)",
        "mapUrl": "https://tibiamaps.io/map/embed#32966,32421,14:1"
      }
    ],
    "loot": [
      "Vampire Lord Token"
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "The Pale Count has risen from his crypt deep under Drefia. Blood will flow.",
        "style": "highlight"
      }
    ]
  },
  "The Plasmother": {
    "locations": [
      {
        "description": "Pits of Inferno",
        "mapUrl": "https://tibiamaps.io/map/embed#32853,32331,15:1"
      }
    ],
    "loot": [
      "The Plasmother's Remains"
    ]
  },
  "The Voice Of Ruin": {
    "locations": [
      {
        "description": "Corruption Hole (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33313,31132,9:1"
      },
      {
        "description": "Corruption Hole (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33280,31087,9:1"
      }
    ]
  },
  "The Welter": {
    "locations": [
      {
        "description": "Tiquanda (Port Hope)",
        "mapUrl": "https://tibiamaps.io/map/embed#33027,32658,5:1"
      }
    ],
    "loot": [
      "Triple Bolt Crossbow",
      "Shrunken Head Necklace"
    ]
  },
  "Tyrn": {
    "locations": [
      {
        "description": "Drefia (Darashia)",
        "mapUrl": "https://tibiamaps.io/map/embed#33048,32377,14:1"
      },
      {
        "description": "Wyrm Cave (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32440,32838,9:1"
      }
    ],
    "loot": [
      "Sun Mirror"
    ]
  },
  "Tzumrah The Dazzler": {
    "locations": [
      {
        "description": "Forbidden Temple (Ankrahmun)",
        "mapUrl": "https://tibiamaps.io/map/embed#33326,32657,11:1"
      }
    ]
  },
  "Undead Cavebear": {
    "locations": [
      {
        "description": "Lich Hell (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#31977,32559,10:1"
      },
      {
        "description": "Lich Hell (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#31965,32591,10:1"
      },
      {
        "description": "Lich Hell (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#31913,32560,10:1"
      }
    ]
  },
  "Warlord Ruzad": {
    "locations": [
      {
        "description": "Orc Fortress (Kazordoon)",
        "mapUrl": "https://tibiamaps.io/map/embed#32976,31717,5:1"
      }
    ]
  },
  "White Pale": {
    "locations": [
      {
        "description": "Rotworm Cave (Edron)",
        "mapUrl": "https://tibiamaps.io/map/embed#33268,31872,11:1"
      },
      {
        "description": "Rotworm Cave (Darashia)",
        "mapUrl": "https://tibiamaps.io/map/embed#33131,32430,9:1"
      },
      {
        "description": "Rotworm Cave (Liberty Bay)",
        "mapUrl": "https://tibiamaps.io/map/embed#32225,32760,10:1"
      }
    ],
    "loot": [
      "Albino Plate",
      "Horn (Ring)"
    ]
  },
  "Willi Wasp": {
    "locations": [
      {
        "description": "Carlin",
        "mapUrl": "https://tibiamaps.io/map/embed#32345,31704,7:1"
      }
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "Some wasps have been found north of Carlin. There is some loud buzzing in the air.",
        "style": "regular"
      },
      {
        "time": "00:04:10",
        "message": "Buzzing madness north of Carlin! Be careful if you're allergic!",
        "style": "regular"
      },
      {
        "time": "00:05:00",
        "message": "Willi Wasp the Wicked has arrived!",
        "style": "highlight"
      }
    ]
  },
  "Xenia": {
    "locations": [
      {
        "description": "Amazon Camp (Venore)",
        "mapUrl": "https://tibiamaps.io/map/embed#32891,31887,8:1"
      },
      {
        "description": "Amazon Camp (Venore)",
        "mapUrl": "https://tibiamaps.io/map/embed#32891,31887,9:1"
      }
    ]
  },
  "Yaga the Crone": {
    "locations": [
      {
        "description": "Green Claw Swamp (Venore)",
        "mapUrl": "https://tibiamaps.io/map/embed#32712,32011,11:1"
      }
    ]
  },
  "Yakchal": {
    "locations": [
      {
        "description": "Formorgar Mines (Svargrond)",
        "mapUrl": "https://tibiamaps.io/map/embed#32205,31003,14:1"
      }
    ]
  },
  "Yeti": {
    "locations": [
      {
        "description": "Folda (Carlin)",
        "mapUrl": "https://tibiamaps.io/map/embed#32006,31596,7:1"
      }
    ],
    "loot": [
      "Bunnyslippers"
    ]
  },
  "Zarabustor": {
    "locations": [
      {
        "description": "Demona (Ab'Dendriel)",
        "mapUrl": "https://tibiamaps.io/map/embed#32508,31582,14:1"
      }
    ]
  },
  "Zevelon Duskbringer": {
    "locations": [
      {
        "description": "Hellgate (Ab'Dendriel)",
        "mapUrl": "https://tibiamaps.io/map/embed#32769,31581,11:1"
      }
    ],
    "loot": [
      "Vampire Lord Token"
    ]
  },
  "Zomba": {
    "locations": [
      {
        "description": "Darashia",
        "mapUrl": "https://tibiamaps.io/map/embed#33159,32427,7:1"
      }
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "Hungry lions scout the western Darashian desert. Travellers beware!",
        "style": "regular"
      },
      {
        "time": "00:04:10",
        "message": "Packs of hungry lions stalk Darashia's western desert. Be on your guard!",
        "style": "regular"
      },
      {
        "time": "00:05:00",
        "message": "Hear the roar of Zomba, king of the lions, roaming the Darashia desert!",
        "style": "highlight"
      }
    ]
  },
  "Zulazza the Corruptor": {
    "locations": [
      {
        "description": "Zzaion (Farmine)",
        "mapUrl": "https://tibiamaps.io/map/embed#33347,31609,1:1"
      }
    ],
    "loot": [
      "Dragon Scale Boots",
      "Earthborn Titan Armor"
    ],
    "raidMessages": [
      {
        "time": "00:00:00",
        "message": "A massive orc force is gathering at the gates of Zzaion.",
        "style": "regular"
      },
      {
        "time": "00:03:00",
        "message": "Orc reinforcements have arrived at the gates of Zzaion! The gates are under heavy attack!",
        "style": "regular"
      },
      {
        "time": "00:05:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:07:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:10:00",
        "message": "More orc reinforcements have arrived at the gates of Zzaion! The gates are under heavy attack!",
        "style": "regular"
      },
      {
        "time": "00:11:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:13:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:15:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:17:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:19:00",
        "message": "(unannounced raid)",
        "style": "unannounced"
      },
      {
        "time": "00:20:00",
        "message": "The gates to Zzaion have been breached! Orcs are invading the city!",
        "style": "regular"
      },
      {
        "time": "00:30:00",
        "message": "More orcs have arrived in Zzaion! The city is under attack! Strong lizard leaders have come to defend the city.",
        "style": "highlight"
      }
    ]
  },
  "Zushuka": {
    "locations": [
      {
        "description": "Ice Witch Temple (Svargrond)",
        "mapUrl": "https://tibiamaps.io/map/embed#31942,31387,9:1"
      }
    ],
    "loot": [
      "Icy Culottes",
      "Trapped Lightning"
    ]
  }
} as const

export function getBossInfo(name: string) {
  return bossInfo[name]
}
