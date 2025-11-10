// src/features/bazaar/Pagination.tsx
import React from 'react'

type Props = {
  page: number
  totalPages?: number
  onPage: (p: number) => void
}

export default function Pagination({ page, totalPages = 1, onPage }: Props) {
  const clampedTotal = Math.max(1, totalPages)
  const canGoPrev = page > 1
  const canGoNext = page < clampedTotal
  const prev = () => canGoPrev && onPage(Math.max(1, page - 1))
  const next = () => canGoNext && onPage(page + 1)

  return (
    <div className="mt-6 flex items-center gap-2">
      <button
        type="button"
        className="rounded-lg border border-zinc-700 px-3 py-1 text-sm disabled:opacity-50"
        onClick={prev}
        disabled={!canGoPrev}
        aria-label="Página anterior"
      >
        ← Anterior
      </button>

      <span className="min-w-10 text-center text-sm text-zinc-300">
        pág. {page} / {clampedTotal}
      </span>

      <button
        type="button"
        className="rounded-lg border border-zinc-700 px-3 py-1 text-sm"
        onClick={next}
        disabled={!canGoNext}
        aria-label="Próxima página"
      >
        Próxima →
      </button>
    </div>
  )
}
