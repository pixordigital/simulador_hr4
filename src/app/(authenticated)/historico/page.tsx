'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'

export default function HistoricoPage() {
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Histórico</h1>

      {/* Dashboard de rentabilidade */}
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Dashboard de Rentabilidade</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[rgb(var(--muted))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">Custo operacional fixo (mês)</p>
            <p className="text-xl font-bold mt-1">R$ 0,00</p>
          </div>
          <div className="p-4 bg-[rgb(var(--muted))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">Custo freelancers (mês)</p>
            <p className="text-xl font-bold mt-1">R$ 0,00</p>
          </div>
          <div className="p-4 bg-[rgb(var(--muted))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">Total sugerido (mês)</p>
            <p className="text-xl font-bold mt-1">R$ 0,00</p>
          </div>
          <div className="p-4 bg-[rgb(var(--muted))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">Margem real estimada</p>
            <p className="text-xl font-bold mt-1">—</p>
          </div>
        </div>

        <p className="text-xs text-[rgb(var(--muted-foreground))] italic">
          Conecte o Supabase para ver dados reais. As simulações são salvas automaticamente no banco.
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4">
          <p className="text-xs text-[rgb(var(--muted-foreground))]">Total de simulações</p>
          <p className="text-2xl font-bold mt-1">0</p>
        </div>
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4">
          <p className="text-xs text-[rgb(var(--muted-foreground))]">Valor total cotado</p>
          <p className="text-2xl font-bold mt-1">R$ 0,00</p>
        </div>
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4">
          <p className="text-xs text-[rgb(var(--muted-foreground))]">Margem média</p>
          <p className="text-2xl font-bold mt-1">—</p>
        </div>
        <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-lg p-4">
          <p className="text-xs text-[rgb(var(--muted-foreground))]">Custo médio/entrega</p>
          <p className="text-2xl font-bold mt-1">R$ 0,00</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} />
          <span className="text-sm font-medium">Filtros</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Cliente</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))]" />
              <input
                type="text"
                value={filtroCliente}
                onChange={e => setFiltroCliente(e.target.value)}
                placeholder="Buscar cliente..."
                className="w-full pl-8 pr-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Tipo</label>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              className="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="regular">Regular</option>
              <option value="dedicada">Dedicada</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Data início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Data fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              className="w-full px-3 py-2 border border-[rgb(var(--border))] rounded-lg bg-transparent text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lista vazia */}
      <div className="bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-xl p-12 text-center">
        <p className="text-[rgb(var(--muted-foreground))] mb-2">Nenhuma simulação encontrada</p>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          As simulações serão exibidas aqui após conectar o Supabase e salvar as primeiras cotações.
        </p>
      </div>
    </div>
  )
}
