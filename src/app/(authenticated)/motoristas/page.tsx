'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit3, Trash2, DollarSign } from 'lucide-react'

type Motorista = {
  id: string
  nome: string
  taxaPadrao: number
  observacoes: string
}

const MOTORISTAS_SEED: Motorista[] = [
  { id: '1', nome: 'DANIELLA NOBREGA HENRIQUES GAMA', taxaPadrao: 0, observacoes: '' },
  { id: '2', nome: 'MARCIO JOAO DE OLIVEIRA SANTOS', taxaPadrao: 0, observacoes: '' },
  { id: '3', nome: 'HAYRON LEITE COUTINHO RAMOS', taxaPadrao: 0, observacoes: '' },
  { id: '4', nome: 'DAVID HENRICH MEDEIROS DE SANTANA', taxaPadrao: 0, observacoes: '' },
]

export default function MotoristasPage() {
  const [motoristas, setMotoristas] = useState<Motorista[]>(MOTORISTAS_SEED)
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [formNome, setFormNome] = useState('')
  const [formTaxa, setFormTaxa] = useState('')
  const [formObs, setFormObs] = useState('')

  const filtrados = motoristas.filter(m =>
    m.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const salvarEdicao = (id: string) => {
    setMotoristas(motoristas.map(m =>
      m.id === id ? { ...m, nome: formNome, taxaPadrao: parseFloat(formTaxa) || 0, observacoes: formObs } : m
    ))
    setEditando(null)
  }

  const iniciarEdicao = (m: Motorista) => {
    setEditando(m.id)
    setFormNome(m.nome)
    setFormTaxa(m.taxaPadrao.toString())
    setFormObs(m.observacoes)
  }

  const excluirMotorista = (id: string) => {
    setMotoristas(motoristas.filter(m => m.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Motoristas Freelancers</h1>
        <Link
          href="/motoristas/novo"
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Novo Motorista
        </Link>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-fg)]" />
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar motorista..."
          className="w-full pl-9 pr-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-12 text-center">
          <p className="text-[var(--color-muted-fg)]">Nenhum motorista encontrado</p>
          <p className="text-sm text-[var(--color-muted-fg)] mt-1">
            Cadastre motoristas freelancers para usar nas simulações.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(motorista => (
            <div
              key={motorista.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4"
            >
              {editando === motorista.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formNome}
                    onChange={e => setFormNome(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do motorista"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Taxa padrão (R$)</label>
                      <input
                        type="number"
                        value={formTaxa}
                        onChange={e => setFormTaxa(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Observações</label>
                      <input
                        type="text"
                        value={formObs}
                        onChange={e => setFormObs(e.target.value)}
                        className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => salvarEdicao(motorista.id)}
                      className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditando(null)}
                      className="px-4 py-1.5 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 rounded-lg text-xs font-medium"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{motorista.nome}</p>
                    <div className="flex gap-4 mt-1 text-sm text-[var(--color-muted-fg)]">
                      <span>Taxa padrão: {motorista.taxaPadrao > 0 ? `R$ ${motorista.taxaPadrao.toFixed(2)}` : 'A definir'}</span>
                      {motorista.observacoes && <span>{motorista.observacoes}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/motoristas/${motorista.id}/pagamentos`}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Ver pagamentos"
                    >
                      <DollarSign size={16} />
                    </Link>
                    <button
                      onClick={() => iniciarEdicao(motorista)}
                      className="p-2 text-[var(--color-muted-fg)] hover:bg-[var(--color-muted)] rounded-lg transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => excluirMotorista(motorista.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
