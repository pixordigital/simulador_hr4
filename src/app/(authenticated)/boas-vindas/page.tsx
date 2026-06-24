'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react'

type ChecklistItem = {
  key: string
  label: string
  link: string
  critico: boolean
  completo: boolean
}

export default function BoasVindasPage() {
  const [itens, setItens] = useState<ChecklistItem[]>([
    { key: 'combustivel', label: 'Configure o preço do combustível', link: '/configuracoes', critico: true, completo: false },
    { key: 'tabela', label: 'Preencha sua tabela de preços', link: '/configuracoes', critico: true, completo: false },
    { key: 'motoristas', label: 'Cadastre seus motoristas freelancers', link: '/motoristas', critico: true, completo: false },
    { key: 'margem', label: 'Defina sua margem padrão', link: '/configuracoes', critico: true, completo: false },
    { key: 'agendamento', label: 'Defina o acréscimo de agendamento', link: '/configuracoes', critico: false, completo: false },
  ])

  useEffect(() => { verificarConfig() }, [])

  async function verificarConfig() {
    try {
      const [geralRes, motoristasRes, taxasRes] = await Promise.all([
        fetch('/api/configuracoes?tipo=geral'),
        fetch('/api/configuracoes?tipo=motoristas'),
        fetch('/api/configuracoes?tipo=taxas'),
      ])
      const [geral, motoristas, taxas] = await Promise.all([geralRes.json(), motoristasRes.json(), taxasRes.json()])
      const updates: Partial<Record<string, boolean>> = {}

      const kangooLitro = motoristas?.veiculos?.KANGOO?.precoCombustivelLitro
      const oitoLitro = motoristas?.veiculos?.['8-160']?.precoCombustivelLitro
      updates.combustivel = (kangooLitro && kangooLitro > 0) || (oitoLitro && oitoLitro > 0)

      const temPreco = Array.isArray(taxas) && taxas.some(z => z.faixas?.some((f: any) => f.precoPorKg > 0))
      updates.tabela = temPreco

      try {
        const motRes = await fetch('/api/dinamico?tipo=motoristas')
        const motData = await motRes.json()
        updates.motoristas = Array.isArray(motData) && motData.length > 0
      } catch { updates.motoristas = false }

      updates.margem = geral?.margemPadrao > 0
      updates.agendamento = geral?.acrescimoAgendamento > 0

      setItens(prev => prev.map(item => ({ ...item, completo: updates[item.key] ?? item.completo })))
    } catch {}
  }

  const criticosCompletos = itens.filter(i => i.critico).every(i => i.completo)

  return (
    <div className="max-w-[560px] mx-auto pt-20">
      {/* Brand */}
      <div className="flex items-center gap-2.5 mb-8 justify-center">
        <div className="w-8 h-8 rounded-[5px] bg-gradient-to-br from-[#F97316] to-[#C2590A] flex items-center justify-center shadow-sm shadow-[#F97316]/20">
          <span className="text-white font-bold text-xs">HR</span>
        </div>
        <span className="text-xs font-bold tracking-widest text-[var(--text-secondary)] uppercase">HR Cargo</span>
      </div>

      <h1 className="text-[28px] font-bold text-center mb-2 text-[var(--text-primary)] font-display">
        Configure o simulador antes de começar.
      </h1>

      <div className="w-10 border-t border-[var(--border)] mx-auto my-8" />

      {/* Checklist */}
      <div className="space-y-2">
        {itens.map(item => (
          <div key={item.key} className="flex items-center justify-between py-3 px-4 rounded-[4px] hover:bg-[color-mix(in_srgb,var(--surface-sunken)_40%,transparent)] transition-colors">
            <div className="flex items-center gap-3">
              {item.completo ? (
                <CheckCircle2 size={20} className="text-[var(--semantic-gain)] flex-shrink-0" />
              ) : (
                <Circle size={20} className="text-[var(--text-disabled)] flex-shrink-0" />
              )}
              <span className={`text-sm ${item.completo ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)] font-medium'}`}>
                {item.label}
              </span>
            </div>
            <Link href={item.link} className="text-[13px] font-medium text-[var(--brand-orange)] hover:text-[var(--brand-orange-dim)] transition-colors flex items-center gap-1">
              {item.completo ? 'Editar' : 'Configurar'} →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/simulacao"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-[6px] text-sm font-semibold transition-all duration-150 ${
            criticosCompletos
              ? 'bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-dim)] shadow-sm'
              : 'border border-[var(--input)] text-[var(--text-primary)] hover:bg-[var(--surface-sunken)]'
          }`}
        >
          {criticosCompletos ? 'Ir para Nova Simulação' : 'Começar assim mesmo'}
          <ArrowRight size={16} strokeWidth={2} />
        </Link>
      </div>
    </div>
  )
}
