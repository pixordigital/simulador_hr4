'use client'

import { useState } from 'react'
import { Search, Filter, TrendingUp, TrendingDown, DollarSign, Truck, Clock, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function HistoricoPage() {
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const cards = [
    { icon: <Truck size={18} />, label: 'Custo operacional fixo (mês)', value: 'R$ 0,00', desc: 'Salário + combustível + manutenção + seguro' },
    { icon: <DollarSign size={18} />, label: 'Custo freelancers (mês)', value: 'R$ 0,00', desc: 'Total de pagamentos a freelancers' },
    { icon: <TrendingUp size={18} />, label: 'Total sugerido (mês)', value: 'R$ 0,00', desc: 'Soma dos preços sugeridos' },
    { icon: <BarChart3 size={18} />, label: 'Margem real estimada', value: '—', desc: '(Total cobrado − custo) ÷ total cobrado' },
  ]
  const metrics = [
    { label: 'Total de simulações', value: '0' },
    { label: 'Valor total cotado', value: 'R$ 0,00' },
    { label: 'Margem média', value: '—' },
    { label: 'Custo médio/entrega', value: 'R$ 0,00' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Histórico</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe a rentabilidade e consulte simulações passadas</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2"><BarChart3 size={15} /> Dashboard</TabsTrigger>
          <TabsTrigger value="simulacoes" className="gap-2"><Clock size={15} /> Simulações</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Rentabilidade */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" />
                Dashboard de Rentabilidade
              </CardTitle>
              <CardDescription>Comparação entre custo real e valor cobrado no período</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((c, i) => (
                  <div key={i} className="p-4 bg-muted/30 border border-border/40 rounded-xl space-y-2 hover:border-border/80 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">{c.icon}</div>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <p className="text-xl font-bold">{c.value}</p>
                    <p className="text-[10px] text-muted-foreground/60">{c.desc}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic mt-4">
                Conecte o Supabase para ver dados reais. As simulações são salvas automaticamente no banco.
              </p>
            </CardContent>
          </Card>

          {/* Métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m, i) => (
              <Card key={i} className="shadow-sm border-border/60">
                <CardHeader className="p-4 pb-2">
                  <CardDescription className="text-xs">{m.label}</CardDescription>
                  <CardTitle className="text-2xl mt-1">{m.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="simulacoes" className="space-y-4">
          {/* Filtros */}
          <Card className="shadow-sm border-border/60">
            <CardHeader className="p-4 pb-3">
              <div className="flex items-center gap-2">
                <Filter size={15} />
                <span className="text-sm font-medium">Filtros</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Cliente</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="text" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} placeholder="Buscar..." className="pl-8 h-9 text-sm" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Tipo</label>
                  <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Todos</option><option value="regular">Regular</option><option value="dedicada">Dedicada</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Data início</label>
                  <Input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Data fim</label>
                  <Input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} className="h-9 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela vazia */}
          <Card className="border-border/60">
            <CardContent className="py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Clock size={24} className="text-muted-foreground/60" />
              </div>
              <p className="text-muted-foreground font-medium">Nenhuma simulação encontrada</p>
              <p className="text-sm text-muted-foreground/60 mt-1 max-w-md mx-auto">
                As simulações aparecerão aqui após conectar o Supabase e salvar as primeiras cotações.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
