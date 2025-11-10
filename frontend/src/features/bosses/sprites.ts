const bossSpriteModules = import.meta.glob('@/assets/bosses/*', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const spriteMap = new Map<string, string>()

for (const [path, src] of Object.entries(bossSpriteModules)) {
  const fileName = path.split('/').pop() ?? ''
  const base = decodeURIComponent(fileName.replace(/\.[a-z0-9]+$/i, ''))
  const lower = base.toLowerCase()
  const slug = slugify(lower)

  spriteMap.set(lower, src)
  spriteMap.set(slug, src)
}

const FALLBACK_BASE = 'https://static.tibia.com/images/charactertrade/bosses'

export function getBossSprite(name: string) {
  const lower = name.toLowerCase()
  const slug = slugify(lower)
  if (spriteMap.has(lower)) return spriteMap.get(lower)!
  if (spriteMap.has(slug)) return spriteMap.get(slug)!
  return `${FALLBACK_BASE}/${encodeURIComponent(name)}.gif`
}

function slugify(value: string) {
  return value.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
