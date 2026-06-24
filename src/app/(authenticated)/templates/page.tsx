'use client'

import { useState, useEffect } from 'react'
import { Play, Edit3, Trash2, Search } from 'lucide-react'
import Link from 'next/link'

type Template = {
  id: string
  nome: string
  descricao?: string
  tipo?: string
  cliente?: string
  criadoEm: string
  atualizadoEm?: string
  inputJson: any
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [busca, setBusca] = useState('')

  useEffect(() => {
    fetch('/api/dinamico?tipo=templates')
      .then(r => r.ok ? r.json() : [])
      .then(setTemplates)
      .catch(() => {})
  }, [])

  const filtrados = templates.filter(t =>
    t.nome.toLowerCase().includes(busca.toLowerCase()) ||
    t.cliente?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-text-primary" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Templates
        </h1>
        <p className="text-sm text-text-secondary mt-1">Simulações salvas como modelo para reutilização</p>
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou cliente..."
          className="w-full h-[34px] pl-9 pr-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2 placeholder:text-[#A8A29E] dark:placeholder:text-[#6B7280]"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-12 text-center">
          <p className="text-text-secondary font-medium">Nenhum template salvo</p>
          <p className="text-sm text-[#A8A29E] mt-1">Após realizar uma simulação, você pode salvá-la como template para reutilizar depois.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map(t => (
            <div key={t.id} className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-4 flex items-center justify-between hover:bg-[#EBEBEA] dark:hover:bg-[#1F2937]/50 transition-colors">
              <div>
                <p className="text-sm font-medium text-text-primary">{t.nome}</p>
                <p className="text-[13px] text-text-secondary">
                  {t.cliente || '—'} &middot; {new Date(t.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/simulacao">
                  <button className="h-[34px] px-4 bg-[#F97316] text-white text-sm font-medium rounded-[4px] hover:bg-[#C2590A] transition-colors flex items-center gap-2">
                    <Play size={14} />
                    Usar
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
