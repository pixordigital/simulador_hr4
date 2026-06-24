'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, X, Loader2 } from 'lucide-react'
import { dispararToast } from '@/components/Toast'

interface Cliente {
  id: string
  nome: string
  documento?: string
  endereco?: string
  telefone?: string
  email?: string
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    endereco: '',
    telefone: '',
    email: '',
    observacoes: '',
  })
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    carregarClientes()
  }, [])

  const carregarClientes = async () => {
    try {
      const res = await fetch('/api/dinamico/clientes')
      if (res.ok) {
        const data = await res.json()
        setClientes(data)
      }
    } catch (e) {
      dispararToast('erro', 'Erro ao carregar clientes')
    } finally {
      setCarregando(false)
    }
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.documento?.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone?.includes(busca)
  )

  const abrirModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditando(cliente)
      setFormData({
        nome: cliente.nome,
        documento: cliente.documento || '',
        endereco: cliente.endereco || '',
        telefone: cliente.telefone || '',
        email: cliente.email || '',
        observacoes: cliente.observacoes || '',
      })
    } else {
      setEditando(null)
      setFormData({ nome: '', documento: '', endereco: '', telefone: '', email: '', observacoes: '' })
    }
    setMostrarModal(true)
  }

  const fecharModal = () => {
    setMostrarModal(false)
    setEditando(null)
    setFormData({ nome: '', documento: '', endereco: '', telefone: '', email: '', observacoes: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.nome.trim()) {
      dispararToast('erro', 'Nome é obrigatório')
      return
    }

    setSalvando(true)
    try {
      const url = editando ? '/api/dinamico/clientes' : '/api/dinamico/clientes'
      const method = editando ? 'PUT' : 'POST'
      const body = editando ? { ...formData, id: editando.id } : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.erro || 'Erro ao salvar')
      }

      dispararToast('sucesso', editando ? 'Cliente atualizado!' : 'Cliente criado!')
      fecharModal()
      carregarClientes()
    } catch (e: any) {
      dispararToast('erro', e.message || 'Erro ao salvar cliente')
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async (id: string) => {
    if (!confirm('Excluir este cliente?')) return
    try {
      const res = await fetch(`/api/dinamico/clientes?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      dispararToast('sucesso', 'Cliente excluído!')
      carregarClientes()
    } catch {
      dispararToast('erro', 'Erro ao excluir cliente')
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-1 font-display">
            Cadastro
          </p>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)] font-display">
            Clientes
          </h1>
        </div>
        <button onClick={() => abrirModal()} className="btn-primary h-10">
          <Plus size={15} strokeWidth={1.5} className="mr-1" /> Novo Cliente
        </button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]" size={16} />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, documento ou telefone..."
            className="input-premium pl-10 pr-4"
          />
        </div>
      </div>

      {carregando ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--brand-orange)]" strokeWidth={2} />
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center text-[var(--text-secondary)]">
          <p className="text-base mb-2">Nenhum cliente cadastrado</p>
          <button onClick={() => abrirModal()} className="btn-primary">
            <Plus size={14} strokeWidth={1.5} className="mr-1" /> Cadastrar primeiro cliente
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-[var(--border)] rounded-[6px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-sunken)]">
                <th className="text-left p-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)]">Nome</th>
                <th className="text-left p-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)] hidden md:table-cell">Documento</th>
                <th className="text-left p-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)] hidden lg:table-cell">Telefone</th>
                <th className="text-left p-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)] hidden lg:table-cell">Email</th>
                <th className="text-right p-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)] w-24">Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map(cliente => (
                <tr key={cliente.id} className="border-b border-[var(--border)] hover:bg-[var(--surface-sunken)]">
                  <td className="p-3 text-sm text-[var(--text-primary)] font-medium">{cliente.nome}</td>
                  <td className="p-3 text-sm text-[var(--text-secondary)] hidden md:table-cell">{cliente.documento || '—'}</td>
                  <td className="p-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">{cliente.telefone || '—'}</td>
                  <td className="p-3 text-sm text-[var(--text-secondary)] hidden lg:table-cell">{cliente.email || '—'}</td>
                  <td className="p-3 text-right flex justify-end gap-1.5">
                    <button
                      onClick={() => abrirModal(cliente)}
                      className="p-1.5 rounded-[4px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-sunken)] transition-colors"
                      title="Editar"
                    >
                      <Edit size={14} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => excluir(cliente.id)}
                      className="p-1.5 rounded-[4px] text-[var(--text-secondary)] hover:text-[var(--semantic-loss)] hover:bg-[color-mix(in_srgb,var(--semantic-loss)_6%,transparent)] transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[var(--surface-raised)] rounded-[8px] w-full] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] font-display">
                {editando ? 'Editar Cliente' : 'Novo Cliente'}
              </h2>
              <button onClick={fecharModal} className="p-1 rounded-[4px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-sunken)] transition-colors">
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  className="input-premium"
                  required
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Documento (CPF/CNPJ)</label>
                  <input
                    type="text"
                    value={formData.documento}
                    onChange={e => setFormData({ ...formData, documento: e.target.value })}
                    className="input-premium"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Telefone</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={e => setFormData({ ...formData, telefone: e.target.value })}
                    className="input-premium"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="input-premium"
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Endereço</label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={e => setFormData({ ...formData, endereco: e.target.value })}
                  className="input-premium"
                  placeholder="Rua, número, bairro, cidade/UF"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={e => setFormData({ ...formData, observacoes: e.target.value })}
                  className="input-premium min-h-[80px] resize-y"
                  placeholder="Informações adicionais..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
                <button type="button" onClick={fecharModal} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando} className="btn-primary">
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin mr-1" strokeWidth={2} /> : 'Salvar'}
                  {salvando ? 'Salvando...' : (editando ? 'Atualizar' : 'Criar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}