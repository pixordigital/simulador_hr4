'use client'

import { useState } from 'react'
import { Play, Edit3, Trash2 } from 'lucide-react'

type Template = {
  id: string
  nome: string
  tipo: string
  cliente: string
}

export default function TemplatesPage() {
  const [templates] = useState<Template[]>([])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Templates</h1>

      {templates.length === 0 ? (
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-12 text-center">
          <p className="text-[rgb(var(--muted-foreground))] mb-2">Nenhum template salvo</p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Após realizar uma simulação, você pode salvá-la como template para reutilizar depois.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <div key={t.id} className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{t.nome}</p>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">{t.tipo} — {t.cliente}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                  <Play size={14} /> Usar
                </button>
                <button className="p-2 text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] rounded-lg transition-colors">
                  <Edit3 size={14} />
                </button>
                <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
