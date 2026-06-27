'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { Search, TrendingUp, DollarSign, Truck, BarChart3, Clock, Filter, Copy, Download, FileDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { dispararToast } from '@/components/Toast'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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
  const router = useRouter()
  const relatorioRef = useRef<HTMLDivElement>(null)
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([])
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [editandoCobrado, setEditandoCobrado] = useState<string | null>(null)
  const [cobradoEdit, setCobradoEdit] = useState('')
  const [agruparPor, setAgruparPor] = useState<'none' | 'cliente' | 'data' | 'mes'>('none')
  const [gruposExpandidos, setGruposExpandidos] = useState<Set<string>>(new Set())

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

  const grupos = useMemo(() => {
    if (agruparPor === 'none') return null
    const map = new Map<string, Simulacao[]>()
    for (const sim of filtradas) {
      let chave: string
      if (agruparPor === 'cliente') {
        chave = sim.nomeCliente || 'Sem Cliente'
      } else if (agruparPor === 'data') {
        chave = new Date(sim.criadoEm).toLocaleDateString('pt-BR')
      } else { // mes
        const d = new Date(sim.criadoEm)
        chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      }
      if (!map.has(chave)) map.set(chave, [])
      map.get(chave)!.push(sim)
    }
    const entries = Array.from(map.entries())
    if (agruparPor === 'cliente') entries.sort((a, b) => a[0].localeCompare(b[0]))
    else entries.sort((a, b) => b[0].localeCompare(a[0]))
    return entries
  }, [filtradas, agruparPor])

  function labelGrupo(chave: string): string {
    if (agruparPor === 'mes') {
      const [ano, mes] = chave.split('-')
      return new Date(parseInt(ano), parseInt(mes) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    }
    return chave
  }

  function formatarMoeda(v: number) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  function formatarData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  function renderSimRow(sim: Simulacao) {
    const custoTotal = sim.resultadoJson?.totalGeral || 0
    const precoSugerido = sim.resultadoJson?.precoSugerido || 0
    const paradasStr = sim.inputJson?.paradas
      ? sim.inputJson.paradas.map((p: any) => `${p.zona || '?'} ${p.pesoReal || 0}kg`).join(' · ')
      : sim.tipoEntrega === 'dedicada' ? `Dedicada ${sim.inputJson?.kmEstimadoDedicada || 0}km` : '—'
    const isDiferente = sim.precoCobrado && Math.abs(sim.precoCobrado - precoSugerido) > 0.01

    return (
      <tr key={sim.id} className="hover:bg-[color-mix(in_srgb,var(--surface-sunken)_40%,transparent)] transition-colors">
        <td className="px-4 py-3 text-[var(--text-secondary)]">{formatarData(sim.criadoEm)}</td>
        <td className="px-4 py-3 text-[var(--text-primary)] font-medium">{sim.nomeCliente || '—'}</td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-[3px] bg-[var(--surface-sunken)] text-[var(--text-secondary)] uppercase tracking-[0.04em]">
            {sim.tipoEntrega === 'dedicada' ? 'Dedicada' : sim.agendada ? 'Agendada' : 'Regular'}
          </span>
        </td>
        <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[200px] truncate">{paradasStr}</td>
        <td className="px-4 py-3 text-right font-num text-[var(--text-primary)]">{formatarMoeda(custoTotal)}</td>
        <td className="px-4 py-3 text-right font-num text-[var(--text-primary)]">{sim.margemPct}%</td>
        <td className="px-4 py-3 text-right font-num text-[var(--text-primary)]">{formatarMoeda(precoSugerido)}</td>
        <td className="px-4 py-3 text-right">
          {editandoCobrado === sim.id ? (
            <div className="flex items-center gap-1 justify-end">
              <input type="number" value={cobradoEdit} onChange={e => setCobradoEdit(e.target.value)} step="0.01"
                className="w-24 h-[30px] input-premium text-right font-num text-sm" autoFocus />
              <button onClick={() => salvarPrecoCobrado(sim)}
                className="text-[11px] font-medium text-[var(--semantic-gain)] hover:underline px-1">OK</button>
              <button onClick={() => setEditandoCobrado(null)}
                className="text-[11px] font-medium text-[var(--text-secondary)] hover:underline px-1">X</button>
            </div>
          ) : (
            <button onClick={() => { setEditandoCobrado(sim.id); setCobradoEdit(String(sim.precoCobrado || '')) }}
              className={`font-num cursor-pointer hover:underline ${
                sim.precoCobrado
                  ? isDiferente
                    ? sim.precoCobrado! > precoSugerido
                      ? 'text-[var(--semantic-gain)]'
                      : 'text-[var(--semantic-loss)]'
                    : 'text-[var(--text-primary)]'
                  : 'text-[var(--text-disabled)]'
              }`}>
              {sim.precoCobrado ? formatarMoeda(sim.precoCobrado) : '—'}
            </button>
          )}
        </td>
        <td className="px-2 py-3 text-center">
          <button
            onClick={() => {
              localStorage.setItem('simulacao_duplicar', JSON.stringify(sim.inputJson))
              router.push('/simulacao')
            }}
            className="text-[var(--text-secondary)] hover:text-[var(--brand-orange)] transition-colors"
            title="Duplicar simulação"
          >
            <Copy size={14} strokeWidth={1.5} />
          </button>
        </td>
      </tr>
    )
  }

  function exportarCSV() {
    const linhas = [['Data', 'Cliente', 'Tipo', 'Custo', 'Margem', 'Sugerido', 'Cobrado'].join(';')]
    for (const sim of filtradas) {
      const custo = sim.resultadoJson?.totalGeral || 0
      const sugerido = sim.resultadoJson?.precoSugerido || 0
      linhas.push([
        formatarData(sim.criadoEm),
        sim.nomeCliente || '',
        sim.tipoEntrega,
        custo.toFixed(2),
        sim.margemPct + '%',
        sugerido.toFixed(2),
        (sim.precoCobrado || 0).toFixed(2),
      ].join(';'))
    }
    const blob = new Blob([linhas.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `simulacoes_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    dispararToast('sucesso', 'CSV exportado!')
  }

  function exportarJSON() {
    const blob = new Blob([JSON.stringify(filtradas, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `simulacoes_${new Date().toISOString().slice(0,10)}.json`
    a.click(); URL.revokeObjectURL(url)
    dispararToast('sucesso', 'JSON exportado!')
  }

  async function exportarPDF() {
    const el = relatorioRef.current
    if (!el) return
    dispararToast('info', 'Gerando PDF...')
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: '#F5F5F4',
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 10

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pdf.internal.pageSize.getHeight() - 20

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pdf.internal.pageSize.getHeight() - 20
      }

      pdf.save(`simulacoes_${new Date().toISOString().slice(0,10)}.pdf`)
      dispararToast('sucesso', 'PDF exportado!')
    } catch {
      dispararToast('erro', 'Erro ao gerar PDF')
    }
  }

  return (
    <div ref={relatorioRef} className="h-full flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-1 font-display">
            Relatórios
          </p>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)] font-display">
            Histórico
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Acompanhe a rentabilidade e consulte simulações passadas
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportarPDF} className="h-[34px] px-3 rounded-[4px] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-sunken)] transition-colors flex items-center gap-1.5">
            <Download size={13} /> PDF
          </button>
          <button onClick={exportarCSV} className="h-[34px] px-3 rounded-[4px] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-sunken)] transition-colors flex items-center gap-1.5">
            <FileDown size={13} /> CSV
          </button>
          <button onClick={exportarJSON} className="h-[34px] px-3 rounded-[4px] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-sunken)] transition-colors flex items-center gap-1.5">
            <Download size={13} /> JSON
          </button>
        </div>
      </div>

      {/* Dashboard KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card-premium p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-1.5">
            Total Sugerido
          </p>
          <p className="text-[28px] font-num font-medium text-[var(--text-primary)]">
            {formatarMoeda(totalSugerido)}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1.5">
            Soma dos preços sugeridos
          </p>
        </div>
        <div className="card-premium p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-1.5">
            Total Cobrado
          </p>
          <p className="text-[28px] font-num font-medium text-[var(--text-primary)]">
            {formatarMoeda(totalCobrado)}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1.5">
            {totalCobradoArr.length} de {simulacoes.length} registrados
          </p>
        </div>
        <div className="card-premium p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-1.5">
            Custo Freelancers
          </p>
          <p className="text-[28px] font-num font-medium text-[var(--text-primary)]">
            {formatarMoeda(custoFreelancers)}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1.5">
            Total de pagamentos
          </p>
        </div>
        <div className="card-premium p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-1.5">
            Margem Real
          </p>
          <p className={`text-[28px] font-num font-medium ${margemReal >= 0 ? 'text-[var(--semantic-gain)]' : 'text-[var(--semantic-loss)]'}`}>
            {simulacoes.length > 0 ? `${margemReal.toFixed(1)}%` : '—'}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-1.5">
            (Cobrado − Custo) ÷ Cobrado
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="card-premium p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-[var(--text-secondary)]" strokeWidth={1.5} />
          <span className="text-[13px] font-medium text-[var(--text-primary)]">Filtros</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-1.5">Cliente</label>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]" strokeWidth={1.5} />
              <input type="text" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} placeholder="Buscar..."
                className="input-premium h-[34px] pl-9" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-1.5">Tipo</label>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="select-premium h-[34px]">
              <option value="">Todos</option>
              <option value="regular">Regular</option>
              <option value="dedicada">Dedicada</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-1.5">Data início</label>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="input-premium h-[34px]" />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)] mb-1.5">Data fim</label>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="input-premium h-[34px]" />
          </div>
        </div>
        {/* Group toggle */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)]">Agrupar por</span>
          <div className="flex gap-1">
            {([['none', 'Nenhum'], ['cliente', 'Cliente'], ['data', 'Data'], ['mes', 'Mês']] as const).map(([valor, label]) => (
              <button
                key={valor}
                onClick={() => setAgruparPor(valor)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-[4px] transition-colors ${
                  agruparPor === valor
                    ? 'bg-[var(--brand-orange)] text-white'
                    : 'bg-[var(--surface-sunken)] text-[var(--text-secondary)] hover:bg-[color-mix(in_srgb,var(--surface-sunken)_80%,black)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela */}
      {filtradas.length === 0 ? (
        <div className="card-premium p-12 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-[var(--border-strong)] flex items-center justify-center mx-auto mb-4">
            <Clock size={22} className="text-[var(--text-disabled)]" strokeWidth={1} />
          </div>
          <p className="text-[var(--text-secondary)] font-medium">Nenhuma simulação encontrada</p>
          <p className="text-sm text-[var(--text-disabled)] mt-1">As simulações salvas aparecerão aqui.</p>
        </div>
      ) : agruparPor === 'none' ? (
        <div className="card-premium overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-sunken)]">
                <th className="table-header-cell text-left px-4 py-3">Data</th>
                <th className="table-header-cell text-left px-4 py-3">Cliente</th>
                <th className="table-header-cell text-left px-4 py-3">Tipo</th>
                <th className="table-header-cell text-left px-4 py-3">Paradas</th>
                <th className="table-header-cell text-right px-4 py-3">Custo</th>
                <th className="table-header-cell text-right px-4 py-3">Margem</th>
                <th className="table-header-cell text-right px-4 py-3">Sugerido</th>
                <th className="table-header-cell text-right px-4 py-3">Cobrado</th>
                <th className="table-header-cell text-center px-2 py-3 w-16">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtradas.map(sim => renderSimRow(sim))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {grupos!.map(([chave, items]) => {
            const subtotalCusto = items.reduce((s, i) => s + (i.resultadoJson?.totalGeral || 0), 0)
            const subtotalSugerido = items.reduce((s, i) => s + (i.resultadoJson?.precoSugerido || 0), 0)
            const subtotalCobrado = items.reduce((s, i) => s + (i.precoCobrado || 0), 0)
            const expandido = gruposExpandidos.has(chave)
            return (
              <div key={chave} className="card-premium overflow-hidden">
                <button
                  onClick={() => {
                    const next = new Set(gruposExpandidos)
                    expandido ? next.delete(chave) : next.add(chave)
                    setGruposExpandidos(next)
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[var(--surface-sunken)] hover:bg-[color-mix(in_srgb,var(--surface-sunken)_80%,black)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-transform duration-150 ${expandido ? 'rotate-90' : ''} text-[10px] text-[var(--text-secondary)]`}>▶</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{labelGrupo(chave)}</span>
                    <span className="text-[11px] text-[var(--text-secondary)]">({items.length})</span>
                  </div>
                  <div className="flex items-center gap-5 text-[13px] font-num">
                    <span className="text-[var(--text-secondary)]">Custo: {formatarMoeda(subtotalCusto)}</span>
                    <span className="text-[var(--text-primary)] font-medium">Sugerido: {formatarMoeda(subtotalSugerido)}</span>
                    {subtotalCobrado > 0 && <span className="text-[var(--semantic-gain)] font-medium">Cobrado: {formatarMoeda(subtotalCobrado)}</span>}
                  </div>
                </button>
                {expandido && (
                  <div>
                    <table className="w-full text-[13px]">
                      <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--surface-sunken)]">
                          <th className="table-header-cell text-left px-4 py-3">Data</th>
                          <th className="table-header-cell text-left px-4 py-3">Cliente</th>
                          <th className="table-header-cell text-left px-4 py-3">Tipo</th>
                          <th className="table-header-cell text-left px-4 py-3">Paradas</th>
                          <th className="table-header-cell text-right px-4 py-3">Custo</th>
                          <th className="table-header-cell text-right px-4 py-3">Margem</th>
                          <th className="table-header-cell text-right px-4 py-3">Sugerido</th>
                          <th className="table-header-cell text-right px-4 py-3">Cobrado</th>
                          <th className="table-header-cell text-center px-2 py-3 w-16">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {items.map(sim => renderSimRow(sim))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
