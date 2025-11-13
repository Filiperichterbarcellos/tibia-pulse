/* eslint-disable no-console */
const urls = (process.env.API_WARMUP_URLS || '')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

const initialDelay = Number(process.env.API_WARMUP_DELAY ?? 4000)

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function hit(url) {
  try {
    console.log('[warmup] requesting', url)
    const res = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'tibia-pulse-warmup' },
    })
    console.log('[warmup] status', res.status)
  } catch (err) {
    console.error('[warmup] failed', url, err?.message ?? err)
  }
}

async function main() {
  if (!urls.length) {
    console.log('[warmup] API_WARMUP_URLS empty, skipping')
    return
  }
  if (initialDelay > 0) {
    console.log(`[warmup] waiting ${initialDelay}ms before requests`)
    await sleep(initialDelay)
  }
  for (const url of urls) {
    await hit(url)
  }
}

main().catch((err) => {
  console.error('[warmup] unexpected error', err)
  process.exitCode = 1
})
