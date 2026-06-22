'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calculator, Info, AlertTriangle, Plus, Trash2, Sparkles, Fuel, Truck,
  CalendarClock, ClipboardList, TrendingUp, DollarSign, MapPin, Package,
  Scale, Ruler, Receipt, Clock, CheckCircle2, Zap, ArrowRight
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

const iconeVeiculo: Record<string, React.ReactNode> = {
  KANGOO: <Truck size={18} />,
  '8-160': <Truck size={18} />,
  Freelancer: <Zap size={18} />,
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
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Nova Simulação</h1>
            <p className="text-sm text-muted-foreground mt-1">Calcule o preço ideal para sua entrega</p>
          </div>
          <Badge variant="secondary" className="text-xs gap-1 px-3 py-1.5">
            <Truck size={14} /> João Pessoa / PB
          </Badge>
        </div>

        {/* Tipo + Veículo combinados */}
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList size={16} className="text-primary" />
              Tipo de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex gap-2">
              <Button variant={tipo === 'regular' ? 'default' : 'outline'} onClick={() => setTipo('regular')} className="flex-1 sm:flex-none">
                <Package size={16} className="mr-1.5" /> Entrega Regular
              </Button>
              <Button variant={tipo === 'dedicada' ? 'default' : 'outline'} onClick={() => setTipo('dedicada')} className="flex-1 sm:flex-none">
                <CalendarClock size={16} className="mr-1.5" /> Entrega Dedicada
              </Button>
            </div>

            <Separator />

            <div>
              <Label className="text-xs text-muted-foreground mb-3 block">Veículo / Motorista</Label>
              <div className="grid grid-cols-3 gap-3">
                {OPCOES_VEICULO.map(op => (
                  <Button
                    key={op} variant={opcaoVeiculo === op ? 'default' : 'outline'}
                    className={`h-auto py-3 flex-col gap-1 text-center transition-all ${
                      opcaoVeiculo === op ? 'ring-2 ring-primary/30 shadow-sm' : ''
                    }`}
                    onClick={() => setOpcaoVeiculo(op)}
                  >
                    <span className="text-lg">{iconeVeiculo[op]}</span>
                    <span className="font-medium text-sm">{op}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entregas-dia" className="flex items-center gap-1 text-sm">
                  <TrendingUp size={14} className="text-muted-foreground" />
                  Entregas no dia
                  <Tooltip>
                    <TooltipTrigger><Info size={12} className="text-muted-foreground cursor-help" /></TooltipTrigger>
                    <TooltipContent><p>Número de entregas que o motorista fará no dia</p></TooltipContent>
                  </Tooltip>
                </Label>
                <Input id="entregas-dia" type="number" value={numeroEntregas} onChange={e => setNumeroEntregas(e.target.value)} min="1" />
              </div>
              {opcaoVeiculo === 'Freelancer' && tipo === 'regular' && (
                <div className="space-y-2">
                  <Label htmlFor="taxa-freelancer" className="flex items-center gap-1 text-sm">
                    <DollarSign size={14} className="text-muted-foreground" />
                    Taxa negociada (R$)
                    <Tooltip>
                      <TooltipTrigger><Info size={12} className="text-muted-foreground cursor-help" /></TooltipTrigger>
                      <TooltipContent><p>Valor único para o trabalho inteiro</p></TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input id="taxa-freelancer" type="number" value={taxaFreelancer} onChange={e => setTaxaFreelancer(e.target.value)} step="0.01" min="0" />
                </div>
              )}
              {tipo === 'dedicada' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dias-dedicada" className="flex items-center gap-1 text-sm">
                      <CalendarClock size={14} className="text-muted-foreground" /> Dias
                    </Label>
                    <Input id="dias-dedicada" type="number" value={diasDedicada} onChange={e => setDiasDedicada(e.target.value)} min="1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="km-estimado" className="flex items-center gap-1 text-sm">
                      <MapPin size={14} className="text-muted-foreground" /> Km estimado
                      <Tooltip><TooltipTrigger><Info size={12} className="text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>Distância total estimada do trabalho</p></TooltipContent></Tooltip>
                    </Label>
                    <Input id="km-estimado" type="number" value={kmEstimado} onChange={e => setKmEstimado(e.target.value)} step="0.1" min="0" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox id="ajudante" checked={ajudante} onCheckedChange={c => setAjudante(c === true)} />
                    <Label htmlFor="ajudante" className="font-medium cursor-pointer text-sm">Ajudante / auxiliar</Label>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Paradas */}
        {tipo === 'regular' && (
          <Card className="shadow-sm border-border/60">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin size={16} className="text-primary" />
                  Paradas
                </CardTitle>
                <Button variant="outline" size="sm" onClick={adicionarParada} className="h-8 gap-1">
                  <Plus size={14} /> Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {paradas.map((parada, idx) => (
                <div key={parada.id} className="p-4 bg-muted/40 border border-border/40 rounded-xl space-y-3 transition-all hover:border-border/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                      <span className="text-sm font-medium">Parada {idx + 1}</span>
                    </div>
                    {paradas.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removerParada(parada.id)} className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={10} /> Zona</Label>
                      <Select value={parada.zona} onValueChange={v => atualizarParada(parada.id, 'zona', v ?? '')}>
                        <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                        <SelectContent>{ZONAS.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><Scale size={10} /> Peso real (kg)</Label>
                      <Input type="number" value={parada.pesoReal || ''} onChange={e => atualizarParada(parada.id, 'pesoReal', parseFloat(e.target.value) || 0)} className="text-sm h-9" step="0.1" min="0" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1"><Ruler size={10} /> Cx × Lg × Alt (m)</Label>
                      <div className="flex gap-1">
                        <Input type="number" value={parada.comprimento} onChange={e => atualizarParada(parada.id, 'comprimento', e.target.value)} className="text-sm h-9 w-1/3" step="0.01" placeholder="C" />
                        <Input type="number" value={parada.largura} onChange={e => atualizarParada(parada.id, 'largura', e.target.value)} className="text-sm h-9 w-1/3" step="0.01" placeholder="L" />
                        <Input type="number" value={parada.altura} onChange={e => atualizarParada(parada.id, 'altura', e.target.value)} className="text-sm h-9 w-1/3" step="0.01" placeholder="A" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Receipt size={10} /> Valor NF (R$)
                        <Tooltip><TooltipTrigger><Info size={10} className="text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>Opcional. Para GRIS e Ad-Valorem</p></TooltipContent></Tooltip>
                      </Label>
                      <Input type="number" value={parada.valorNF} onChange={e => atualizarParada(parada.id, 'valorNF', e.target.value)} className="text-sm h-9" step="0.01" min="0" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Agendada */}
        <Card className="shadow-sm border-border/60">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Checkbox id="agendada" checked={agendada} onCheckedChange={c => setAgendada(c === true)} />
              <Label htmlFor="agendada" className="font-semibold cursor-pointer flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                Entrega Agendada
              </Label>
              <Badge variant="secondary" className="text-[10px] font-normal">Horário garantido</Badge>
            </div>
            {agendada && (
              <div className="grid grid-cols-3 gap-4 mt-4 pl-7">
                <div className="space-y-2"><Label htmlFor="data-agendamento" className="text-xs">Data</Label><Input id="data-agendamento" type="date" value={dataAgendamento} onChange={e => setDataAgendamento(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="horario-agendado" className="text-xs">Horário</Label><Input id="horario-agendado" type="time" value={horarioAgendado} onChange={e => setHorarioAgendado(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="acrescimo-agendamento" className="text-xs">Acréscimo (R$)</Label><Input id="acrescimo-agendamento" type="number" value={acrescimoAgendamento} onChange={e => setAcrescimoAgendamento(e.target.value)} step="0.01" min="0" /></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Margem + Calcular */}
        <Card className="shadow-sm border-border/60 bg-gradient-to-r from-background to-muted/30">
          <CardContent className="pt-6">
            <div className="flex items-end gap-4">
              <div className="space-y-2 max-w-[200px]">
                <Label htmlFor="margem" className="flex items-center gap-1 text-sm">
                  <TrendingUp size={14} className="text-primary" />
                  Margem (%)
                  <Tooltip><TooltipTrigger><Info size={12} className="text-muted-foreground cursor-help" /></TooltipTrigger><TooltipContent><p>Margem de lucro sobre o custo total</p></TooltipContent></Tooltip>
                </Label>
                <Input id="margem" type="number" value={margem} onChange={e => setMargem(e.target.value)} step="0.5" min="0" />
              </div>
              <Button onClick={calcular} size="lg" disabled={calculando} className="min-w-[160px] shadow-sm">
                {calculando ? 'Calculando...' : <>
                  <Calculator size={18} className="mr-2" /> Calcular
                </>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {erro && <Alert variant="destructive"><AlertTriangle size={16} /><AlertTitle>Erro</AlertTitle><AlertDescription>{erro}</AlertDescription></Alert>}

        {/* Resultado */}
        {resultadoVisible && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {alertaBreakEven && (
              <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
                <AlertTriangle size={18} />
                <AlertTitle className="text-base">Preço abaixo do custo!</AlertTitle>
                <AlertDescription>Você terá prejuízo de <strong>{formatarMoeda(valorPrejuizo)}</strong> nesta entrega. Ajuste a margem.</AlertDescription>
              </Alert>
            )}
            {avisoSemNF && (
              <Alert className="border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
                <Info size={18} className="text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-300">NF não informada</AlertTitle>
                <AlertDescription>GRIS e Ad-Valorem não incluídos — informe o valor da NF para cálculo completo</AlertDescription>
              </Alert>
            )}

            {/* Opções lado a lado */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Opções de Custo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {opcoes.map((opcao, idx) => {
                  const isMaisBarata = opcao.custoTotal === opcaoMaisBarata
                  const isSelecionada = opcao.rotulo === opcaoVeiculo || (idx === 0 && opcaoVeiculo !== 'Freelancer')
                  return (
                    <Card key={opcao.rotulo} className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${
                      isSelecionada ? 'border-primary/50 ring-1 ring-primary/20' : ''
                    } ${isMaisBarata ? 'ring-2 ring-emerald-500/30 border-emerald-500/50' : ''}`}>
                      {isMaisBarata && <div className="absolute top-0 right-0 w-16 h-16">
                        <div className="absolute top-2 right-[-28px] bg-emerald-500 text-white text-[9px] font-bold uppercase px-8 py-0.5 rotate-45 shadow-sm">Melhor</div>
                      </div>}
                      <CardHeader className={`pb-3 ${isSelecionada ? '' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                              isMaisBarata ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                              isSelecionada ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                            }`}>
                              {opcao.rotulo === 'Freelancer' ? <Zap size={16} /> : <Truck size={16} />}
                            </div>
                            <CardTitle className="text-sm">{opcao.rotulo}</CardTitle>
                          </div>
                          {isMaisBarata && <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-[10px] px-2 py-0"><Sparkles size={10} className="mr-0.5" /> Menor custo</Badge>}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-2xl font-bold tracking-tight">{formatarMoeda(opcao.custoTotal)}</p>
                          <p className="text-[11px] text-muted-foreground">custo total</p>
                        </div>

                        {isSelecionada && !isMaisBarata && opcaoMaisBarata < opcao.custoTotal && (
                          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 flex items-center gap-1.5">
                            <Info size={12} /> Economize {formatarMoeda(opcao.custoTotal - opcaoMaisBarata)} com a opção mais barata
                          </div>
                        )}

                        <Separator />

                        <Accordion className="w-full">
                          {opcao.custoPorParada.map((cp, pIdx) => (
                            <AccordionItem key={pIdx} value={`${idx}-${pIdx}`} className="border-b-0">
                              <AccordionTrigger className="text-xs py-1.5 hover:no-underline">
                                <span className="flex items-center gap-1.5">
                                  <MapPin size={10} className="text-muted-foreground" />
                                  {cp.zona} — <strong>{formatarMoeda(cp.total)}</strong>
                                </span>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-1 text-xs text-muted-foreground pt-1">
                                  {cp.pesoTaxavel > 0 && <div className="flex justify-between"><span>Peso taxável</span><span>{cp.pesoTaxavel.toFixed(2)} kg</span></div>}
                                  {cp.componentes.salarioParcela > 0 && <div className="flex justify-between"><span>Salário</span><span>{formatarMoeda(cp.componentes.salarioParcela)}</span></div>}
                                  {cp.componentes.valeParcela > 0 && <div className="flex justify-between"><span>Vale alimentação</span><span>{formatarMoeda(cp.componentes.valeParcela)}</span></div>}
                                  {cp.componentes.combustivelParcela > 0 && <div className="flex justify-between"><span>Combustível</span><span>{formatarMoeda(cp.componentes.combustivelParcela)}</span></div>}
                                  {cp.componentes.manutencaoParcela > 0 && <div className="flex justify-between"><span>Manutenção</span><span>{formatarMoeda(cp.componentes.manutencaoParcela)}</span></div>}
                                  {cp.componentes.seguroParcela > 0 && <div className="flex justify-between"><span>Seguro</span><span>{formatarMoeda(cp.componentes.seguroParcela)}</span></div>}
                                  {cp.componentes.depreciacaoParcela > 0 && <div className="flex justify-between"><span>Depreciação</span><span>{formatarMoeda(cp.componentes.depreciacaoParcela)}</span></div>}
                                  {cp.componentes.taxaFaixaPeso > 0 && <div className="flex justify-between"><span>Taxa faixa de peso</span><span>{formatarMoeda(cp.componentes.taxaFaixaPeso)}</span></div>}
                                  {cp.componentes.gris > 0 && <div className="flex justify-between"><span>GRIS</span><span>{formatarMoeda(cp.componentes.gris)}</span></div>}
                                  {cp.componentes.adValorem > 0 && <div className="flex justify-between"><span>Ad-Valorem</span><span>{formatarMoeda(cp.componentes.adValorem)}</span></div>}
                                  {cp.componentes.acrescimoAgendamento > 0 && <div className="flex justify-between"><span>Agendamento</span><span>{formatarMoeda(cp.componentes.acrescimoAgendamento)}</span></div>}
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

            {/* Resumo Final */}
            <Card className="shadow-md border-primary/10 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-primary" />
                  Resumo da Simulação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1 p-4 bg-muted/40 rounded-xl">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Truck size={12} /> Custo operacional</p>
                    <p className="text-xl font-bold">{formatarMoeda(totalGeral)}</p>
                  </div>
                  <div className="space-y-1 p-4 bg-muted/40 rounded-xl">
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp size={12} /> Margem aplicada</p>
                    <p className="text-xl font-bold">{margem}%</p>
                  </div>
                  <div className="space-y-1 p-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/10">
                    <p className="text-xs text-primary/70 flex items-center gap-1"><DollarSign size={12} /> Preço sugerido</p>
                    <p className="text-2xl font-bold text-primary">{formatarMoeda(precoSugerido)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
