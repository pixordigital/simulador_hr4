'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

type Pagamento = { id: string; dataPagamento: string; valor: number; descricao: string }

export default function PagamentosPage({ params }: { params: { id: string } }) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [data, setData] = useState('')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [motoristaNome, setMotoristaNome] = useState('')

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const [pagRes, motRes] = await Promise.all([
        fetch(`/api/dinamico?tipo=pagamentos`),
        fetch(`/api/dinamico?tipo=motoristas`),
      ])
      if (pagRes.ok) {
        const todos = await pagRes.json()
        setPagamentos(todos.filter((p: any) => p.motoristaId === params.id))
      }
      if (motRes.ok) {
        const motoristas = await motRes.json()
        const mot = motoristas.find((m: any) => m.id === params.id)
        if (mot) setMotoristaNome(mot.nome)
      }
    } catch {}
  }

  async function adicionar() {
    if (!data || !valor) return
    try {
      const res = await fetch('/api/dinamico?tipo=pagamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motoristaId: params.id, dataPagamento: data, valor: parseFloat(valor), descricao }),
      })
      if (res.ok) {
        const novo = await res.json()
        setPagamentos([...pagamentos, novo])
        setData(''); setValor(''); setDescricao('')
      }
    } catch {}
  }

  async function excluir(id: string) {
    try {
      const res = await fetch(`/api/dinamico?tipo=pagamentos&id=${id}`, { method: 'DELETE' })
      if (res.ok) setPagamentos(pagamentos.filter(p => p.id !== id))
    } catch {}
  }

  const total = pagamentos.reduce((s, p) => s + p.valor, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/motoristas" className="p-2 hover:bg-[#EBEBEA] dark:hover:bg-[#1F2937] rounded-[4px] transition-colors">
          <ArrowLeft size={20} className="text-text-primary" />
        </Link>
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-text-primary" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Pagamentos
          </h1>
          {motoristaNome && <p className="text-sm text-text-secondary">{motoristaNome}</p>}
        </div>
      </div>

      <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-primary">Registrar Pagamento</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Data</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)}
              className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Valor (R$)</label>
            <input type="number" value={valor} onChange={e => setValor(e.target.value)} step="0.01" min="0"
              className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Descrição</label>
            <input type="text" value={descricao} onChange={e => setDescricao(e.target.value)}
              className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
          </div>
        </div>
        <button onClick={adicionar}
          className="h-[38px] px-5 bg-[#F97316] hover:bg-[#C2590A] text-white text-sm font-semibold rounded-[6px] transition-colors flex items-center gap-2">
          <Plus size={16} />
          Adicionar Pagamento
        </button>
      </div>

      {pagamentos.length === 0 ? (
        <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-12 text-center">
          <p className="text-text-secondary font-medium">Nenhum pagamento registrado</p>
        </div>
      ) : (
        <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E0DFDD] dark:border-[#1F2937] bg-[#EBEBEA] dark:bg-[#1F2937]">
            <span className="text-sm font-semibold text-text-primary">Histórico de Pagamentos</span>
            <span className="text-sm font-num font-medium text-text-primary">
              Total: {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <div className="divide-y divide-[#E0DFDD] dark:divide-[#1F2937]">
            {pagamentos.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-num font-medium text-text-primary">
                    {p.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p className="text-[13px] text-text-secondary">
                    {new Date(p.dataPagamento + 'T12:00:00').toLocaleDateString('pt-BR')}
                    {p.descricao && ` — ${p.descricao}`}
                  </p>
                </div>
                <button onClick={() => excluir(p.id)}
                  className="p-2 text-text-secondary hover:text-[#B91C1C] transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
