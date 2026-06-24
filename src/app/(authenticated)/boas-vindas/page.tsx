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

  useEffect(() => {
    verificarConfig()
  }, [])

  async function verificarConfig() {
    try {
      const [geralRes, motoristasRes, taxasRes] = await Promise.all([
        fetch('/api/configuracoes?tipo=geral'),
        fetch('/api/configuracoes?tipo=motoristas'),
        fetch('/api/configuracoes?tipo=taxas'),
      ])
      const [geral, motoristas, taxas] = await Promise.all([geralRes.json(), motoristasRes.json(), taxasRes.json()])

      const updates: Partial<Record<string, boolean>> = {}

      // Combustível
      const kangooLitro = motoristas?.veiculos?.KANGOO?.precoCombustivelLitro
      const oitoLitro = motoristas?.veiculos?.['8-160']?.precoCombustivelLitro
      updates.combustivel = (kangooLitro && kangooLitro > 0) || (oitoLitro && oitoLitro > 0)

      // Tabela de preços
      const temPreco = Array.isArray(taxas) && taxas.some(z => z.faixas?.some((f: any) => f.precoPorKg > 0))
      updates.tabela = temPreco

      // Motoristas
      try {
        const motRes = await fetch('/api/dinamico?tipo=motoristas')
        const motData = await motRes.json()
        updates.motoristas = Array.isArray(motData) && motData.length > 0
      } catch { updates.motoristas = false }

      // Margem padrão
      updates.margem = geral?.margemPadrao > 0

      // Agendamento
      updates.agendamento = geral?.acrescimoAgendamento > 0

      setItens(prev => prev.map(item => ({
        ...item,
        completo: updates[item.key] ?? item.completo,
      })))
    } catch {}
  }

  const criticosCompletos = itens.filter(i => i.critico).every(i => i.completo)

  return (
    <div className="max-w-[640px] mx-auto pt-16">
      <div className="text-center mb-2">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">HR Cargo</h2>
      </div>

      <h1
        className="text-[28px] font-bold text-center mb-2 text-text-primary"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Configure o simulador antes de começar.
      </h1>

      <div className="w-12 border-t border-[#E0DFDD] dark:border-[#1F2937] mx-auto my-8" />

      <div className="space-y-3">
        {itens.map(item => (
          <div key={item.key} className="flex items-center justify-between py-3 border-b border-[#E0DFDD] dark:border-[#1F2937]">
            <div className="flex items-center gap-3">
              {item.completo ? (
                <CheckCircle2 size={20} className="text-[#15803D] flex-shrink-0" />
              ) : (
                <Circle size={20} className="text-text-secondary flex-shrink-0" />
              )}
              <span className={`text-sm ${item.completo ? 'text-text-secondary line-through' : 'text-text-primary font-medium'}`}>
                {item.label}
              </span>
            </div>
            <Link
              href={item.link}
              className="text-[13px] font-medium text-[#F97316] hover:text-[#C2590A] transition-colors flex items-center gap-1"
            >
              {item.completo ? 'Editar' : 'Configurar'} →
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/simulacao"
          className={`inline-flex items-center gap-2 px-6 py-3 rounded-[6px] text-sm font-semibold transition-colors ${
            criticosCompletos
              ? 'bg-[#F97316] text-white hover:bg-[#C2590A]'
              : 'border border-[#A8A29E] dark:border-[#374151] text-text-primary hover:bg-[#EBEBEA] dark:hover:bg-[#1F2937]'
          }`}
        >
          {criticosCompletos ? 'Ir para Nova Simulação' : 'Começar assim mesmo'}
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
