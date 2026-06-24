'use client'

import { useState, useEffect } from 'react'
import { Search, TrendingUp, DollarSign, Truck, BarChart3, Clock } from 'lucide-react'

type Simulacao = {
  id: string
  criadoEm: string
  nomeCliente: string
  tipoEntrega: string
  agendada: boolean
  margemPct: number
  inputJson: any
  resultadoJson: any
  precoCobrado?: number
  observacoes?: string
}

type Pagamento = {
  id: string
  motoristaId: string
  valor: number
  dataPagamento: string
}

export default function HistoricoPage() {
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [editandoCobrado, setEditandoCobrado] = useState<string | null>(null)
  const [cobradoEdit, setCobradoEdit] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const [simRes, pagRes] = await Promise.all([
        fetch('/api/dinamico?tipo=simulacoes'),
        fetch('/api/dinamico?tipo=pagamentos'),
      ])
      if (simRes.ok) setSimulacoes(await simRes.json())
      if (pagRes.ok) setPagamentos(await pagRes.json())
    } catch {}
  }

  async function salvarPrecoCobrado(sim: Simulacao) {
    try {
      const res = await fetch(`/api/dinamico?tipo=simulacoes&id=${sim.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ precoCobrado: parseFloat(cobradoEdit) || 0 }),
      })
      if (res.ok) {
        setSimulacoes(simulacoes.map(s => (s.id === sim.id ? { ...s, precoCobrado: parseFloat(cobradoEdit) || 0 } : s)))
        setEditandoCobrado(null)
      }
    } catch {}
  }

  const filtradas = simulacoes.filter(s => {
    if (filtroCliente && !s.nomeCliente?.toLowerCase().includes(filtroCliente.toLowerCase())) return false
    if (filtroTipo && s.tipoEntrega !== filtroTipo) return false
    if (dataInicio && new Date(s.criadoEm) < new Date(dataInicio)) return false
    if (dataFim) {
      const fim = new Date(dataFim)
      fim.setDate(fim.getDate() + 1)
      if (new Date(s.criadoEm) > fim) return false
    }
    return true
  })

  // Dashboard
  const totalSugerido = simulacoes.reduce((s, sim) => s + (sim.resultadoJson?.precoSugerido || 0), 0)
  const totalCobradoArr = simulacoes.filter(s => s.precoCobrado)
  const totalCobrado = totalCobradoArr.reduce((s, sim) => s + (sim.precoCobrado || 0), 0)
  const custoFreelancers = pagamentos.reduce((s, p) => s + p.valor, 0)
  const margemReal = totalCobrado > 0 ? ((totalCobrado - custoFreelancers) / totalCobrado) * 100 : 0

  function formatarMoeda(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatarData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-text-primary" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Histórico
        </h1>
        <p className="text-sm text-text-secondary mt-1">Acompanhe a rentabilidade e consulte simulações passadas</p>
      </div>

      {/* Dashboard de Rentabilidade */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">Total Sugerido</p>
          <p className="text-[32px] font-num font-medium text-text-primary mt-1">{formatarMoeda(totalSugerido)}</p>
          <p className="text-[11px] text-text-secondary mt-1">Soma dos preços sugeridos</p>
        </div>
        <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">Total Cobrado</p>
          <p className="text-[32px] font-num font-medium text-text-primary mt-1">{formatarMoeda(totalCobrado)}</p>
          <p className="text-[11px] text-text-secondary mt-1">{totalCobradoArr.length} de {simulacoes.length} registrados</p>
        </div>
        <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">Custo Freelancers</p>
          <p className="text-[32px] font-num font-medium text-text-primary mt-1">{formatarMoeda(custoFreelancers)}</p>
          <p className="text-[11px] text-text-secondary mt-1">Total de pagamentos</p>
        </div>
        <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary">Margem Real</p>
          <p className={`text-[32px] font-num font-medium mt-1 ${margemReal >= 0 ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
            {simulacoes.length > 0 ? `${margemReal.toFixed(1)}%` : '—'}
          </p>
          <p className="text-[11px] text-text-secondary mt-1">(Cobrado − Custo) ÷ Cobrado</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={15} className="text-text-secondary" />
          <span className="text-[13px] font-medium text-text-primary">Filtros</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-1">Cliente</label>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={filtroCliente}
                onChange={e => setFiltroCliente(e.target.value)}
                placeholder="Buscar..."
                className="w-full h-[34px] pl-8 pr-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2 placeholder:text-[#A8A29E] dark:placeholder:text-[#6B7280]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="w-full h-[34px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
            >
              <option value="">Todos</option>
              <option value="regular">Regular</option>
              <option value="dedicada">Dedicada</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-1">Data início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="w-full h-[34px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-1">Data fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              className="w-full h-[34px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
            />
          </div>
        </div>
      </div>

      {/* Tabela */}
      {filtradas.length === 0 ? (
        <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-12 text-center">
          <p className="text-text-secondary font-medium">Nenhuma simulação encontrada</p>
          <p className="text-sm text-[#A8A29E] mt-1">As simulações salvas aparecerão aqui.</p>
        </div>
      ) : (
        <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#E0DFDD] dark:border-[#1F2937] bg-[#EBEBEA] dark:bg-[#1F2937]">
                <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary">Data</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary">Cliente</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary">Tipo</th>
                <th className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary">Paradas</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary">Custo</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary">Margem</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary">Sugerido</th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-text-secondary">Cobrado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0DFDD] dark:divide-[#1F2937]">
              {filtradas.map(sim => {
                const custoTotal = sim.resultadoJson?.totalGeral || 0
                const precoSugerido = sim.resultadoJson?.precoSugerido || 0
                const paradasStr = sim.inputJson?.paradas
                  ? sim.inputJson.paradas.map((p: any) => `${p.zona || '?'} ${p.pesoReal || 0}kg`).join(' · ')
                  : sim.tipoEntrega === 'dedicada' ? `Dedicada ${sim.inputJson?.kmEstimadoDedicada || 0}km` : '—'
                const isDiferente = sim.precoCobrado && Math.abs(sim.precoCobrado - precoSugerido) > 0.01

                return (
                  <tr key={sim.id} className="hover:bg-[#EBEBEA] dark:hover:bg-[#1F2937]/50 transition-colors">
                    <td className="px-4 py-3 text-text-secondary">{formatarData(sim.criadoEm)}</td>
                    <td className="px-4 py-3 text-text-primary font-medium">{sim.nomeCliente || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-[3px] bg-[#EBEBEA] dark:bg-[#1F2937] text-text-secondary">
                        {sim.tipoEntrega === 'dedicada' ? 'Dedicada' : sim.agendada ? 'Agendada' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary max-w-[200px] truncate">{paradasStr}</td>
                    <td className="px-4 py-3 text-right font-num text-text-primary">{formatarMoeda(custoTotal)}</td>
                    <td className="px-4 py-3 text-right font-num text-text-primary">{sim.margemPct}%</td>
                    <td className="px-4 py-3 text-right font-num text-text-primary">{formatarMoeda(precoSugerido)}</td>
                    <td className="px-4 py-3 text-right">
                      {editandoCobrado === sim.id ? (
                        <div className="flex items-center gap-1 justify-end">
                          <input
                            type="number"
                            value={cobradoEdit}
                            onChange={e => setCobradoEdit(e.target.value)}
                            step="0.01"
                            className="w-24 h-[30px] px-2 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-right font-num outline-none focus:border-[#F97316] focus:border-2"
                            autoFocus
                          />
                          <button
                            onClick={() => salvarPrecoCobrado(sim)}
                            className="text-[11px] font-medium text-[#15803D] hover:text-[#15803D]/80"
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setEditandoCobrado(null)}
                            className="text-[11px] font-medium text-text-secondary hover:text-text-primary"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditandoCobrado(sim.id)
                            setCobradoEdit(String(sim.precoCobrado || ''))
                          }}
                          className={`font-num cursor-pointer hover:underline ${
                            sim.precoCobrado
                              ? isDiferente
                                ? sim.precoCobrado! > precoSugerido
                                  ? 'text-[#15803D]'
                                  : 'text-[#B91C1C]'
                                : 'text-text-primary'
                              : 'text-[#A8A29E]'
                          }`}
                        >
                          {sim.precoCobrado ? formatarMoeda(sim.precoCobrado) : '—'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
