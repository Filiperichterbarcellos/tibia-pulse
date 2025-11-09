// src/features/bazaar/Pagination.tsx
import React from 'react'

type Props = {
  page: number
  onPage: (p: number) => void
}

export default function Pagination({ page, onPage }: Props) {
  const prev = () => onPage(Math.max(1, page - 1))
  const next = () => onPage(page + 1)

  return (
    <div className="mt-6 flex items-center gap-2">
      <button
        type="button"
        className="rounded-lg border border-zinc-700 px-3 py-1 text-sm disabled:opacity-50"
        onClick={prev}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        ← Anterior
      </button>

      <span className="min-w-10 text-center text-sm text-zinc-300">
        pág. {page}
      </span>

      <button
        type="button"
        className="rounded-lg border border-zinc-700 px-3 py-1 text-sm"
        onClick={next}
        aria-label="Próxima página"
      >
        Próxima →
      </button>
    </div>
  )
}
