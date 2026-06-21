'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'

type Pagamento = {
  id: string
  data: string
  valor: number
  descricao: string
}

export default function PagamentosPage({ params }: { params: { id: string } }) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [data, setData] = useState('')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')

  const adicionar = () => {
    if (!data || !valor) return
    setPagamentos([
      ...pagamentos,
      { id: Math.random().toString(36).slice(2), data, valor: parseFloat(valor), descricao },
    ])
    setData('')
    setValor('')
    setDescricao('')
  }

  const excluir = (id: string) => {
    setPagamentos(pagamentos.filter(p => p.id !== id))
  }

  const total = pagamentos.reduce((s, p) => s + p.valor, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/motoristas" className="p-2 hover:bg-[var(--color-muted)] rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Pagamentos</h1>
      </div>

      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Registrar Pagamento</h2>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Data</label>
            <input
              type="date"
              value={data}
              onChange={e => setData(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Valor (R$)</label>
            <input
              type="number"
              value={valor}
              onChange={e => setValor(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Descrição</label>
            <input
              type="text"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={adicionar}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Adicionar Pagamento
        </button>
      </div>

      {pagamentos.length > 0 && (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Histórico de Pagamentos</h2>
            <p className="text-lg font-bold">Total: R$ {total.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            {pagamentos.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-[var(--color-muted)] rounded-lg">
                <div>
                  <p className="text-sm font-medium">R$ {p.valor.toFixed(2)}</p>
                  <p className="text-xs text-[var(--color-muted-fg)]">{p.data} {p.descricao && `— ${p.descricao}`}</p>
                </div>
                <button onClick={() => excluir(p.id)} className="text-red-500 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {pagamentos.length === 0 && (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <p className="text-[var(--color-muted-fg)]">Nenhum pagamento registrado</p>
        </div>
      )}
    </div>
  )
}
