'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'

type Pagamento = {
  id: string
  motoristaId: string
  motoristaNome: string
  valor: number
  dataPagamento: string
  descricao: string
  criadoEm: string
}

type Motorista = {
  id: string
  nome: string
}

export default function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [motoristaId, setMotoristaId] = useState('')
  const [valor, setValor] = useState('')
  const [dataPagamento, setDataPagamento] = useState('')
  const [descricao, setDescricao] = useState('')
  const [buscaMes, setBuscaMes] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const [pagRes, motRes] = await Promise.all([
        fetch('/api/dinamico?tipo=pagamentos'),
        fetch('/api/dinamico?tipo=motoristas'),
      ])
      if (pagRes.ok) setPagamentos(await pagRes.json())
      if (motRes.ok) setMotoristas(await motRes.json())
    } catch {}
  }

  async function adicionar() {
    if (!motoristaId || !valor || !dataPagamento) return
    const mot = motoristas.find(m => m.id === motoristaId)
    try {
      const res = await fetch('/api/dinamico?tipo=pagamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motoristaId,
          motoristaNome: mot?.nome || '',
          valor: parseFloat(valor),
          dataPagamento,
          descricao,
        }),
      })
      if (res.ok) {
        const novo = await res.json()
        setPagamentos([...pagamentos, novo])
        setMotoristaId('')
        setValor('')
        setDataPagamento('')
        setDescricao('')
      }
    } catch {}
  }

  async function excluir(id: string) {
    try {
      const res = await fetch(`/api/dinamico?tipo=pagamentos&id=${id}`, { method: 'DELETE' })
      if (res.ok) setPagamentos(pagamentos.filter(p => p.id !== id))
    } catch {}
  }

  // Agrupar por mês
  const agrupados: Record<string, Pagamento[]> = {}
  pagamentos.forEach(p => {
    const mes = p.dataPagamento ? p.dataPagamento.slice(0, 7) : 'sem-data'
    if (!agrupados[mes]) agrupados[mes] = []
    agrupados[mes].push(p)
  })

  const meses = Object.keys(agrupados).sort((a, b) => b.localeCompare(a))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-text-primary" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Pagamentos
        </h1>
        <p className="text-sm text-text-secondary mt-1">Registre pagamentos a motoristas freelancers</p>
      </div>

      {/* Form */}
      <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Registrar Pagamento</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Motorista</label>
            <select
              value={motoristaId}
              onChange={e => setMotoristaId(e.target.value)}
              className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
            >
              <option value="">Selecionar</option>
              {motoristas.map(m => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Valor (R$)</label>
            <input
              type="number"
              value={valor}
              onChange={e => setValor(e.target.value)}
              step="0.01"
              min="0"
              className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Data</label>
            <input
              type="date"
              value={dataPagamento}
              onChange={e => setDataPagamento(e.target.value)}
              className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Opcional"
              className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2 placeholder:text-[#A8A29E] dark:placeholder:text-[#6B7280]"
            />
          </div>
        </div>
        <button
          onClick={adicionar}
          className="h-[38px] px-5 bg-[#F97316] hover:bg-[#C2590A] text-white text-sm font-semibold rounded-[6px] transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Adicionar Pagamento
        </button>
      </div>

      {/* Totais por mês */}
      {meses.length === 0 ? (
        <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-12 text-center">
          <p className="text-text-secondary font-medium">Nenhum pagamento registrado</p>
          <p className="text-sm text-[#A8A29E] mt-1">Cadastre motoristas freelancers e registre os pagamentos mensais.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {meses.map(mes => {
            const pagamentosMes = agrupados[mes]
            const total = pagamentosMes.reduce((s, p) => s + p.valor, 0)
            const [ano, mesNum] = mes.split('-')
            const nomeMes = new Date(parseInt(ano), parseInt(mesNum) - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

            return (
              <div key={mes} className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px]">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#E0DFDD] dark:border-[#1F2937] bg-[#EBEBEA] dark:bg-[#1F2937]">
                  <span className="text-sm font-semibold text-text-primary capitalize">{nomeMes}</span>
                  <span className="text-sm font-num font-medium text-text-primary">
                    Total: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="divide-y divide-[#E0DFDD] dark:divide-[#1F2937]">
                  {pagamentosMes.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{p.motoristaNome}</p>
                        <p className="text-[13px] text-text-secondary">
                          {new Date(p.dataPagamento + 'T12:00:00').toLocaleDateString('pt-BR')}
                          {p.descricao && ` — ${p.descricao}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-num font-medium text-text-primary">
                          {p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <button
                          onClick={() => excluir(p.id)}
                          className="text-text-secondary hover:text-[#B91C1C] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
