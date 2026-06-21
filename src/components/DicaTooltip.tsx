'use client'

import { Info } from 'lucide-react'
import { useState } from 'react'

export default function DicaTooltip({ texto }: { texto: string }) {
  const [aberto, setAberto] = useState(false)

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setAberto(true)}
        onMouseLeave={() => setAberto(false)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <Info size={14} />
      </button>
      {aberto && (
        <span className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-xs bg-slate-800 text-white rounded shadow-lg whitespace-nowrap">
          {texto}
        </span>
      )}
    </span>
  )
}
