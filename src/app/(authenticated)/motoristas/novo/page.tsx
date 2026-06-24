'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'

export default function NovoMotoristaPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [taxaPadrao, setTaxaPadrao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome) { setErro('Nome é obrigatório'); return }

    try {
      const res = await fetch('/api/dinamico?tipo=motoristas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, taxaPadrao: parseFloat(taxaPadrao) || 0, observacoes }),
      })
      if (res.ok) {
        setSalvo(true)
        setTimeout(() => router.push('/motoristas'), 1000)
      } else {
        const d = await res.json()
        setErro(d.erro || 'Erro ao salvar')
      }
    } catch { setErro('Erro ao salvar motorista') }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/motoristas" className="p-2 hover:bg-[var(--surface-sunken)] dark:hover:bg-[#1F2937] rounded-[4px] transition-colors">
          <ArrowLeft size={20} className="text-text-primary" />
        </Link>
        <h1 className="text-[28px] font-bold tracking-tight text-text-primary" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Novo Motorista
        </h1>
      </div>

      <div className="border border-[var(--border-subtle)] rounded-[6px] p-6">
        <h2 className="text-sm font-semibold text-text-primary mb-4">Dados do Motorista</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              className="w-full h-[38px] px-3 border border-[var(--border-strong)] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Taxa padrão (R$)</label>
            <input
              type="number"
              value={taxaPadrao}
              onChange={e => setTaxaPadrao(e.target.value)}
              step="0.01"
              min="0"
              className="w-full h-[38px] px-3 border border-[var(--border-strong)] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
            />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Observações</label>
            <textarea
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border-strong)] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2 resize-none"
            />
          </div>

          {salvo && (
            <div className="border-l-[3px] border-l-[#15803D] bg-[#15803D]/5 p-3 rounded-[4px] flex items-center gap-2">
              <Check size={16} className="text-[#15803D]" />
              <p className="text-sm font-medium text-[#15803D]">Motorista salvo com sucesso!</p>
            </div>
          )}

          {erro && !salvo && (
            <div className="border-l-[3px] border-l-[#B91C1C] bg-[#B91C1C]/5 p-3 rounded-[4px]">
              <p className="text-sm font-medium text-[#B91C1C]">{erro}</p>
            </div>
          )}

          <button type="submit"
            className="w-full h-[42px] bg-[#F97316] hover:bg-[#C2590A] text-white font-semibold text-sm rounded-[6px] transition-colors">
            Salvar Motorista
          </button>
        </form>
      </div>
    </div>
  )
}
