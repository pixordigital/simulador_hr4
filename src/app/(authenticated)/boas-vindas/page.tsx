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
    <div className="h-full flex flex-col items-center justify-center max-w-[480px] mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-[4px] bg-gradient-to-br from-[#F97316] to-[#C2590A] flex items-center justify-center">
          <span className="text-white font-bold text-[10px]">HR</span>
        </div>
        <span className="text-[11px] font-bold tracking-widest text-[var(--text-secondary)] uppercase">HR Cargo</span>
      </div>

      <h1 className="text-xl font-bold text-center mb-1 text-[var(--text-primary)] font-display">
        Configure o simulador antes de começar.
      </h1>

      <div className="w-8 border-t border-[var(--border)] mx-auto my-4" />

      <div className="w-full space-y-1">
        {itens.map(item => (
          <div key={item.key} className="flex items-center justify-between py-2 px-3 rounded-[4px] hover:bg-[color-mix(in_srgb,var(--surface-sunken)_40%,transparent)] transition-colors">
            <div className="flex items-center gap-2">
              {item.completo ? (
                <CheckCircle2 size={18} className="text-[var(--semantic-gain)] flex-shrink-0" />
              ) : (
                <Circle size={18} className="text-[var(--text-disabled)] flex-shrink-0" />
              )}
              <span className={`text-sm ${item.completo ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)] font-medium'}`}>
                {item.label}
              </span>
            </div>
            <Link href={item.link} className="text-xs font-medium text-[var(--brand-orange)] hover:text-[var(--brand-orange-dim)] transition-colors flex items-center gap-1">
              {item.completo ? 'Editar' : 'Configurar'} →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-5 text-center">
        <Link
          href="/simulacao"
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-sm font-semibold transition-all duration-150 ${
            criticosCompletos
              ? 'bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-dim)]'
              : 'border border-[var(--input)] text-[var(--text-primary)] hover:bg-[var(--surface-sunken)]'
          }`}
        >
          {criticosCompletos ? 'Ir para Nova Simulação' : 'Começar assim mesmo'}
          <ArrowRight size={15} strokeWidth={2} />
        </Link>
      </div>
    </div>
  )
}
