'use client'

import { useEffect, useState } from 'react'
import { Check, AlertTriangle, X } from 'lucide-react'

type Tipo = 'sucesso' | 'erro' | 'info'

type ToastItem = {
  id: string
  tipo: Tipo
  mensagem: string
}

let toastId = 0
const listeners: Set<(t: ToastItem) => void> = new Set()

export function dispararToast(tipo: Tipo, mensagem: string) {
  const item: ToastItem = { id: String(++toastId), tipo, mensagem }
  listeners.forEach(fn => fn(item))
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const handler = (t: ToastItem) => {
      setToasts(prev => [...prev, t])
      setTimeout(() => {
        setToasts(prev => prev.filter(x => x.id !== t.id))
      }, 3500)
    }
    listeners.add(handler)
    return () => { listeners.delete(handler) }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => {
        const cores = {
          sucesso: { bg: '#15803D', icon: Check },
          erro: { bg: '#B91C1C', icon: AlertTriangle },
          info: { bg: '#1E40AF', icon: X },
        }
        const c = cores[t.tipo]
        const Icon = c.icon
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-[6px] shadow-[0_4px_16px_rgba(0,0,0,0.15)] text-white text-sm font-medium animate-[toastIn_0.25s_ease-out]"
            style={{ background: c.bg }}
          >
            <Icon size={16} strokeWidth={2} />
            {t.mensagem}
          </div>
        )
      })}
    </div>
  )
}
