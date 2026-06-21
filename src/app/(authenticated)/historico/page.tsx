'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function HistoricoPage() {
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Histórico</h1>

      {/* Dashboard de rentabilidade */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Rentabilidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs">Custo operacional fixo (mês)</CardDescription>
                <CardTitle className="text-xl mt-1">R$ 0,00</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs">Custo freelancers (mês)</CardDescription>
                <CardTitle className="text-xl mt-1">R$ 0,00</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs">Total sugerido (mês)</CardDescription>
                <CardTitle className="text-xl mt-1">R$ 0,00</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription className="text-xs">Margem real estimada</CardDescription>
                <CardTitle className="text-xl mt-1">&mdash;</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <p className="text-xs text-muted-foreground italic">
            Conecte o Supabase para ver dados reais. As simulações são salvas automaticamente no banco.
          </p>
        </CardContent>
      </Card>

      {/* Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Total de simulações</CardDescription>
            <CardTitle className="text-2xl mt-1">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Valor total cotado</CardDescription>
            <CardTitle className="text-2xl mt-1">R$ 0,00</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Margem média</CardDescription>
            <CardTitle className="text-2xl mt-1">&mdash;</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs">Custo médio/entrega</CardDescription>
            <CardTitle className="text-2xl mt-1">R$ 0,00</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="p-4 pb-3">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="text-sm font-medium">Filtros</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium">Cliente</label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={filtroCliente}
                  onChange={e => setFiltroCliente(e.target.value)}
                  placeholder="Buscar cliente..."
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Tipo</label>
              <select
                value={filtroTipo}
                onChange={e => setFiltroTipo(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Todos</option>
                <option value="regular">Regular</option>
                <option value="dedicada">Dedicada</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Data início</label>
              <Input
                type="date"
                value={dataInicio}
                onChange={e => setDataInicio(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Data fim</label>
              <Input
                type="date"
                value={dataFim}
                onChange={e => setDataFim(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista vazia */}
      <Card className="p-12">
        <CardContent className="text-center p-0">
          <p className="text-muted-foreground mb-2">Nenhuma simulação encontrada</p>
          <p className="text-sm text-muted-foreground">
            As simulações serão exibidas aqui após conectar o Supabase e salvar as primeiras cotações.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
