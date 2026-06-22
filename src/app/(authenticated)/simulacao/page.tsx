'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calculator, Info, AlertTriangle, Plus, Trash2, Sparkles, Truck,
  CalendarClock, ClipboardList, TrendingUp, DollarSign, MapPin, Package,
  Scale, Ruler, Receipt, Clock, CheckCircle2, Zap, ArrowRight, Fuel,
  Gauge, BadgePercent, BrainCircuit, BarChart3, Workflow, CircleDot
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// ---- Types ----
type Parada = {
  id: string; zona: string; pesoReal: number
  comprimento: string; largura: string; altura: string; valorNF: string
}
type CustoComponente = {
  salarioParcela: number; valeParcela: number; combustivelParcela: number
  manutencaoParcela: number; seguroParcela: number; depreciacaoParcela: number
  taxaFaixaPeso: number; gris: number; adValorem: number; acrescimoAgendamento: number
}
type Opcao = {
  rotulo: string; custoTotal: number; isFreelancer: boolean
  custoPorParada: { zona: string; pesoTaxavel: number; total: number; componentes: CustoComponente }[]
}

const ZONAS = ['João Pessoa', 'Cabedelo', 'Conde', 'Santa Rita', 'Bayeux', 'Alhandra']
const OPCOES_VEICULO = ['KANGOO', '8-160', 'Freelancer'] as const

function criarParada(): Parada {
  return { id: Math.random().toString(36).slice(2), zona: '', pesoReal: 0, comprimento: '', largura: '', altura: '', valorNF: '' }
}

function formatarMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function SimulacaoPage() {
  const [tipo, setTipo] = useState<'regular' | 'dedicada'>('regular')
  const [opcaoVeiculo, setOpcaoVeiculo] = useState<string>('KANGOO')
  const [numeroEntregas, setNumeroEntregas] = useState('8')
  const [margem, setMargem] = useState('8')
  const [taxaFreelancer, setTaxaFreelancer] = useState('')
  const [paradas, setParadas] = useState<Parada[]>([criarParada()])
  const [resultadoVisible, setResultadoVisible] = useState(false)
  const [calculando, setCalculando] = useState(false)
  const [erro, setErro] = useState('')
  const [diasDedicada, setDiasDedicada] = useState('1')
  const [kmEstimado, setKmEstimado] = useState('')
  const [ajudante, setAjudante] = useState(false)
  const [agendada, setAgendada] = useState(false)
  const [dataAgendamento, setDataAgendamento] = useState('')
  const [horarioAgendado, setHorarioAgendado] = useState('')
  const [acrescimoAgendamento, setAcrescimoAgendamento] = useState('0')
  const [opcoes, setOpcoes] = useState<Opcao[]>([])
  const [totalGeral, setTotalGeral] = useState(0)
  const [precoSugerido, setPrecoSugerido] = useState(0)
  const [alertaBreakEven, setAlertaBreakEven] = useState(false)
  const [valorPrejuizo, setValorPrejuizo] = useState(0)
  const [avisoSemNF, setAvisoSemNF] = useState(false)

  const adicionarParada = () => setParadas([...paradas, criarParada()])
  const removerParada = (id: string) => paradas.length > 1 && setParadas(paradas.filter(p => p.id !== id))
  const atualizarParada = (id: string, campo: keyof Parada, valor: string | number) =>
    setParadas(paradas.map(p => (p.id === id ? { ...p, [campo]: valor } : p)))

  const calcular = useCallback(async () => {
    setErro(''); setCalculando(true)
    if (tipo === 'regular') {
      if (!paradas.every(p => p.zona && p.pesoReal > 0)) { setErro('Preencha zona e peso de todas as paradas'); setCalculando(false); return }
      if (opcaoVeiculo === 'Freelancer' && !taxaFreelancer) { setErro('Informe a taxa do freelancer'); setCalculando(false); return }
    }
    if (tipo === 'dedicada' && !kmEstimado) { setErro('Informe o km estimado da rota'); setCalculando(false); return }

    let configs: any
    try {
      const [geralRes, motoristasRes, taxasRes, dedicadaRes] = await Promise.all([
        fetch('/api/configuracoes?tipo=geral'), fetch('/api/configuracoes?tipo=motoristas'),
        fetch('/api/configuracoes?tipo=taxas'), fetch('/api/configuracoes?tipo=dedicada'),
      ])
      if (!geralRes.ok || !motoristasRes.ok || !taxasRes.ok || !dedicadaRes.ok) throw new Error()
      configs = { geral: await geralRes.json(), motoristas: await motoristasRes.json(), taxas: await taxasRes.json(), dedicada: await dedicadaRes.json() }
    } catch { setErro('Erro ao carregar configurações'); setCalculando(false); return }

    const numEntregas = parseInt(numeroEntregas) || 8
    const margemPct = parseFloat(margem) || 8
    const acrescimo = agendada ? (parseFloat(acrescimoAgendamento) || 0) : 0

    try {
      const body = tipo === 'regular' ? {
        tipo: 'regular', margemPct, agendada, acrescimoAgendamento: acrescimo, numeroEntregasDia: numEntregas,
        taxaFreelancer: opcaoVeiculo === 'Freelancer' ? (parseFloat(taxaFreelancer) || 0) : undefined, configs,
        paradas: paradas.map(p => ({ zona: p.zona, pesoReal: p.pesoReal, comprimento: p.comprimento ? parseFloat(p.comprimento) : undefined, largura: p.largura ? parseFloat(p.largura) : undefined, altura: p.altura ? parseFloat(p.altura) : undefined, valorNF: p.valorNF ? parseFloat(p.valorNF) : undefined })),
      } : {
        tipo: 'dedicada', margemPct, agendada, acrescimoAgendamento: acrescimo,
        veiculoDedicada: opcaoVeiculo, diasDedicada: parseInt(diasDedicada) || 1, kmEstimadoDedicada: parseFloat(kmEstimado) || 0,
        ajudanteDedicada: ajudante, configs,
      }
      const res = await fetch('/api/simular', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); setErro(d.erro || 'Erro ao calcular'); setCalculando(false); return }
      const data = await res.json()
      const fmt = (o: any) => ({
        rotulo: o.rotulo, custoTotal: o.custoTotal, isFreelancer: o.isFreelancer,
        custoPorParada: o.custoPorParada.map((cp: any) => ({ zona: cp.zona || '', pesoTaxavel: cp.pesoTaxavel || 0, total: cp.total || 0, componentes: { salarioParcela: cp.salarioParcela || 0, valeParcela: cp.valeParcela || 0, combustivelParcela: cp.combustivelParcela || 0, manutencaoParcela: cp.manutencaoParcela || 0, seguroParcela: cp.seguroParcela || 0, depreciacaoParcela: cp.depreciacaoParcela || 0, taxaFaixaPeso: cp.taxaFaixaPeso || 0, gris: cp.gris || 0, adValorem: cp.adValorem || 0, acrescimoAgendamento: cp.acrescimoAgendamento || 0 } })),
      })
      setOpcoes(data.opcoes.map(fmt))
      setTotalGeral(data.totalGeral); setPrecoSugerido(data.precoSugerido)
      setAlertaBreakEven(data.alertaBreakEven); setValorPrejuizo(data.valorPrejuizo); setAvisoSemNF(data.avisoSemNF)
      setResultadoVisible(true)
    } catch { setErro('Erro interno ao calcular') } finally { setCalculando(false) }
  }, [tipo, paradas, opcaoVeiculo, numeroEntregas, margem, taxaFreelancer, agendada, acrescimoAgendamento, kmEstimado, diasDedicada, ajudante])

  const opcaoMaisBarata = opcoes.length > 0 ? Math.min(...opcoes.map(o => o.custoTotal)) : 0

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 dark:from-blue-950 dark:via-blue-900 dark:to-purple-950 p-8 md:p-10">
          <div className="absolute inset-0 dot-pattern opacity-20" />
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-blue-200 mb-2">
              <BadgePercent size={16} />
              <span className="text-sm font-medium uppercase tracking-wider">Simulação</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Nova Simulação</h1>
            <p className="text-blue-200/80 max-w-xl">Calcule o preço ideal para sua entrega em João Pessoa e Grande JP</p>
          </div>
        </div>

        {/* Config Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tipo + Veículo */}
            <Card className="glass border-border/40 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                    <ClipboardList size={14} />
                  </div>
                  Configuração da Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2.5 block font-medium">Tipo de entrega</Label>
                  <Tabs value={tipo} onValueChange={v => setTipo(v as 'regular' | 'dedicada')} className="w-full">
                    <TabsList className="w-full bg-muted/60 p-1 h-auto">
                      <TabsTrigger value="regular" className="flex-1 gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-blue-950 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                        <Package size={16} /> Regular
                      </TabsTrigger>
                      <TabsTrigger value="dedicada" className="flex-1 gap-2 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-blue-950 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                        <CalendarClock size={16} /> Dedicada
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Separator />

                <div>
                  <Label className="text-xs text-muted-foreground mb-2.5 block font-medium">Veículo / Motorista</Label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {OPCOES_VEICULO.map(op => (
                      <Button
                        key={op}
                        variant={opcaoVeiculo === op ? 'default' : 'outline'}
                        onClick={() => setOpcaoVeiculo(op)}
                        className={`
                          h-auto py-3.5 flex-col gap-1.5 text-center transition-all duration-200 rounded-xl
                          ${opcaoVeiculo === op
                            ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02] border-0'
                            : 'hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/30'
                          }
                        `}
                      >
                        {op === 'KANGOO' ? <Truck size={20} /> : op === '8-160' ? <Gauge size={20} /> : <Zap size={20} />}
                        <span className="font-medium text-sm">{op}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entregas-dia" className="text-sm flex items-center gap-1.5">
                      <TrendingUp size={14} className="text-muted-foreground" />
                      Entregas no dia
                      <Tooltip>
                        <TooltipTrigger><Info size={12} className="text-muted-foreground cursor-help" /></TooltipTrigger>
                        <TooltipContent side="top" className="glass-strong text-xs"><p>Número de entregas que o motorista fará no dia</p></TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input id="entregas-dia" type="number" value={numeroEntregas} onChange={e => setNumeroEntregas(e.target.value)} min="1" className="h-10" />
                  </div>
                  {opcaoVeiculo === 'Freelancer' && tipo === 'regular' && (
                    <div className="space-y-2">
                      <Label htmlFor="taxa-freelancer" className="text-sm flex items-center gap-1.5">
                        <DollarSign size={14} className="text-muted-foreground" />
                        Taxa negociada (R$)
                        <Tooltip>
                          <TooltipTrigger><Info size={12} className="text-muted-foreground cursor-help" /></TooltipTrigger>
                          <TooltipContent side="top" className="glass-strong text-xs"><p>Valor único para o trabalho inteiro</p></TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input id="taxa-freelancer" type="number" value={taxaFreelancer} onChange={e => setTaxaFreelancer(e.target.value)} step="0.01" min="0" className="h-10" />
                    </div>
                  )}
                  {tipo === 'dedicada' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="dias-dedicada" className="text-sm flex items-center gap-1.5">
                          <CalendarClock size={14} className="text-muted-foreground" /> Dias
                        </Label>
                        <Input id="dias-dedicada" type="number" value={diasDedicada} onChange={e => setDiasDedicada(e.target.value)} min="1" className="h-10" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="km-estimado" className="text-sm flex items-center gap-1.5">
                          <MapPin size={14} className="text-muted-foreground" /> Km estimado
                          <Tooltip><TooltipTrigger><Info size={12} className="text-muted-foreground cursor-help" /></TooltipTrigger>
                          <TooltipContent side="top" className="glass-strong text-xs"><p>Distância total estimada do trabalho</p></TooltipContent></Tooltip>
                        </Label>
                        <Input id="km-estimado" type="number" value={kmEstimado} onChange={e => setKmEstimado(e.target.value)} step="0.1" min="0" className="h-10" />
                      </div>
                      <div className="flex items-center gap-2.5 pt-2 col-span-2">
                        <Checkbox id="ajudante" checked={ajudante} onCheckedChange={c => setAjudante(c === true)} />
                        <Label htmlFor="ajudante" className="font-medium cursor-pointer text-sm">Adicionar ajudante / auxiliar</Label>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Paradas */}
            {tipo === 'regular' && (
              <Card className="glass border-border/40 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
                        <MapPin size={14} />
                      </div>
                      Paradas
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={adicionarParada} className="h-8 gap-1.5 rounded-lg border-dashed hover:border-emerald-400 hover:text-emerald-600 transition-colors">
                      <Plus size={14} /> Parada
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paradas.map((parada, idx) => (
                    <div key={parada.id} className="group relative p-4 rounded-xl bg-white/50 dark:bg-blue-950/20 border border-border/40 hover:border-blue-200 dark:hover:border-blue-800/60 transition-all duration-200 hover:shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">{idx + 1}</span>
                          <span className="text-sm font-semibold">Parada {idx + 1}</span>
                        </div>
                        {paradas.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removerParada(parada.id)} className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                            <Trash2 size={14} />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1"><MapPin size={10} /> Zona</Label>
                          <Select value={parada.zona} onValueChange={v => atualizarParada(parada.id, 'zona', v ?? '')}>
                            <SelectTrigger className="text-sm h-9 rounded-lg bg-white/80 dark:bg-blue-950/40"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                            <SelectContent>{ZONAS.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1"><Scale size={10} /> Peso real (kg)</Label>
                          <Input type="number" value={parada.pesoReal || ''} onChange={e => atualizarParada(parada.id, 'pesoReal', parseFloat(e.target.value) || 0)} className="text-sm h-9 rounded-lg bg-white/80 dark:bg-blue-950/40" step="0.1" min="0" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1"><Ruler size={10} /> Dimensões (m)</Label>
                          <div className="flex gap-1">
                            <Input type="number" value={parada.comprimento} onChange={e => atualizarParada(parada.id, 'comprimento', e.target.value)} className="text-sm h-9 rounded-lg bg-white/80 dark:bg-blue-950/40" step="0.01" placeholder="C" />
                            <Input type="number" value={parada.largura} onChange={e => atualizarParada(parada.id, 'largura', e.target.value)} className="text-sm h-9 rounded-lg bg-white/80 dark:bg-blue-950/40" step="0.01" placeholder="L" />
                            <Input type="number" value={parada.altura} onChange={e => atualizarParada(parada.id, 'altura', e.target.value)} className="text-sm h-9 rounded-lg bg-white/80 dark:bg-blue-950/40" step="0.01" placeholder="A" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                            <Receipt size={10} /> Valor NF (R$)
                            <Tooltip><TooltipTrigger><Info size={10} className="text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent side="top" className="glass-strong text-xs"><p>Opcional — para GRIS e Ad-Valorem</p></TooltipContent></Tooltip>
                          </Label>
                          <Input type="number" value={parada.valorNF} onChange={e => atualizarParada(parada.id, 'valorNF', e.target.value)} className="text-sm h-9 rounded-lg bg-white/80 dark:bg-blue-950/40" step="0.01" min="0" />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Agendada */}
            <Card className="glass border-border/40 shadow-sm">
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                    <Clock size={14} />
                  </div>
                  <Checkbox id="agendada" checked={agendada} onCheckedChange={c => setAgendada(c === true)} />
                  <Label htmlFor="agendada" className="font-semibold cursor-pointer flex items-center gap-2 flex-1">
                    Entrega Agendada
                  </Label>
                  <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-dashed">Horário garantido</Badge>
                </div>
                {agendada && (
                  <div className="grid grid-cols-3 gap-4 mt-5 pl-10">
                    <div className="space-y-2"><Label className="text-xs font-medium">Data</Label><Input type="date" value={dataAgendamento} onChange={e => setDataAgendamento(e.target.value)} className="h-9 rounded-lg" /></div>
                    <div className="space-y-2"><Label className="text-xs font-medium">Horário</Label><Input type="time" value={horarioAgendado} onChange={e => setHorarioAgendado(e.target.value)} className="h-9 rounded-lg" /></div>
                    <div className="space-y-2"><Label className="text-xs font-medium">Acréscimo (R$)</Label><Input type="number" value={acrescimoAgendamento} onChange={e => setAcrescimoAgendamento(e.target.value)} step="0.01" min="0" className="h-9 rounded-lg" /></div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar — Margem + Calcular */}
          <div className="space-y-6">
            <Card className="glass border-border/40 shadow-sm sticky top-8">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                    <BrainCircuit size={14} />
                  </div>
                  Margem & Cálculo
                </CardTitle>
                <CardDescription className="text-xs">Ajuste a margem de lucro</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="margem-side" className="text-sm flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-purple-500" />
                    Margem (%)
                    <Tooltip><TooltipTrigger><Info size={12} className="text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent side="top" className="glass-strong text-xs"><p>Margem de lucro sobre o custo total</p></TooltipContent></Tooltip>
                  </Label>
                  <div className="relative">
                    <Input id="margem-side" type="number" value={margem} onChange={e => setMargem(e.target.value)} step="0.5" min="0" className="h-12 text-lg font-bold rounded-xl text-center pr-8" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">%</span>
                  </div>
                </div>

                <Button
                  onClick={calcular}
                  size="lg"
                  disabled={calculando}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  {calculando ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Calculando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Calculator size={18} /> Calcular <ArrowRight size={16} />
                    </span>
                  )}
                </Button>

                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900/50">
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                    <Info size={11} />
                    Preencha os dados ao lado e clique em Calcular
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {erro && (
          <Alert variant="destructive" className="rounded-xl border-red-200 dark:border-red-900">
            <AlertTriangle size={16} />
            <AlertTitle className="text-sm font-semibold">Erro</AlertTitle>
            <AlertDescription className="text-sm">{erro}</AlertDescription>
          </Alert>
        )}

        {/* Resultado */}
        {resultadoVisible && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {alertaBreakEven && (
              <Alert variant="destructive" className="rounded-xl border-red-200/80 dark:border-red-900/80 bg-red-50/80 dark:bg-red-950/30 backdrop-blur-sm">
                <AlertTriangle size={18} className="text-red-600" />
                <AlertTitle className="text-base font-bold text-red-800 dark:text-red-300">Preço abaixo do custo!</AlertTitle>
                <AlertDescription className="text-red-700 dark:text-red-400">
                  Você terá <strong>prejuízo de {formatarMoeda(valorPrejuizo)}</strong> nesta entrega. Ajuste a margem para evitar perda.
                </AlertDescription>
              </Alert>
            )}
            {avisoSemNF && (
              <Alert className="rounded-xl border-amber-200/80 dark:border-amber-900/80 bg-amber-50/80 dark:bg-amber-950/30 backdrop-blur-sm text-amber-800 dark:text-amber-300">
                <Info size={18} className="text-amber-600 dark:text-amber-400" />
                <AlertTitle className="font-bold text-amber-800 dark:text-amber-300 text-sm">NF não informada</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-400/80 text-sm">GRIS e Ad-Valorem não incluídos — informe o valor da NF para cálculo completo</AlertDescription>
              </Alert>
            )}

            {/* Opções */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-sm">
                  <BarChart3 size={16} />
                </div>
                <h2 className="text-lg font-bold">Opções de Custo</h2>
                <Badge variant="secondary" className="text-[10px] font-normal ml-auto">{opcoes.length} opções</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {opcoes.map((opcao, idx) => {
                  const isMaisBarata = opcao.custoTotal === opcaoMaisBarata
                  const isSelecionada = opcao.rotulo === opcaoVeiculo || (idx === 0 && opcaoVeiculo !== 'Freelancer')
                  return (
                    <Card key={opcao.rotulo} className={`
                      relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
                      ${isMaisBarata ? 'ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/10 border-emerald-400/50' : ''}
                      ${isSelecionada && !isMaisBarata ? 'ring-1 ring-blue-300/50 border-blue-300/50' : 'border-border/40'}
                    `}>
                      {isMaisBarata && (
                        <>
                          <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                            <div className="absolute top-3 right-[-32px] bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[9px] font-bold uppercase px-10 py-1 rotate-45 shadow-lg shadow-emerald-500/30">Melhor</div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
                        </>
                      )}
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`
                              w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                              ${isMaisBarata ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20' :
                                isSelecionada ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20' :
                                'bg-muted text-muted-foreground'}
                            `}>
                              {opcao.rotulo === 'Freelancer' ? <Zap size={18} /> : <Truck size={18} />}
                            </div>
                            <div>
                              <CardTitle className="text-sm">{opcao.rotulo}</CardTitle>
                              <p className="text-[10px] text-muted-foreground">{opcao.isFreelancer ? 'Freelancer' : 'Veículo próprio'}</p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="pt-1">
                          <p className="text-3xl font-bold tracking-tight">{formatarMoeda(opcao.custoTotal)}</p>
                          <p className="text-[11px] text-muted-foreground/60">custo operacional total</p>
                        </div>

                        {isSelecionada && !isMaisBarata && opcaoMaisBarata < opcao.custoTotal && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-lg px-3 py-2 flex items-center gap-1.5 border border-blue-100 dark:border-blue-900/50">
                            <Info size={12} /> Economize <strong>{formatarMoeda(opcao.custoTotal - opcaoMaisBarata)}</strong>
                          </div>
                        )}

                        <Separator className="bg-border/60" />

                        <Accordion className="w-full">
                          {opcao.custoPorParada.map((cp, pIdx) => (
                            <AccordionItem key={pIdx} value={`${idx}-${pIdx}`} className="border-b-0">
                              <AccordionTrigger className="text-xs py-1.5 hover:no-underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                <span className="flex items-center gap-1.5">
                                  <CircleDot size={8} className="text-blue-500" />
                                  {cp.zona} — <strong className="text-sm">{formatarMoeda(cp.total)}</strong>
                                </span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-1.5 text-xs text-muted-foreground pt-1 bg-muted/30 rounded-lg p-3">
                                  {cp.pesoTaxavel > 0 && <div className="flex justify-between py-0.5"><span>Peso taxável</span><span className="font-medium">{cp.pesoTaxavel.toFixed(2)} kg</span></div>}
                                  {(cp.componentes.salarioParcela > 0 || cp.componentes.valeParcela > 0 || cp.componentes.combustivelParcela > 0) && <Separator className="my-1" />}
                                  {cp.componentes.salarioParcela > 0 && <div className="flex justify-between py-0.5"><span>Salário</span><span>{formatarMoeda(cp.componentes.salarioParcela)}</span></div>}
                                  {cp.componentes.valeParcela > 0 && <div className="flex justify-between py-0.5"><span>Vale alimentação</span><span>{formatarMoeda(cp.componentes.valeParcela)}</span></div>}
                                  {cp.componentes.combustivelParcela > 0 && <div className="flex justify-between py-0.5"><span>Combustível</span><span>{formatarMoeda(cp.componentes.combustivelParcela)}</span></div>}
                                  {cp.componentes.manutencaoParcela > 0 && <div className="flex justify-between py-0.5"><span>Manutenção</span><span>{formatarMoeda(cp.componentes.manutencaoParcela)}</span></div>}
                                  {cp.componentes.seguroParcela > 0 && <div className="flex justify-between py-0.5"><span>Seguro</span><span>{formatarMoeda(cp.componentes.seguroParcela)}</span></div>}
                                  {cp.componentes.depreciacaoParcela > 0 && <div className="flex justify-between py-0.5"><span>Depreciação</span><span>{formatarMoeda(cp.componentes.depreciacaoParcela)}</span></div>}
                                  {cp.componentes.taxaFaixaPeso > 0 && <div className="flex justify-between py-0.5"><span>Taxa faixa de peso</span><span>{formatarMoeda(cp.componentes.taxaFaixaPeso)}</span></div>}
                                  {cp.componentes.gris > 0 && <div className="flex justify-between py-0.5"><span>GRIS</span><span>{formatarMoeda(cp.componentes.gris)}</span></div>}
                                  {cp.componentes.adValorem > 0 && <div className="flex justify-between py-0.5"><span>Ad-Valorem</span><span>{formatarMoeda(cp.componentes.adValorem)}</span></div>}
                                  {cp.componentes.acrescimoAgendamento > 0 && <div className="flex justify-between py-0.5"><span>Agendamento</span><span>{formatarMoeda(cp.componentes.acrescimoAgendamento)}</span></div>}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Resumo */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 dark:from-blue-950 dark:via-blue-900 dark:to-purple-950 shadow-xl shadow-blue-500/20">
              <div className="absolute inset-0 dot-pattern opacity-10" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />
              <div className="relative z-10 p-6 md:p-8">
                <div className="flex items-center gap-2 text-blue-200 mb-1">
                  <CheckCircle2 size={16} />
                  <span className="text-sm font-medium">Resultado Final</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-6">Resumo da Simulação</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="backdrop-blur-sm bg-white/10 dark:bg-white/5 rounded-2xl p-5 border border-white/10">
                    <p className="text-xs text-blue-200/70 flex items-center gap-1.5 mb-1"><Truck size={12} /> Custo operacional</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{formatarMoeda(totalGeral)}</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/10 dark:bg-white/5 rounded-2xl p-5 border border-white/10">
                    <p className="text-xs text-blue-200/70 flex items-center gap-1.5 mb-1"><TrendingUp size={12} /> Margem aplicada</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{margem}%</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/15 dark:bg-white/10 rounded-2xl p-5 border border-white/20 shadow-lg">
                    <p className="text-xs text-blue-200/80 flex items-center gap-1.5 mb-1"><DollarSign size={12} /> Preço sugerido</p>
                    <p className="text-2xl md:text-3xl font-bold text-white">{formatarMoeda(precoSugerido)}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
