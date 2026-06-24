'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Calculator, Info, AlertTriangle, Plus, Trash2, Truck,
  CalendarClock, MapPin, Scale, Receipt, Clock, CheckCircle2, ArrowRight,
  Gauge, TrendingUp, DollarSign, Zap,
} from 'lucide-react'

type Parada = {
  id: string
  zona: string
  pesoReal: number
  comprimento: string
  largura: string
  altura: string
  valorNF: string
}

type Componentes = {
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

type CustoParadaResult = {
  zona: string
  pesoTaxavel: number
  total: number
  componentes: Componentes
}

type Opcao = {
  rotulo: string
  custoTotal: number
  isFreelancer: boolean
  custoPorParada: CustoParadaResult[]
}

const ZONAS = ['João Pessoa', 'Cabedelo', 'Conde', 'Santa Rita', 'Bayeux', 'Alhandra']
const OPCOES_VEICULO = ['KANGOO', '8-160', 'Freelancer'] as const

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

function formatarMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function SimulacaoPage() {
  const [tipo, setTipo] = useState<'regular' | 'dedicada'>('regular')
  const [opcaoVeiculo, setOpcaoVeiculo] = useState<string>('KANGOO')
  const [nomeCliente, setNomeCliente] = useState('')
  const [numeroEntregas, setNumeroEntregas] = useState('8')
  const [margem, setMargem] = useState('8')
  const [taxaFreelancer, setTaxaFreelancer] = useState('')
  const [paradas, setParadas] = useState<Parada[]>([criarParada()])
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
  const [expandido, setExpandido] = useState(false)
  const margemInputRef = useRef<HTMLInputElement>(null)

  const adicionarParada = () => setParadas([...paradas, criarParada()])
  const removerParada = (id: string) => { if (paradas.length > 1) setParadas(paradas.filter(p => p.id !== id)) }
  const atualizarParada = (id: string, campo: keyof Parada, valor: string | number) =>
    setParadas(paradas.map(p => (p.id === id ? { ...p, [campo]: valor } : p)))

  const limpar = () => {
    setNomeCliente('')
    setParadas([criarParada()])
    setOpcoes([])
    setTotalGeral(0)
    setPrecoSugerido(0)
    setAlertaBreakEven(false)
    setValorPrejuizo(0)
    setAvisoSemNF(false)
    setErro('')
    setTaxaFreelancer('')
    setAgendada(false)
    setDiasDedicada('1')
    setKmEstimado('')
    setAjudante(false)
    setDataAgendamento('')
    setHorarioAgendado('')
    setAcrescimoAgendamento('0')
    setExpandido(false)
  }

  const calcular = useCallback(async () => {
    setErro('')
    setCalculando(true)
    if (tipo === 'regular') {
      if (!paradas.every(p => p.zona && p.pesoReal > 0)) {
        setErro('Preencha zona e peso de todas as paradas')
        setCalculando(false)
        return
      }
      if (opcaoVeiculo === 'Freelancer' && !taxaFreelancer) {
        setErro('Informe a taxa do freelancer')
        setCalculando(false)
        return
      }
    }
    if (tipo === 'dedicada' && !kmEstimado) {
      setErro('Informe o km estimado da rota')
      setCalculando(false)
      return
    }

    let configs: any
    try {
      const [geralRes, motoristasRes, taxasRes, dedicadaRes] = await Promise.all([
        fetch('/api/configuracoes?tipo=geral'),
        fetch('/api/configuracoes?tipo=motoristas'),
        fetch('/api/configuracoes?tipo=taxas'),
        fetch('/api/configuracoes?tipo=dedicada'),
      ])
      if (!geralRes.ok || !motoristasRes.ok || !taxasRes.ok || !dedicadaRes.ok) throw new Error()
      configs = {
        geral: await geralRes.json(),
        motoristas: await motoristasRes.json(),
        taxas: await taxasRes.json(),
        dedicada: await dedicadaRes.json(),
      }
    } catch {
      setErro('Erro ao carregar configurações')
      setCalculando(false)
      return
    }

    const numEntregas = parseInt(numeroEntregas) || 8
    const margemPct = parseFloat(margem) || 8
    const acrescimo = agendada ? (parseFloat(acrescimoAgendamento) || 0) : 0

    try {
      const body =
        tipo === 'regular'
          ? {
              tipo: 'regular',
              margemPct,
              agendada,
              acrescimoAgendamento: acrescimo,
              numeroEntregasDia: numEntregas,
              taxaFreelancer:
                opcaoVeiculo === 'Freelancer' ? parseFloat(taxaFreelancer) || 0 : undefined,
              configs,
              paradas: paradas.map(p => ({
                zona: p.zona,
                pesoReal: p.pesoReal,
                comprimento: p.comprimento ? parseFloat(p.comprimento) : undefined,
                largura: p.largura ? parseFloat(p.largura) : undefined,
                altura: p.altura ? parseFloat(p.altura) : undefined,
                valorNF: p.valorNF ? parseFloat(p.valorNF) : undefined,
              })),
            }
          : {
              tipo: 'dedicada',
              margemPct,
              agendada,
              acrescimoAgendamento: acrescimo,
              veiculoDedicada: opcaoVeiculo,
              diasDedicada: parseInt(diasDedicada) || 1,
              kmEstimadoDedicada: parseFloat(kmEstimado) || 0,
              ajudanteDedicada: ajudante,
              configs,
            }

      const res = await fetch('/api/simular', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        setErro(d.erro || 'Erro ao calcular')
        setCalculando(false)
        return
      }
      const data = await res.json()
      const fmt = (o: any) => ({
        rotulo: o.rotulo,
        custoTotal: o.custoTotal,
        isFreelancer: o.isFreelancer,
        custoPorParada: o.custoPorParada.map((cp: any) => ({
          zona: cp.zona || '',
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
      })
      setOpcoes(data.opcoes.map(fmt))
      setTotalGeral(data.totalGeral)
      setPrecoSugerido(data.precoSugerido)
      setAlertaBreakEven(data.alertaBreakEven)
      setValorPrejuizo(data.valorPrejuizo)
      setAvisoSemNF(data.avisoSemNF)
    } catch {
      setErro('Erro interno ao calcular')
    } finally {
      setCalculando(false)
    }
  }, [tipo, paradas, opcaoVeiculo, numeroEntregas, margem, taxaFreelancer, agendada, acrescimoAgendamento, kmEstimado, diasDedicada, ajudante])

  const opcaoMaisBarata = opcoes.length > 0 ? Math.min(...opcoes.map(o => o.custoTotal)) : 0

  // Margem slider sync
  const margemNum = parseFloat(margem) || 0
  const handleMargemSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMargem(e.target.value)
  }

  return (
    <div className="space-y-0">
      {/* Visível? O layout tem sidebar + main agora */}
      {erro && (
        <div className="mb-6 border-l-[3px] border-l-[#B91C1C] bg-[#B91C1C]/5 p-3 rounded-[4px]">
          <p className="text-[#B91C1C] text-sm font-medium flex items-center gap-2">
            <AlertTriangle size={14} />
            {erro}
          </p>
        </div>
      )}

      <div className="flex gap-0">
        {/* ===== COLUNA ESQUERDA (58%) ===== */}
        <div className="w-[58%] pr-8 border-r border-[#E0DFDD] dark:border-[#1F2937]">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1
                className="text-[28px] font-bold tracking-tight text-text-primary"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}
              >
                Nova Simulação
              </h1>
            </div>
            <button
              onClick={limpar}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-transparent"
            >
              Limpar
            </button>
          </div>

          {/* Cliente */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
              Cliente
            </label>
            <input
              type="text"
              value={nomeCliente}
              onChange={e => setNomeCliente(e.target.value)}
              placeholder="Nome do cliente"
              className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-text-primary text-sm outline-none focus:border-[#F97316] focus:border-2 transition-colors placeholder:text-[#A8A29E] dark:placeholder:text-[#6B7280]"
            />
          </div>

          {/* Motorista / Veículo */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-text-secondary mb-2">
              Motorista / Veículo
            </label>
            <div className="flex gap-2 flex-wrap">
              {OPCOES_VEICULO.map(op => {
                const ativo = opcaoVeiculo === op
                return (
                  <button
                    key={op}
                    onClick={() => setOpcaoVeiculo(op)}
                    className={`
                      text-[13px] font-medium px-3.5 py-1.5 rounded-[4px] border transition-colors duration-100
                      ${ativo
                        ? 'border-[#F97316] border-2 text-[#F97316] bg-[#F97316]/5'
                        : 'border-[#A8A29E] dark:border-[#374151] text-text-secondary hover:border-text-secondary dark:hover:border-text-secondary'
                      }
                    `}
                  >
                    {op}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Entregas no dia */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
              Entregas do dia
            </label>
            <input
              type="number"
              value={numeroEntregas}
              onChange={e => setNumeroEntregas(e.target.value)}
              min="1"
              className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-text-primary text-sm outline-none focus:border-[#F97316] focus:border-2 transition-colors"
            />
          </div>

          {/* Freelancer taxa */}
          {opcaoVeiculo === 'Freelancer' && tipo === 'regular' && (
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">
                Taxa negociada (R$)
              </label>
              <input
                type="number"
                value={taxaFreelancer}
                onChange={e => setTaxaFreelancer(e.target.value)}
                step="0.01"
                min="0"
                placeholder="Valor único para o trabalho"
                className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-text-primary text-sm outline-none focus:border-[#F97316] focus:border-2 transition-colors placeholder:text-[#A8A29E] dark:placeholder:text-[#6B7280]"
              />
            </div>
          )}

          {/* Dedicada fields */}
          {tipo === 'dedicada' && (
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Dias</label>
                <input
                  type="number"
                  value={diasDedicada}
                  onChange={e => setDiasDedicada(e.target.value)}
                  min="1"
                  className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-text-primary text-sm outline-none focus:border-[#F97316] focus:border-2 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Km estimado</label>
                <input
                  type="number"
                  value={kmEstimado}
                  onChange={e => setKmEstimado(e.target.value)}
                  step="0.1"
                  min="0"
                  className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-text-primary text-sm outline-none focus:border-[#F97316] focus:border-2 transition-colors"
                />
              </div>
              <div className="col-span-2 flex items-center gap-3 pt-1">
                <input
                  type="checkbox"
                  id="ajudante"
                  checked={ajudante}
                  onChange={e => setAjudante(e.target.checked)}
                  className="rounded-[3px] border-[#A8A29E] text-[#F97316] focus:ring-[#F97316]"
                />
                <label htmlFor="ajudante" className="text-sm text-text-primary cursor-pointer">
                  Adicionar ajudante / auxiliar
                </label>
              </div>
            </div>
          )}

          {/* Separador */}
          <div className="h-px bg-[#E0DFDD] dark:bg-[#1F2937] mb-6" />

          {/* Paradas (só regular) */}
          {tipo === 'regular' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
                  Paradas
                </span>
                <button
                  onClick={adicionarParada}
                  className="text-[13px] font-medium text-[#F97316] hover:text-[#C2590A] transition-colors flex items-center gap-1"
                >
                  <Plus size={14} />
                  Adicionar
                </button>
              </div>

              {/* Mini-header da tabela */}
              <div className="grid grid-cols-12 gap-3 mb-2 px-1">
                <span className="col-span-2 text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">Zona</span>
                <span className="col-span-2 text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">Peso</span>
                <span className="col-span-3 text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">Dimensões (C×L×A m)</span>
                <span className="col-span-2 text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">Valor NF</span>
                <span className="col-span-1" />
              </div>

              <div className="space-y-1.5">
                {paradas.map((parada, idx) => (
                  <div
                    key={parada.id}
                    className="grid grid-cols-12 gap-3 items-center py-2 border-b border-[#E0DFDD] dark:border-[#1F2937]"
                  >
                    <div className="col-span-2">
                      <select
                        value={parada.zona}
                        onChange={e => atualizarParada(parada.id, 'zona', e.target.value)}
                        className="w-full h-[34px] px-2 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
                      >
                        <option value="">Zona</option>
                        {ZONAS.map(z => (
                          <option key={z} value={z}>{z}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={parada.pesoReal || ''}
                        onChange={e => atualizarParada(parada.id, 'pesoReal', parseFloat(e.target.value) || 0)}
                        step="0.1"
                        min="0"
                        placeholder="kg"
                        className="w-full h-[34px] px-2 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2 placeholder:text-[#A8A29E] dark:placeholder:text-[#6B7280]"
                      />
                    </div>
                    <div className="col-span-3 flex gap-1">
                      <input
                        type="number"
                        value={parada.comprimento}
                        onChange={e => atualizarParada(parada.id, 'comprimento', e.target.value)}
                        step="0.01"
                        placeholder="C"
                        className="w-full h-[34px] px-2 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2 placeholder:text-[#A8A29E] dark:placeholder:text-[#6B7280]"
                      />
                      <input
                        type="number"
                        value={parada.largura}
                        onChange={e => atualizarParada(parada.id, 'largura', e.target.value)}
                        step="0.01"
                        placeholder="L"
                        className="w-full h-[34px] px-2 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2 placeholder:text-[#A8A29E] dark:placeholder:text-[#6B7280]"
                      />
                      <input
                        type="number"
                        value={parada.altura}
                        onChange={e => atualizarParada(parada.id, 'altura', e.target.value)}
                        step="0.01"
                        placeholder="A"
                        className="w-full h-[34px] px-2 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2 placeholder:text-[#A8A29E] dark:placeholder:text-[#6B7280]"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={parada.valorNF}
                        onChange={e => atualizarParada(parada.id, 'valorNF', e.target.value)}
                        step="0.01"
                        min="0"
                        placeholder="R$"
                        className="w-full h-[34px] px-2 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2 placeholder:text-[#A8A29E] dark:placeholder:text-[#6B7280]"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {paradas.length > 1 && (
                        <button
                          onClick={() => removerParada(parada.id)}
                          className="text-text-secondary hover:text-[#B91C1C] transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weight ruler — visible when any parada has pesoReal > 0 */}
              {paradas.some(p => p.pesoReal > 0) && (
                <div className="mt-6 mb-2">
                  <PesoRuler paradas={paradas} />
                </div>
              )}
            </div>
          )}

          {/* Tipo selector (fora do box — no topo) não, vamos usar tabs no topo */}
          <div className="mb-6">
            <div className="flex gap-1 border border-[#E0DFDD] dark:border-[#1F2937] rounded-[4px] p-0.5 w-fit">
              <button
                onClick={() => setTipo('regular')}
                className={`px-4 py-1.5 text-[13px] font-medium rounded-[3px] transition-colors ${
                  tipo === 'regular'
                    ? 'bg-[#F97316] text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Regular
              </button>
              <button
                onClick={() => setTipo('dedicada')}
                className={`px-4 py-1.5 text-[13px] font-medium rounded-[3px] transition-colors ${
                  tipo === 'dedicada'
                    ? 'bg-[#F97316] text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Dedicada
              </button>
            </div>
          </div>

          {/* Entrega Agendada */}
          <div className="mb-4">
            <div className="flex items-center gap-3 py-3 border-t border-[#E0DFDD] dark:border-[#1F2937] pt-5">
              <input
                type="checkbox"
                id="agendada"
                checked={agendada}
                onChange={e => setAgendada(e.target.checked)}
                className="rounded-[3px] border-[#A8A29E] text-[#F97316] focus:ring-[#F97316]"
              />
              <label htmlFor="agendada" className="text-sm font-medium text-text-primary cursor-pointer">
                Entrega Agendada
              </label>
            </div>
            {agendada && (
              <div className="grid grid-cols-3 gap-4 mt-3 mb-3">
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Data</label>
                  <input
                    type="date"
                    value={dataAgendamento}
                    onChange={e => setDataAgendamento(e.target.value)}
                    className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Horário</label>
                  <input
                    type="time"
                    value={horarioAgendado}
                    onChange={e => setHorarioAgendado(e.target.value)}
                    className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Acréscimo (R$)</label>
                  <input
                    type="number"
                    value={acrescimoAgendamento}
                    onChange={e => setAcrescimoAgendamento(e.target.value)}
                    step="0.01"
                    min="0"
                    className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary outline-none focus:border-[#F97316] focus:border-2"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== COLUNA DIREITA (42%) ===== */}
        <div className="w-[42%] pl-8">
          {opcoes.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <p
                className="text-[18px] text-text-secondary mb-3"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
              >
                Preencha os dados da entrega para ver a cotação em tempo real.
              </p>
              <div className="w-12 border-t border-[#E0DFDD] dark:border-[#1F2937] my-4" />
              <p className="text-[14px] text-[#A8A29E] dark:text-[#6B7280]">
                Custo do motorista, frete por faixa e margem calculados automaticamente.
              </p>
            </div>
          ) : (
            /* Active state */
            <div className="space-y-5">
              {alertaBreakEven && (
                <div className="border-l-[3px] border-l-[#B91C1C] bg-[#B91C1C]/5 p-3 rounded-[4px]">
                  <p className="text-[#B91C1C] text-sm font-medium">
                    ⚑ Atenção: o preço sugerido está abaixo do seu custo. Você terá prejuízo de {formatarMoeda(valorPrejuizo)} nesta entrega.
                  </p>
                </div>
              )}

              {avisoSemNF && (
                <div className="border-l-[3px] border-l-[#92400E] bg-[#92400E]/5 p-3 rounded-[4px]">
                  <p className="text-[#92400E] text-sm font-medium">
                    GRIS e Ad-Valorem não incluídos — informe o valor da NF para cálculo completo.
                  </p>
                </div>
              )}

              {/* Cards de custo — 3 colunas lado a lado */}
              <div className="grid grid-cols-3 gap-3">
                {opcoes.map((opcao) => {
                  const isMaisBarata = opcao.custoTotal === opcaoMaisBarata
                  const isSelecionada =
                    opcao.rotulo === opcaoVeiculo ||
                    (opcao.rotulo === 'KANGOO' && !['KANGOO', 'Freelancer'].includes(opcaoVeiculo) && opcao.rotulo === opcaoVeiculo)

                  // Simplificar: testa se o rótulo corresponde à opção selecionada
                  const selecionada = opcao.rotulo === opcaoVeiculo

                  return (
                    <div
                      key={opcao.rotulo}
                      className={`
                        relative rounded-[6px] p-4 border
                        ${isMaisBarata
                          ? 'border-[#15803D] border-2'
                          : selecionada
                          ? 'border-[#F97316] border-2'
                          : 'border-[#E0DFDD] dark:border-[#1F2937]'}
                      `}
                    >
                      {isMaisBarata && (
                        <span className="inline-block text-[11px] font-medium text-[#15803D] bg-[#15803D]/10 px-2 py-0.5 rounded-[3px] mb-2">
                          ↓ Menor custo
                        </span>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm font-semibold text-text-primary">
                          {opcao.rotulo}
                        </span>
                        {opcao.isFreelancer && (
                          <span className="text-[11px] text-text-secondary">Freelancer</span>
                        )}
                      </div>
                      <p
                        className="text-[24px] font-medium text-text-primary mb-1"
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}
                      >
                        {formatarMoeda(opcao.custoTotal)}
                      </p>

                      {selecionada && !isMaisBarata && opcaoMaisBarata < opcao.custoTotal && (
                        <p className="text-[13px] text-text-secondary mt-2">
                          ↑ {formatarMoeda(opcao.custoTotal - opcaoMaisBarata)} a mais que a opção mais barata
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Detalhamento */}
              <button
                onClick={() => setExpandido(!expandido)}
                className="text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                {expandido ? '▲ Recolher detalhamento' : '▼ Ver detalhamento'}
              </button>

              {expandido && (
                <div className="space-y-2 text-sm border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-4">
                  {opcoes.map(opcao =>
                    opcao.custoPorParada.map((cp, pIdx) => (
                      <div key={`${opcao.rotulo}-${pIdx}`} className="mb-3">
                        <p className="text-[13px] font-medium text-text-secondary mb-1">
                          {cp.zona}
                        </p>
                        <div className="space-y-0.5 text-[13px]">
                          {cp.componentes.salarioParcela > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Parcela do salário</span>
                              <span className="font-num">{formatarMoeda(cp.componentes.salarioParcela)}</span>
                            </div>
                          )}
                          {cp.componentes.valeParcela > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Vale alimentação</span>
                              <span className="font-num">{formatarMoeda(cp.componentes.valeParcela)}</span>
                            </div>
                          )}
                          {cp.componentes.combustivelParcela > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Combustível</span>
                              <span className="font-num">{formatarMoeda(cp.componentes.combustivelParcela)}</span>
                            </div>
                          )}
                          {cp.componentes.manutencaoParcela > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Manutenção</span>
                              <span className="font-num">{formatarMoeda(cp.componentes.manutencaoParcela)}</span>
                            </div>
                          )}
                          {cp.componentes.seguroParcela > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Seguro</span>
                              <span className="font-num">{formatarMoeda(cp.componentes.seguroParcela)}</span>
                            </div>
                          )}
                          {cp.componentes.depreciacaoParcela > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Depreciação</span>
                              <span className="font-num">{formatarMoeda(cp.componentes.depreciacaoParcela)}</span>
                            </div>
                          )}
                          {cp.componentes.taxaFaixaPeso > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Frete por faixa</span>
                              <span className="font-num">{formatarMoeda(cp.componentes.taxaFaixaPeso)}</span>
                            </div>
                          )}
                          {cp.componentes.gris > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">GRIS</span>
                              <span className="font-num">{formatarMoeda(cp.componentes.gris)}</span>
                            </div>
                          )}
                          {cp.componentes.adValorem > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Ad-Valorem</span>
                              <span className="font-num">{formatarMoeda(cp.componentes.adValorem)}</span>
                            </div>
                          )}
                          {cp.componentes.acrescimoAgendamento > 0 && (
                            <div className="flex justify-between">
                              <span className="text-text-secondary">Acréscimo agendamento</span>
                              <span className="font-num">{formatarMoeda(cp.componentes.acrescimoAgendamento)}</span>
                            </div>
                          )}
                          <div className="border-t border-[#A8A29E] dark:border-[#374151] mt-1 pt-1 flex justify-between font-semibold">
                            <span className="text-text-primary">Total</span>
                            <span className="font-num">{formatarMoeda(cp.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Margem */}
              <div className="border-t border-[#E0DFDD] dark:border-[#1F2937] pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[13px] font-medium text-text-secondary">Margem</label>
                  <input
                    ref={margemInputRef}
                    type="number"
                    value={margem}
                    onChange={e => setMargem(e.target.value)}
                    step="0.5"
                    min="0"
                    className="w-20 h-[34px] px-2 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm text-text-primary text-right outline-none focus:border-[#F97316] focus:border-2 font-num"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={margemNum}
                  onChange={handleMargemSlider}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[#E0DFDD] dark:bg-[#1F2937]
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F97316] [&::-webkit-slider-thumb]:border-none
                    [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </div>

              {/* Preço Sugerido */}
              <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-secondary mb-1">
                  Preço Sugerido
                </p>
                <p
                  className="text-[36px] font-bold text-[#F97316]"
                  style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}
                >
                  {formatarMoeda(precoSugerido)}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={calcular}
                  disabled={calculando}
                  className="flex-1 h-10 bg-[#F97316] hover:bg-[#C2590A] text-white text-sm font-semibold rounded-[6px] transition-colors duration-100 disabled:opacity-50"
                >
                  {calculando ? 'Calculando...' : 'Calcular'}
                </button>
                <button className="flex-1 h-10 border border-[#A8A29E] dark:border-[#374151] text-text-primary text-sm font-medium rounded-[6px] hover:bg-[#EBEBEA] dark:hover:bg-[#1F2937] transition-colors">
                  Salvar cotação
                </button>
                <button className="flex-1 h-10 border border-[#A8A29E] dark:border-[#374151] text-text-primary text-sm font-medium rounded-[6px] hover:bg-[#EBEBEA] dark:hover:bg-[#1F2937] transition-colors">
                  Salvar template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ===== Weight Ruler Component ===== */
function PesoRuler({ paradas }: { paradas: Parada[] }) {
  const maxPeso = Math.max(...paradas.map(p => p.pesoReal), 100)
  const marcas = [10, 20, 35, 50, 70, 100, 200, 300, 500]
  const marcasVisiveis = marcas.filter(m => m <= Math.max(maxPeso * 1.2, 100))

  return (
    <div>
      {paradas.map(parada =>
        parada.pesoReal > 0 ? (
          <div key={parada.id} className="mb-3">
            <p className="text-[11px] text-text-secondary mb-1">
              Parada {paradas.indexOf(parada) + 1}: {parada.zona || '—'} — {parada.pesoReal} kg
            </p>
            <div className="weight-ruler-track relative mx-1">
              {marcasVisiveis.map(m => {
                const pct = (m / (maxPeso * 1.2)) * 100
                return (
                  <div key={m} className="absolute" style={{ left: `${pct}%`, top: -6 }}>
                    <div className="weight-ruler-mark" />
                    <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] text-text-secondary">
                      {m}
                    </span>
                  </div>
                )
              })}
              {(() => {
                const pct = Math.min((parada.pesoReal / (maxPeso * 1.2)) * 100, 100)
                return (
                  <div
                    className="weight-ruler-indicator"
                    style={{ left: `${pct}%` }}
                  />
                )
              })()}
            </div>
          </div>
        ) : null
      )}
    </div>
  )
}
