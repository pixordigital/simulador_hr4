'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Calculator, Clock, FileText, Users, Settings, LogOut, Sun, Moon, Info,
  ChevronDown, ChevronUp, AlertTriangle, Plus, Trash2, Search, Filter,
  DollarSign, ArrowLeft, Play, Edit3, Save, Check, X, GripVertical,
  Sparkles
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Alert, AlertDescription, AlertTitle
} from '@/components/ui/alert'
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

type Parada = {
  id: string
  zona: string
  pesoReal: number
  comprimento: string
  largura: string
  altura: string
  valorNF: string
}

type CustoComponente = {
  salarioParcela: number
  valeParcela: number
  combustivelParcela: number
  manutencaoParcela: number
  seguroParcela: number
  depreciacaoParcela: number
  taxaFaixaPeso: number
  gris: number
  adValorem: number
  acrescimoAgendamento: number
}

type Opcao = {
  rotulo: string
  custoTotal: number
  custoPorParada: {
    zona: string
    pesoTaxavel: number
    total: number
    componentes: CustoComponente
  }[]
  isFreelancer: boolean
}

const ZONAS = ['João Pessoa', 'Cabedelo', 'Conde', 'Santa Rita', 'Bayeux', 'Alhandra']

const OPCOES_VEICULO = ['KANGOO', '8-160', 'Freelancer'] as const

export default function SimulacaoPage() {
  const [tipo, setTipo] = useState<'regular' | 'dedicada'>('regular')
  const [opcaoVeiculo, setOpcaoVeiculo] = useState<string>('KANGOO')
  const [numeroEntregas, setNumeroEntregas] = useState('8')
  const [margem, setMargem] = useState('8')
  const [taxaFreelancer, setTaxaFreelancer] = useState('')
  const [paradas, setParadas] = useState<Parada[]>([criarParada()])
  const [resultadoVisible, setResultadoVisible] = useState(false)
  const [detalhesAbertos, setDetalhesAbertos] = useState<Record<number, boolean>>({})
  const [erro, setErro] = useState('')

  // Dedicada
  const [diasDedicada, setDiasDedicada] = useState('1')
  const [kmEstimado, setKmEstimado] = useState('')
  const [ajudante, setAjudante] = useState(false)

  // Agendada
  const [agendada, setAgendada] = useState(false)
  const [dataAgendamento, setDataAgendamento] = useState('')
  const [horarioAgendado, setHorarioAgendado] = useState('')
  const [acrescimoAgendamento, setAcrescimoAgendamento] = useState('0')

  // Resultado
  const [opcoes, setOpcoes] = useState<Opcao[]>([])
  const [totalGeral, setTotalGeral] = useState(0)
  const [precoSugerido, setPrecoSugerido] = useState(0)
  const [alertaBreakEven, setAlertaBreakEven] = useState(false)
  const [valorPrejuizo, setValorPrejuizo] = useState(0)
  const [avisoSemNF, setAvisoSemNF] = useState(false)

  function criarParada(): Parada {
    return {
      id: Math.random().toString(36).slice(2),
      zona: '',
      pesoReal: 0,
      comprimento: '',
      largura: '',
      altura: '',
      valorNF: '',
    }
  }

  const adicionarParada = () => {
    setParadas([...paradas, criarParada()])
  }

  const removerParada = (id: string) => {
    if (paradas.length <= 1) return
    setParadas(paradas.filter(p => p.id !== id))
  }

  const atualizarParada = (id: string, campo: keyof Parada, valor: string | number) => {
    setParadas(paradas.map(p => (p.id === id ? { ...p, [campo]: valor } : p)))
  }

  const toggleDetalhe = (idx: number) => {
    setDetalhesAbertos(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const calcular = useCallback(async () => {
    setErro('')

    if (tipo === 'regular') {
      if (!paradas.every(p => p.zona && p.pesoReal > 0)) {
        setErro('Preencha zona e peso de todas as paradas')
        return
      }
      if (opcaoVeiculo === 'Freelancer' && !taxaFreelancer) {
        setErro('Informe a taxa do freelancer')
        return
      }
    }

    if (tipo === 'dedicada') {
      if (!kmEstimado) {
        setErro('Informe o km estimado da rota')
        return
      }
    }

    let configs: any
    try {
      const [geralRes, motoristasRes, taxasRes, dedicadaRes] = await Promise.all([
        fetch('/api/configuracoes?tipo=geral'),
        fetch('/api/configuracoes?tipo=motoristas'),
        fetch('/api/configuracoes?tipo=taxas'),
        fetch('/api/configuracoes?tipo=dedicada'),
      ])

      if (!geralRes.ok || !motoristasRes.ok || !taxasRes.ok || !dedicadaRes.ok) {
        throw new Error('Erro ao carregar configurações')
      }

      configs = {
        geral: await geralRes.json(),
        motoristas: await motoristasRes.json(),
        taxas: await taxasRes.json(),
        dedicada: await dedicadaRes.json(),
      }
    } catch {
      setErro('Erro ao carregar configurações do servidor')
      return
    }

    const numEntregas = parseInt(numeroEntregas) || 8

    if (tipo === 'regular') {
      const acrescimo = agendada ? (parseFloat(acrescimoAgendamento) || 0) : 0
      const margemPct = parseFloat(margem) || 8

      const paradasFormatadas = paradas.map(p => ({
        zona: p.zona,
        pesoReal: p.pesoReal,
        comprimento: p.comprimento ? parseFloat(p.comprimento) : undefined,
        largura: p.largura ? parseFloat(p.largura) : undefined,
        altura: p.altura ? parseFloat(p.altura) : undefined,
        valorNF: p.valorNF ? parseFloat(p.valorNF) : undefined,
      }))

      const response = await fetch('/api/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'regular',
          paradas: paradasFormatadas,
          numeroEntregasDia: numEntregas,
          margemPct: margemPct,
          agendada,
          acrescimoAgendamento: acrescimo,
          taxaFreelancer: opcaoVeiculo === 'Freelancer' ? (parseFloat(taxaFreelancer) || 0) : undefined,
          configs,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setErro(data.erro || 'Erro ao calcular')
        return
      }

      const data = await response.json()

      const opcoesFormatadas: Opcao[] = data.opcoes.map((o: any) => ({
        rotulo: o.rotulo,
        custoTotal: o.custoTotal,
        custoPorParada: o.custoPorParada.map((cp: any, idx: number) => ({
          zona: cp.zona || paradas[idx]?.zona || '',
          pesoTaxavel: cp.pesoTaxavel || 0,
          total: cp.total || 0,
          componentes: {
            salarioParcela: cp.salarioParcela || 0,
            valeParcela: cp.valeParcela || 0,
            combustivelParcela: cp.combustivelParcela || 0,
            manutencaoParcela: cp.manutencaoParcela || 0,
            seguroParcela: cp.seguroParcela || 0,
            depreciacaoParcela: cp.depreciacaoParcela || 0,
            taxaFaixaPeso: cp.taxaFaixaPeso || 0,
            gris: cp.gris || 0,
            adValorem: cp.adValorem || 0,
            acrescimoAgendamento: cp.acrescimoAgendamento || 0,
          },
        })),
        isFreelancer: o.isFreelancer,
      }))

      setOpcoes(opcoesFormatadas)
      setTotalGeral(data.totalGeral)
      setPrecoSugerido(data.precoSugerido)
      setAlertaBreakEven(data.alertaBreakEven)
      setValorPrejuizo(data.valorPrejuizo)
      setAvisoSemNF(data.avisoSemNF)
      setResultadoVisible(true)
    } else {
      // Dedicada
      const km = parseFloat(kmEstimado) || 0
      const dias = parseInt(diasDedicada) || 1
      const margemPct = parseFloat(margem) || 8
      const acrescimo = agendada ? (parseFloat(acrescimoAgendamento) || 0) : 0

      const response = await fetch('/api/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'dedicada',
          veiculoDedicada: opcaoVeiculo,
          diasDedicada: dias,
          kmEstimadoDedicada: km,
          ajudanteDedicada: ajudante,
          margemPct,
          agendada,
          acrescimoAgendamento: acrescimo,
          configs,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setErro(data.erro || 'Erro ao calcular')
        return
      }

      const data = await response.json()

      const opcoesFormatadas: Opcao[] = data.opcoes.map((o: any) => ({
        rotulo: o.rotulo,
        custoTotal: o.custoTotal,
        custoPorParada: o.custoPorParada.map((cp: any) => ({
          zona: 'Dedicada',
          pesoTaxavel: 0,
          total: cp.total || 0,
          componentes: {
            salarioParcela: cp.salarioParcela || 0,
            valeParcela: cp.valeParcela || 0,
            combustivelParcela: cp.combustivelParcela || 0,
            manutencaoParcela: cp.manutencaoParcela || 0,
            seguroParcela: cp.seguroParcela || 0,
            depreciacaoParcela: cp.depreciacaoParcela || 0,
            taxaFaixaPeso: 0,
            gris: 0,
            adValorem: 0,
            acrescimoAgendamento: cp.acrescimoAgendamento || 0,
          },
        })),
        isFreelancer: false,
      }))

      setOpcoes(opcoesFormatadas)
      setTotalGeral(data.totalGeral)
      setPrecoSugerido(data.precoSugerido)
      setAlertaBreakEven(data.alertaBreakEven)
      setValorPrejuizo(data.valorPrejuizo)
      setAvisoSemNF(false)
      setResultadoVisible(true)
    }
  }, [tipo, paradas, opcaoVeiculo, numeroEntregas, margem, taxaFreelancer, agendada, acrescimoAgendamento, kmEstimado, diasDedicada, ajudante])

  const opcaoMaisBarata = opcoes.length > 0 ? Math.min(...opcoes.map(o => o.custoTotal)) : 0

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <TooltipProvider>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Nova Simulação</h1>
        </div>

        {/* Tipo de entrega toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Button
                variant={tipo === 'regular' ? 'default' : 'outline'}
                onClick={() => setTipo('regular')}
              >
                Entrega Regular
              </Button>
              <Button
                variant={tipo === 'dedicada' ? 'default' : 'outline'}
                onClick={() => setTipo('dedicada')}
              >
                Entrega Dedicada
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Veículo / Motorista */}
        <Card>
          <CardHeader>
            <CardTitle>Veículo / Motorista</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {OPCOES_VEICULO.map(op => (
                <Button
                  key={op}
                  variant={opcaoVeiculo === op ? 'default' : 'outline'}
                  className="h-auto py-4 text-center"
                  onClick={() => setOpcaoVeiculo(op)}
                >
                  <span className="font-medium">{op}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="entregas-dia" className="flex items-center gap-1">
                  Entregas no dia
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={14} className="text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Número de entregas que o motorista fará no dia</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="entregas-dia"
                  type="number"
                  value={numeroEntregas}
                  onChange={(e) => setNumeroEntregas(e.target.value)}
                  min="1"
                />
              </div>

              {opcaoVeiculo === 'Freelancer' && tipo === 'regular' && (
                <div className="space-y-2">
                  <Label htmlFor="taxa-freelancer" className="flex items-center gap-1">
                    Taxa negociada (R$)
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={14} className="text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Valor único para o trabalho inteiro, não por parada</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="taxa-freelancer"
                    type="number"
                    value={taxaFreelancer}
                    onChange={(e) => setTaxaFreelancer(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
              )}

              {tipo === 'dedicada' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dias-dedicada">Dias</Label>
                    <Input
                      id="dias-dedicada"
                      type="number"
                      value={diasDedicada}
                      onChange={(e) => setDiasDedicada(e.target.value)}
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="km-estimado" className="flex items-center gap-1">
                      Km estimado da rota
                      <Tooltip>
                        <TooltipTrigger>
                          <Info size={14} className="text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Distância total estimada do trabalho</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="km-estimado"
                      type="number"
                      value={kmEstimado}
                      onChange={(e) => setKmEstimado(e.target.value)}
                      step="0.1"
                      min="0"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Checkbox
                      id="ajudante"
                      checked={ajudante}
                      onCheckedChange={(checked) => setAjudante(checked === true)}
                    />
                    <Label htmlFor="ajudante" className="font-medium cursor-pointer">
                      Ajudante / auxiliar
                    </Label>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Paradas (regular) */}
        {tipo === 'regular' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Paradas</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={adicionarParada}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  <Plus size={16} className="mr-1" /> Adicionar parada
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {paradas.map((parada, idx) => (
                <div key={parada.id} className="p-4 bg-muted/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Parada {idx + 1}</h3>
                    {paradas.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removerParada(parada.id)}
                        className="text-red-500 hover:text-red-600 h-8 w-8"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Zona</Label>
                      <Select
                        value={parada.zona}
                        onValueChange={(val) => atualizarParada(parada.id, 'zona', val ?? '')}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {ZONAS.map(z => (
                            <SelectItem key={z} value={z}>{z}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Peso real (kg)</Label>
                      <Input
                        type="number"
                        value={parada.pesoReal || ''}
                        onChange={(e) => atualizarParada(parada.id, 'pesoReal', parseFloat(e.target.value) || 0)}
                        className="text-sm"
                        step="0.1"
                        min="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        Cx (m)
                        <Tooltip>
                          <TooltipTrigger>
                            <Info size={12} className="text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Comprimento da caixa em metros</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        type="number"
                        value={parada.comprimento}
                        onChange={(e) => atualizarParada(parada.id, 'comprimento', e.target.value)}
                        className="text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Lg (m)</Label>
                      <Input
                        type="number"
                        value={parada.largura}
                        onChange={(e) => atualizarParada(parada.id, 'largura', e.target.value)}
                        className="text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Alt (m)</Label>
                      <Input
                        type="number"
                        value={parada.altura}
                        onChange={(e) => atualizarParada(parada.id, 'altura', e.target.value)}
                        className="text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs flex items-center gap-1">
                        Valor NF (R$)
                        <Tooltip>
                          <TooltipTrigger>
                            <Info size={12} className="text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Opcional. Necessário para GRIS e Ad-Valorem</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        type="number"
                        value={parada.valorNF}
                        onChange={(e) => atualizarParada(parada.id, 'valorNF', e.target.value)}
                        className="text-sm"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Entrega Agendada */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Checkbox
                id="agendada"
                checked={agendada}
                onCheckedChange={(checked) => setAgendada(checked === true)}
              />
              <Label htmlFor="agendada" className="text-lg font-semibold cursor-pointer">
                Entrega Agendada
              </Label>
              <span className="text-xs text-muted-foreground">Serviço de horário garantido</span>
            </div>
          </CardHeader>
          {agendada && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-7">
                <div className="space-y-2">
                  <Label htmlFor="data-agendamento">Data</Label>
                  <Input
                    id="data-agendamento"
                    type="date"
                    value={dataAgendamento}
                    onChange={(e) => setDataAgendamento(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horario-agendado">Horário</Label>
                  <Input
                    id="horario-agendado"
                    type="time"
                    value={horarioAgendado}
                    onChange={(e) => setHorarioAgendado(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="acrescimo-agendamento">Acréscimo (R$)</Label>
                  <Input
                    id="acrescimo-agendamento"
                    type="number"
                    value={acrescimoAgendamento}
                    onChange={(e) => setAcrescimoAgendamento(e.target.value)}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Margem + Calcular */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="margem" className="flex items-center gap-1">
                  Margem (%)
                  <Tooltip>
                    <TooltipTrigger>
                      <Info size={14} className="text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Margem de lucro aplicada sobre o custo total</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Input
                  id="margem"
                  type="number"
                  value={margem}
                  onChange={(e) => setMargem(e.target.value)}
                  className="max-w-xs"
                  step="0.5"
                  min="0"
                />
              </div>
              <Button onClick={calcular} size="lg">
                <Calculator size={18} className="mr-2" /> Calcular
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Erro */}
        {erro && (
          <Alert variant="destructive">
            <AlertTriangle size={16} />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        {/* Resultado */}
        {resultadoVisible && (
          <div className="space-y-4">
            {/* Alerta break-even */}
            {alertaBreakEven && (
              <Alert variant="destructive">
                <AlertTriangle size={16} />
                <AlertTitle>Atenção: o preço sugerido está abaixo do seu custo.</AlertTitle>
                <AlertDescription>
                  Você terá prejuízo de {formatarMoeda(valorPrejuizo)} nesta entrega.
                </AlertDescription>
              </Alert>
            )}

            {/* Aviso sem NF */}
            {avisoSemNF && (
              <Alert variant="default" className="border-yellow-500/50 text-yellow-800 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950">
                <Info size={16} className="text-yellow-600 dark:text-yellow-400" />
                <AlertTitle>NF não informada</AlertTitle>
                <AlertDescription>
                  GRIS e Ad-Valorem não incluídos — informe o valor da NF para cálculo completo
                </AlertDescription>
              </Alert>
            )}

            {/* Opções lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {opcoes.map((opcao, idx) => {
                const isMaisBarata = opcao.custoTotal === opcaoMaisBarata
                const isSelecionada = opcao.rotulo === opcaoVeiculo || (idx === 0 && opcaoVeiculo !== 'Freelancer')

                return (
                  <Card
                    key={opcao.rotulo}
                    className={`relative ${isSelecionada ? 'border-primary' : ''} ${isMaisBarata ? 'ring-2 ring-primary' : ''}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{opcao.rotulo}</CardTitle>
                        {isMaisBarata && (
                          <Badge variant="default">
                            <Sparkles size={12} className="mr-1" /> Mais barato
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-2xl font-bold">
                        {formatarMoeda(opcao.custoTotal)}
                      </p>

                      {isSelecionada && !isMaisBarata && opcaoMaisBarata < opcao.custoTotal && (
                        <p className="text-xs text-muted-foreground">
                          Existe uma opção {formatarMoeda(opcao.custoTotal - opcaoMaisBarata)} mais barata disponível
                        </p>
                      )}

                      <Separator />

                      {/* Detalhamento por parada com Accordion */}
                      <Accordion className="w-full">
                        {opcao.custoPorParada.map((cp, pIdx) => (
                          <AccordionItem key={pIdx} value={`${idx}-${pIdx}`}>
                            <AccordionTrigger className="text-sm py-2">
                              <span>{cp.zona} — {formatarMoeda(cp.total)}</span>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                {cp.pesoTaxavel > 0 && <p>Peso taxável: {cp.pesoTaxavel.toFixed(2)} kg</p>}
                                {cp.componentes.salarioParcela > 0 && <p>Salário: {formatarMoeda(cp.componentes.salarioParcela)}</p>}
                                {cp.componentes.valeParcela > 0 && <p>Vale alimentação: {formatarMoeda(cp.componentes.valeParcela)}</p>}
                                {cp.componentes.combustivelParcela > 0 && <p>Combustível: {formatarMoeda(cp.componentes.combustivelParcela)}</p>}
                                {cp.componentes.manutencaoParcela > 0 && <p>Manutenção: {formatarMoeda(cp.componentes.manutencaoParcela)}</p>}
                                {cp.componentes.seguroParcela > 0 && <p>Seguro: {formatarMoeda(cp.componentes.seguroParcela)}</p>}
                                {cp.componentes.depreciacaoParcela > 0 && <p>Depreciação: {formatarMoeda(cp.componentes.depreciacaoParcela)}</p>}
                                {cp.componentes.taxaFaixaPeso > 0 && <p>Taxa faixa de peso: {formatarMoeda(cp.componentes.taxaFaixaPeso)}</p>}
                                {cp.componentes.gris > 0 && <p>GRIS: {formatarMoeda(cp.componentes.gris)}</p>}
                                {cp.componentes.adValorem > 0 && <p>Ad-Valorem: {formatarMoeda(cp.componentes.adValorem)}</p>}
                                {cp.componentes.acrescimoAgendamento > 0 && <p>Acréscimo agendamento: {formatarMoeda(cp.componentes.acrescimoAgendamento)}</p>}
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

            {/* Resumo Geral */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Custo total</p>
                    <p className="text-xl font-bold">{formatarMoeda(totalGeral)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Margem</p>
                    <p className="text-xl font-bold">{margem}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Preço sugerido ao cliente</p>
                    <p className="text-3xl font-bold text-primary">{formatarMoeda(precoSugerido)}</p>
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
