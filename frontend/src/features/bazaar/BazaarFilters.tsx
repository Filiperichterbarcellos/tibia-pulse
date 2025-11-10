import clsx from 'clsx'
import { ORDER_FIELDS, ORDER_DIR, VOCATION_LABEL } from './constants'
import type { AuctionFilters } from './api'
import euFlag from '@/assets/eu-flag.png'
import naFlag from '@/assets/na-flag.png'
import brFlag from '@/assets/br-flag.png'
import oceFlag from '@/assets/oce-flag.png'
import greenBattleye from '@/assets/greenbattleye.png'
import yellowBattleye from '@/assets/yellowbattleye.png'
import sorcererPng from '@/assets/sorcerer.png'
import druidPng from '@/assets/druid.png'
import paladinPng from '@/assets/paladin.png'
import knightPng from '@/assets/knight.png'
import monkPng from '@/assets/monk.png'
import dovePng from '@/assets/dove.png'
import { Search } from 'lucide-react'
import { useMemo } from 'react'

export type BazaarUiFilters = {
  nickname: string
  onlyBidded: boolean
  pvp?: string
  battleye?: 'green' | 'yellow'
  location?: 'EU' | 'NA' | 'BR' | 'OCE'
  storeItems: string[]
}

export const DEFAULT_UI_FILTERS: BazaarUiFilters = {
  nickname: '',
  onlyBidded: false,
  pvp: undefined,
  battleye: undefined,
  location: undefined,
  storeItems: [],
}

export const STORE_FILTER_OPTIONS = [
  { value: 'training-dummy', label: 'Training Dummy' },
  { value: 'charm-expansion', label: 'Charm Expansion' },
  { value: 'imbuement-shrine', label: 'Imbuement Shrine' },
  { value: 'gold-pouch', label: 'Gold Pouch' },
  { value: 'hirelings', label: 'Hirelings' },
  { value: 'prey-slot', label: 'Prey Slot' },
  { value: 'hunting-slot', label: 'Hunting Task Slot' },
  { value: 'reward-shrine', label: 'Reward Shrine' },
  { value: 'mailbox', label: 'Mailbox' },
] as const

type Props = {
  apiFilters: AuctionFilters
  onApiFiltersChange: (v: AuctionFilters) => void
  uiFilters: BazaarUiFilters
  onUiFiltersChange: (v: BazaarUiFilters) => void
}

const VOCATION_ORDER = ['None', 'Sorcerer', 'Druid', 'Paladin', 'Knight', 'Monk']
const VOCATION_ICONS: Record<string, string> = {
  Sorcerer: sorcererPng,
  'Master Sorcerer': sorcererPng,
  Druid: druidPng,
  'Elder Druid': druidPng,
  Paladin: paladinPng,
  'Royal Paladin': paladinPng,
  Knight: knightPng,
  'Elite Knight': knightPng,
  Monk: monkPng,
  None: dovePng,
}

const PVP_OPTIONS = ['Optional', 'Open', 'Retro Open', 'Hardcore', 'Retro Hardcore'] as const
const LOCATION_OPTIONS = [
  { value: 'EU', label: 'EU', icon: euFlag },
  { value: 'NA', label: 'NA', icon: naFlag },
  { value: 'BR', label: 'BR', icon: brFlag },
  { value: 'OCE', label: 'OCE', icon: oceFlag },
] as const

const battleyeOptions = [
  { value: 'green' as const, label: 'Green', icon: greenBattleye },
  { value: 'yellow' as const, label: 'Yellow', icon: yellowBattleye },
]

export default function BazaarFilters({
  apiFilters,
  onApiFiltersChange,
  uiFilters,
  onUiFiltersChange,
}: Props) {
  const setApi = (patch: Partial<AuctionFilters>) =>
    onApiFiltersChange({ ...apiFilters, ...patch, page: 1 })

  const setUi = (patch: Partial<BazaarUiFilters>) =>
    onUiFiltersChange({ ...uiFilters, ...patch })

  const vocationOptions = useMemo(() => {
    const labels = Object.keys(VOCATION_LABEL)
    return VOCATION_ORDER.filter((v) => labels.includes(v))
  }, [])

  return (
    <div className="retro-panel space-y-6">
      <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <label className="retro-input">
          <span>Search nickname</span>
          <div className="retro-input__field">
            <Search className="size-4 text-indigo-500" />
            <input
              type="text"
              placeholder="Ex.: Kaamez"
              value={uiFilters.nickname}
              onChange={(e) => setUi({ nickname: e.target.value })}
            />
          </div>
        </label>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            className="retro-checkbox"
            checked={uiFilters.onlyBidded}
            onChange={(e) => setUi({ onlyBidded: e.target.checked })}
          />
          Bidded only
        </label>
      </section>

      <section>
        <p className="filter-label">Vocation</p>
        <div className="filter-chip-row">
          {vocationOptions.map((voc) => (
            <FilterChip
              key={voc}
              active={apiFilters.vocation === voc}
              onClick={() =>
                setApi({ vocation: apiFilters.vocation === voc ? undefined : (voc as any) })
              }
              iconSrc={VOCATION_ICONS[voc]}
            >
              {VOCATION_LABEL[voc] ?? voc}
            </FilterChip>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="filter-label">PvP</p>
          <div className="filter-chip-row">
            {PVP_OPTIONS.map((label) => (
              <FilterChip
                key={label}
                active={uiFilters.pvp === label}
                onClick={() => setUi({ pvp: uiFilters.pvp === label ? undefined : label })}
              >
                {label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div>
          <p className="filter-label">BattlEye</p>
          <div className="filter-chip-row">
            {battleyeOptions.map((option) => (
              <FilterChip
                key={option.value}
                active={uiFilters.battleye === option.value}
                onClick={() =>
                  setUi({
                    battleye: uiFilters.battleye === option.value ? undefined : option.value,
                  })
                }
                iconSrc={option.icon}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="filter-label">Server location</p>
          <div className="filter-chip-row">
            {LOCATION_OPTIONS.map((option) => (
              <FilterChip
                key={option.value}
                active={uiFilters.location === option.value}
                onClick={() =>
                  setUi({
                    location: uiFilters.location === option.value ? undefined : option.value,
                  })
                }
                iconSrc={option.icon}
              >
                {option.label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <label className="retro-input">
            <span>Server</span>
            <div className="retro-input__field">
              <input
                type="text"
                placeholder="Ex.: Antica"
                value={apiFilters.world ?? ''}
                onChange={(e) => setApi({ world: e.target.value || undefined })}
              />
            </div>
          </label>

          <div className="flex gap-3">
            <label className="retro-input">
              <span>Min level</span>
              <div className="retro-input__field">
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={apiFilters.minLevel ?? ''}
                  onChange={(e) =>
                    setApi({
                      minLevel: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </label>

            <label className="retro-input">
              <span>Max level</span>
              <div className="retro-input__field">
                <input
                  type="number"
                  min={0}
                  placeholder="1500"
                  value={apiFilters.maxLevel ?? ''}
                  onChange={(e) =>
                    setApi({
                      maxLevel: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                />
              </div>
            </label>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <label className="retro-input">
          <span>Order by</span>
          <div className="retro-input__field">
            <select
              value={apiFilters.order ?? 'price'}
              onChange={(e) => setApi({ order: e.target.value as any })}
            >
              {ORDER_FIELDS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </label>

        <label className="retro-input">
          <span>Direction</span>
          <div className="retro-input__field">
            <select
              value={apiFilters.sort ?? 'desc'}
              onChange={(e) => setApi({ sort: e.target.value as any })}
            >
              {ORDER_DIR.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </label>
      </section>

      <section>
        <p className="filter-label mb-3">Store items</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {STORE_FILTER_OPTIONS.map((option) => (
            <label key={option.value} className="store-checkbox">
              <input
                type="checkbox"
                checked={uiFilters.storeItems.includes(option.value)}
                onChange={(e) => {
                  const selected = new Set(uiFilters.storeItems)
                  if (e.target.checked) selected.add(option.value)
                  else selected.delete(option.value)
                  setUi({ storeItems: Array.from(selected) })
                }}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </section>
    </div>
  )
}

type ChipProps = {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  iconSrc?: string
}

function FilterChip({ active, onClick, children, iconSrc }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx('filter-chip', active && 'filter-chip--active')}
    >
      {iconSrc && <img src={iconSrc} alt="" className="size-4 shrink-0" />}
      <span>{children}</span>
    </button>
  )
}
