'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit3, Trash2, DollarSign, ArrowLeft, Database } from 'lucide-react'
import BrudamImportPanel from '@/components/BrudamImportPanel'

type Motorista = {
  id: string
  nome: string
  taxaPadrao: number
  observacoes: string
  criadoEm: string
}

export default function MotoristasPage() {
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [formNome, setFormNome] = useState('')
  const [formTaxa, setFormTaxa] = useState('')
  const [formObs, setFormObs] = useState('')

  useEffect(() => {
    carregarMotoristas()
  }, [])

  async function carregarMotoristas() {
    try {
      const res = await fetch('/api/dinamico?tipo=motoristas')
      if (res.ok) setMotoristas(await res.json())
    } catch {}
  }

  const filtrados = motoristas.filter(m =>
    m.nome.toLowerCase().includes(busca.toLowerCase())
  )

  async function salvarEdicao(id: string) {
    try {
      const res = await fetch(`/api/dinamico?tipo=motoristas&id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: formNome, taxaPadrao: parseFloat(formTaxa) || 0, observacoes: formObs }),
      })
      if (res.ok) {
        setMotoristas(motoristas.map(m =>
          m.id === id ? { ...m, nome: formNome, taxaPadrao: parseFloat(formTaxa) || 0, observacoes: formObs } : m
        ))
        setEditando(null)
      }
    } catch {}
  }

  async function excluirMotorista(id: string) {
    try {
      const res = await fetch(`/api/dinamico?tipo=motoristas&id=${id}`, { method: 'DELETE' })
      if (res.ok) setMotoristas(motoristas.filter(m => m.id !== id))
    } catch {}
  }

  function iniciarEdicao(m: Motorista) {
    setEditando(m.id)
    setFormNome(m.nome)
    setFormTaxa(m.taxaPadrao.toString())
    setFormObs(m.observacoes)
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-text-primary" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Motoristas Freelancers
          </h1>
          <p className="text-sm text-text-secondary mt-1">Cadastro de motoristas freelancers</p>
        </div>
        <div className="flex items-center gap-2">
          <BrudamImportPanel
            titulo="Importar"
            descricao="Importar Motoristas do Brudam"
            endpoint="motoristas"
            icone={<Database size={12} />}
            colunas={[
              { chave: 'nome', rotulo: 'Nome' },
              { chave: 'cpf', rotulo: 'CPF' },
            ]}
            aoImportar={async (selecionados) => {
              for (const item of selecionados) {
                await fetch('/api/dinamico?tipo=motoristas', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    nome: item.nome || item.nomeMotorista || 'Importado Brudam',
                    taxaPadrao: 0,
                    observacoes: `Importado do Brudam${item.observacao ? ': ' + item.observacao : ''}`,
                  }),
                })
              }
              carregarMotoristas()
            }}
          />
          <Link href="/motoristas/novo">
            <button className="h-[38px] px-4 bg-[#F97316] hover:bg-[#C2590A] text-white text-sm font-semibold rounded-[6px] transition-colors flex items-center gap-2">
              <Plus size={16} />
              Novo Motorista
            </button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar motorista..."
          className="w-full h-[34px] pl-9 pr-3 border border-[var(--border-strong)] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2 placeholder:text-[var(--text-disabled)] dark:placeholder:text-[#6B7280]"
        />
      </div>

      {filtrados.length === 0 ? (
        <div className="border border-[var(--border-subtle)] rounded-[6px] p-12 text-center">
          <p className="text-text-secondary font-medium">Nenhum motorista encontrado</p>
          <p className="text-sm text-[var(--text-disabled)] mt-1">Cadastre motoristas freelancers para usar nas simulações.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-[6px]">
          {filtrados.map(motorista => (
            <div key={motorista.id} className="p-4 hover:bg-[var(--surface-sunken)] transition-colors">
              {editando === motorista.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formNome}
                    onChange={e => setFormNome(e.target.value)}
                    className="w-full h-[34px] px-3 border border-[var(--border-strong)] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-1">Taxa padrão (R$)</label>
                      <input type="number" value={formTaxa} onChange={e => setFormTaxa(e.target.value)} step="0.01" min="0"
                        className="w-full h-[34px] px-3 border border-[var(--border-strong)] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary mb-1">Observações</label>
                      <input type="text" value={formObs} onChange={e => setFormObs(e.target.value)}
                        className="w-full h-[34px] px-3 border border-[var(--border-strong)] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => salvarEdicao(motorista.id)}
                      className="h-[34px] px-4 bg-[#F97316] text-white text-sm font-medium rounded-[4px] hover:bg-[#C2590A] transition-colors">
                      Salvar
                    </button>
                    <button onClick={() => setEditando(null)}
                      className="h-[34px] px-4 border border-[var(--border-strong)] text-text-primary text-sm font-medium rounded-[4px] hover:bg-[var(--surface-sunken)] dark:hover:bg-[#1F2937] transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{motorista.nome}</p>
                    <div className="flex gap-4 mt-1 text-[13px] text-text-secondary">
                      <span>
                        {motorista.taxaPadrao > 0
                          ? `Taxa padrão: ${motorista.taxaPadrao.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                          : <span className="text-[11px] px-2 py-0.5 rounded-[3px] bg-[var(--surface-sunken)]">A definir</span>}
                      </span>
                      {motorista.observacoes && <span>{motorista.observacoes}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => iniciarEdicao(motorista)}
                      className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => excluirMotorista(motorista.id)}
                      className="p-2 text-text-secondary hover:text-[#B91C1C] transition-colors">
                      <Trash2 size={14} />
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
