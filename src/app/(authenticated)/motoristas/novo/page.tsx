'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NovoMotoristaPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [taxaPadrao, setTaxaPadrao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [salvo, setSalvo] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSalvo(true)
    setTimeout(() => router.push('/motoristas'), 1000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/motoristas" className="p-2 hover:bg-[var(--color-muted)] rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Novo Motorista</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome completo</label>
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Taxa padrão (R$)</label>
          <input
            type="number"
            value={taxaPadrao}
            onChange={e => setTaxaPadrao(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Observações</label>
          <textarea
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        </div>

        {salvo && (
          <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg text-sm text-center">
            Motorista salvo com sucesso!
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Salvar Motorista
        </button>
      </form>
    </div>
  )
}
