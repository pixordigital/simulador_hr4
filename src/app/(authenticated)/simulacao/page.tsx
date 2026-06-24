'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Calculator, Info, AlertTriangle, Plus, Trash2, Truck,
  CalendarClock, MapPin, Scale, Receipt, Clock, CheckCircle2, ArrowRight,
  Gauge, TrendingUp, DollarSign, Zap, Sun, Moon,
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

type CustoAgregadoResult = {
  motorista: number
  combustivel: number
  veiculo: number
  frete: number
  taxaNF: number
  agendamento: number
  total: number
}

type CustoParadaResult = {
  zona: string
  pesoTaxavel: number
  total: number
  componentes: Componentes
  agregado: CustoAgregadoResult
}

type Opcao = {
  rotulo: string
  custoTotal: number
  isFreelancer: boolean
  custoPorParada: CustoParadaResult[]
  agregadoTotal: CustoAgregadoResult
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
      const mapearAgregado = (a: any) => ({
        motorista: a.motorista || 0,
        combustivel: a.combustivel || 0,
        veiculo: a.veiculo || 0,
        frete: a.frete || 0,
        taxaNF: a.taxaNF || 0,
        agendamento: a.agendamento || 0,
        total: a.total || 0,
      })
      const fmt = (o: any) => ({
        rotulo: o.rotulo,
        custoTotal: o.custoTotal,
        isFreelancer: o.isFreelancer,
        agregadoTotal: mapearAgregado(o.agregadoTotal || {}),
        custoPorParada: o.custoPorParada.map((cp: any) => ({
          zona: cp.zona || '',
          pesoTaxavel: cp.pesoTaxavel || 0,
          total: cp.total || 0,
          agregado: mapearAgregado(cp.agregado || {}),
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
  const margemNum = parseFloat(margem) || 0
  const opcaoSelecionada = opcoes.length > 0 ? (opcoes.find(o => o.rotulo === opcaoVeiculo) || opcoes[0]) : undefined
  const catSelecionada = opcaoSelecionada?.agregadoTotal

  return (
    <div className="space-y-0">
      {erro && (
        <div className="mb-6 border-l-[3px] border-l-[var(--semantic-loss)] bg-[color-mix(in_srgb,var(--semantic-loss)_6%,transparent)] p-3 rounded-[4px]">
          <p className="text-[color:var(--semantic-loss)] text-sm font-medium flex items-center gap-2">
            <AlertTriangle size={14} />
            {erro}
          </p>
        </div>
      )}

      <div className="flex gap-0">
        {/* ===== LEFT (58%) ===== */}
        <div className="w-[58%] pr-10 border-r border-[var(--border)]">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[var(--text-secondary)] mb-1 font-display">
                Simulação de Frete
              </p>
              <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)] font-display">
                Nova Simulação
              </h1>
            </div>
            <button onClick={limpar} className="btn-secondary">
              Limpar
            </button>
          </div>

          {/* Tipo selector */}
          <div className="mb-7">
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">
              Tipo de entrega
            </label>
            <div className="tab-group">
              <button
                onClick={() => setTipo('regular')}
                className={`tab-item ${tipo === 'regular' ? 'tab-item--active' : ''}`}
              >
                Regular
              </button>
              <button
                onClick={() => setTipo('dedicada')}
                className={`tab-item ${tipo === 'dedicada' ? 'tab-item--active' : ''}`}
              >
                Dedicada
              </button>
            </div>
          </div>

          {/* Cliente */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
              Cliente
            </label>
            <input
              type="text"
              value={nomeCliente}
              onChange={e => setNomeCliente(e.target.value)}
              placeholder="Nome do cliente ou empresa"
              className="input-premium"
            />
          </div>

          {/* Motorista / Veículo */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-2">
              Motorista / Veículo
            </label>
            <div className="flex gap-2 flex-wrap">
              {OPCOES_VEICULO.map(op => {
                const ativo = opcaoVeiculo === op
                return (
                  <button
                    key={op}
                    onClick={() => setOpcaoVeiculo(op)}
                    className={`chip ${ativo ? 'chip--active' : ''}`}
                  >
                    {op}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Entregas no dia + freelancer taxa */}
          <div className="grid grid-cols-2 gap-5 mb-6">
            <div>
              <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
                Entregas do dia
              </label>
              <input
                type="number"
                value={numeroEntregas}
                onChange={e => setNumeroEntregas(e.target.value)}
                min="1"
                className="input-premium"
              />
            </div>
            {opcaoVeiculo === 'Freelancer' && tipo === 'regular' && (
              <div>
                <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
                  Taxa negociada (R$)
                </label>
                <input
                  type="number"
                  value={taxaFreelancer}
                  onChange={e => setTaxaFreelancer(e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="Valor único"
                  className="input-premium"
                />
              </div>
            )}
            {tipo === 'dedicada' && (
              <>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
                    Dias
                  </label>
                  <input
                    type="number"
                    value={diasDedicada}
                    onChange={e => setDiasDedicada(e.target.value)}
                    min="1"
                    className="input-premium"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">
                    Km estimado
                  </label>
                  <input
                    type="number"
                    value={kmEstimado}
                    onChange={e => setKmEstimado(e.target.value)}
                    step="0.1"
                    min="0"
                    className="input-premium"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="ajudante"
                    checked={ajudante}
                    onChange={e => setAjudante(e.target.checked)}
                    className="rounded-[3px] border-[var(--border-strong)] text-[var(--brand-orange)] focus:ring-[var(--brand-orange)]"
                  />
                  <label htmlFor="ajudante" className="text-sm text-[var(--text-primary)] cursor-pointer select-none">
                    Adicionar ajudante / auxiliar
                  </label>
                </div>
              </>
            )}
          </div>

          <div className="section-divider" />

          {/* Paradas */}
          {tipo === 'regular' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-secondary)]">
                  Paradas
                </span>
                <button
                  onClick={adicionarParada}
                  className="text-[13px] font-medium text-[var(--brand-orange)] hover:text-[var(--brand-orange-dim)] transition-colors flex items-center gap-1"
                >
                  <Plus size={14} strokeWidth={2} />
                  Adicionar parada
                </button>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-12 gap-3 mb-2 px-1">
                <span className="col-span-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)]">Zona</span>
                <span className="col-span-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)]">Peso</span>
                <span className="col-span-3 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)]">Dimensões</span>
                <span className="col-span-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)]">Valor NF</span>
                <span className="col-span-2 text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-secondary)]">Custo</span>
                <span className="col-span-1" />
              </div>

              <div className="space-y-2">
                {paradas.map((parada, idx) => (
                  <div
                    key={parada.id}
                    className="group grid grid-cols-12 gap-3 items-center py-2.5 border-b border-[var(--border)] transition-colors hover:bg-[color-mix(in_srgb,var(--surface-sunken)_40%,transparent)] -mx-1 px-1 rounded-[4px]"
                  >
                    <div className="col-span-2">
                      <select
                        value={parada.zona}
                        onChange={e => atualizarParada(parada.id, 'zona', e.target.value)}
                        className="select-premium"
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
                        className="input-premium h-[34px]"
                      />
                    </div>
                    <div className="col-span-3 flex gap-1.5">
                      <input type="number" value={parada.comprimento} onChange={e => atualizarParada(parada.id, 'comprimento', e.target.value)} step="0.01" placeholder="C"
                        className="input-premium h-[34px]" />
                      <input type="number" value={parada.largura} onChange={e => atualizarParada(parada.id, 'largura', e.target.value)} step="0.01" placeholder="L"
                        className="input-premium h-[34px]" />
                      <input type="number" value={parada.altura} onChange={e => atualizarParada(parada.id, 'altura', e.target.value)} step="0.01" placeholder="A"
                        className="input-premium h-[34px]" />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={parada.valorNF}
                        onChange={e => atualizarParada(parada.id, 'valorNF', e.target.value)}
                        step="0.01"
                        min="0"
                        placeholder="R$"
                        className="input-premium h-[34px]"
                      />
                    </div>
                    <div className="col-span-2 text-right">
                      {opcoes.length > 0 ? (
                        (() => {
                          const sel = opcoes.find(o => o.rotulo === opcaoVeiculo) || opcoes[0]
                          const cp = sel.custoPorParada[idx]
                          return cp ? (
                            <span className="text-[13px] font-num text-[var(--text-primary)]">
                              {formatarMoeda(cp.total)}
                            </span>
                          ) : (
                            <span className="text-[12px] text-[var(--text-disabled)]">—</span>
                          )
                        })()
                      ) : (
                        <span className="text-[12px] text-[var(--text-disabled)]">—</span>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      {paradas.length > 1 && (
                        <button
                          onClick={() => removerParada(parada.id)}
                          className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-[var(--semantic-loss)] transition-all duration-150"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Weight Ruler */}
              {paradas.some(p => p.pesoReal > 0) && (
                <div className="mt-6 mb-2">
                  <PesoRuler paradas={paradas} />
                </div>
              )}
            </div>
          )}

          <div className="section-divider" />

          {/* Entrega Agendada */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <input
                type="checkbox"
                id="agendada"
                checked={agendada}
                onChange={e => setAgendada(e.target.checked)}
                className="rounded-[3px] border-[var(--border-strong)] text-[var(--brand-orange)] focus:ring-[var(--brand-orange)]"
              />
              <label htmlFor="agendada" className="text-sm font-medium text-[var(--text-primary)] cursor-pointer select-none flex items-center gap-2">
                <Clock size={15} strokeWidth={1.5} />
                Entrega Agendada
              </label>
              <span className="text-[11px] text-[var(--text-disabled)] font-medium uppercase tracking-[0.05em]">Horário garantido</span>
            </div>
            {agendada && (
              <div className="grid grid-cols-3 gap-4 mt-3 pl-7">
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Data</label>
                  <input type="date" value={dataAgendamento} onChange={e => setDataAgendamento(e.target.value)} className="input-premium" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Horário</label>
                  <input type="time" value={horarioAgendado} onChange={e => setHorarioAgendado(e.target.value)} className="input-premium" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text-secondary)] mb-1.5">Acréscimo (R$)</label>
                  <input type="number" value={acrescimoAgendamento} onChange={e => setAcrescimoAgendamento(e.target.value)} step="0.01" min="0" className="input-premium" />
                </div>
              </div>
            )}
          </div>

          {/* Calcular button — always visible */}
          <button onClick={calcular} disabled={calculando} className="btn-primary w-full h-11 mt-6">
            {calculando ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Calculando...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Calcular <Calculator size={15} strokeWidth={1.5} />
              </span>
            )}
          </button>
        </div>

        {/* ===== RIGHT (42%) ===== */}
        <div className="w-[42%] pl-10">
          {opcoes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-center">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--border-strong)] flex items-center justify-center mb-6">
                <Calculator size={28} className="text-[var(--text-disabled)]" strokeWidth={1} />
              </div>
              <p className="text-lg font-display font-medium text-[var(--text-secondary)] mb-2">
                Preencha os dados da entrega para ver a cotação em tempo real.
              </p>
              <div className="w-10 border-t border-[var(--border)] my-5" />
              <p className="text-sm text-[var(--text-disabled)] max-w-[280px]">
                Custo do motorista, frete por faixa e margem calculados automaticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alerts */}
              {alertaBreakEven && (
                <div className="border-l-[3px] border-l-[var(--semantic-loss)] bg-[color-mix(in_srgb,var(--semantic-loss)_6%,transparent)] p-3 rounded-[4px]">
                  <p className="text-[color:var(--semantic-loss)] text-sm font-medium">
                    ⚑ Atenção: o preço sugerido está abaixo do seu custo. Prejuízo de {formatarMoeda(valorPrejuizo)} nesta entrega.
                  </p>
                </div>
              )}
              {avisoSemNF && (
                <div className="border-l-[3px] border-l-[var(--semantic-warn)] bg-[color-mix(in_srgb,var(--semantic-warn)_6%,transparent)] p-3 rounded-[4px]">
                  <p className="text-[color:var(--semantic-warn)] text-sm font-medium">
                    GRIS e Ad-Valorem não incluídos — informe o valor da NF para cálculo completo.
                  </p>
                </div>
              )}

              {/* Opções de custo */}
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-3">
                  Opções de Custo
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {opcoes.map((opcao) => {
                    const isMaisBarata = opcao.custoTotal === opcaoMaisBarata
                    const selecionada = opcao.rotulo === opcaoVeiculo

                    return (
                      <div
                        key={opcao.rotulo}
                        className={`
                          relative rounded-[6px] p-4 transition-all duration-150
                          ${isMaisBarata
                            ? 'card-premium--cheapest'
                            : selecionada
                            ? 'card-premium--selected'
                            : 'card-premium'}
                        `}
                      >
                        {isMaisBarata && (
                          <span className="inline-flex items-center text-[10px] font-medium text-[var(--semantic-gain)] bg-[color-mix(in_srgb,var(--semantic-gain)_8%,transparent)] px-2 py-0.5 rounded-[3px] mb-2.5 tracking-wide uppercase">
                            ↓ Menor custo
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">
                            {opcao.rotulo}
                          </span>
                          {opcao.isFreelancer && (
                            <span className="text-[10px] uppercase tracking-[0.04em] px-1.5 py-0.5 rounded-[2px] bg-[var(--surface-sunken)] text-[var(--text-secondary)]">
                              Freela
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-num font-medium text-[var(--text-primary)] mb-1">
                          {formatarMoeda(opcao.custoTotal)}
                        </p>
                        {selecionada && !isMaisBarata && opcaoMaisBarata < opcao.custoTotal && (
                          <p className="text-[12px] text-[var(--text-secondary)] mt-2">
                            ↑ {formatarMoeda(opcao.custoTotal - opcaoMaisBarata)} a mais
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Detalhamento */}
              <button
                onClick={() => setExpandido(!expandido)}
                className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5"
              >
                <span className={`transition-transform duration-150 ${expandido ? 'rotate-180' : ''}`}>▼</span>
                {expandido ? 'Recolher detalhamento' : 'Ver detalhamento'}
              </button>

              {expandido && (
                <div className="border border-[var(--border)] rounded-[6px] p-4 space-y-4 text-sm">
                  {/* Category summary for selected option */}
                  {opcaoSelecionada && catSelecionada && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-[var(--text-secondary)] mb-3">
                        Resumo por Categoria — {opcaoSelecionada.rotulo}
                      </p>
                        <div className="space-y-1">
                          <CategoriaLinha label="Motorista" valor={catSelecionada.motorista} cor="var(--brand-orange)" />
                          <CategoriaLinha label="Combustível" valor={catSelecionada.combustivel} cor="var(--semantic-warn)" />
                          <CategoriaLinha label="Veículo (manut + seguro + depr)" valor={catSelecionada.veiculo} cor="var(--semantic-info)" />
                          <CategoriaLinha label="Frete por faixa de peso" valor={catSelecionada.frete} cor="var(--semantic-gain)" />
                          {catSelecionada.taxaNF > 0 && <CategoriaLinha label="Taxas NF (GRIS + Ad-Valorem)" valor={catSelecionada.taxaNF} cor="#7C3AED" />}
                          {catSelecionada.agendamento > 0 && <CategoriaLinha label="Acréscimo agendamento" valor={catSelecionada.agendamento} cor="#9333EA" />}
                          <div className="border-t border-[var(--border-strong)] mt-2 pt-2 flex justify-between font-semibold text-[var(--text-primary)]">
                            <span>Custo total</span>
                            <span className="font-num">{formatarMoeda(catSelecionada.total)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="border-t border-[var(--border)] pt-3" />

                  {/* Per-stop breakdown — only for selected option */}
                  {opcaoSelecionada && opcaoSelecionada.custoPorParada.map((cp, pIdx) => (
                      <div key={`${opcaoSelecionada.rotulo}-${pIdx}`}>
                        <p className="text-[13px] font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-orange)]" />
                          {cp.zona} — <span className="font-num">{cp.pesoTaxavel} kg</span>
                        </p>
                        <div className="space-y-1.5 text-[13px] ml-3.5">
                          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-disabled)] mb-1.5">Custos fixos</p>
                          <CustoLinha label="Salário (parcela)" valor={cp.componentes.salarioParcela} />
                          <CustoLinha label="Vale alimentação" valor={cp.componentes.valeParcela} />
                          <CustoLinha label="Seguro" valor={cp.componentes.seguroParcela} />
                          <CustoLinha label="Depreciação" valor={cp.componentes.depreciacaoParcela} />

                          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-disabled)] mt-3 mb-1.5">Custos variáveis</p>
                          <CustoLinha label="Combustível" valor={cp.componentes.combustivelParcela} />
                          <CustoLinha label="Manutenção" valor={cp.componentes.manutencaoParcela} />

                          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-[var(--text-disabled)] mt-3 mb-1.5">Frete e taxas</p>
                          <CustoLinha label="Frete por faixa de peso" valor={cp.componentes.taxaFaixaPeso} />
                          <CustoLinha label="GRIS" valor={cp.componentes.gris} />
                          <CustoLinha label="Ad-Valorem" valor={cp.componentes.adValorem} />
                          <CustoLinha label="Acréscimo agendamento" valor={cp.componentes.acrescimoAgendamento} />

                          <div className="border-t border-[var(--border-strong)] mt-2 pt-1.5 flex justify-between font-semibold text-[var(--text-primary)]">
                            <span>Total parada</span>
                            <span className="font-num">{formatarMoeda(cp.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Margem */}
              <div className="border-t border-[var(--border)] pt-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[13px] font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                    <TrendingUp size={14} strokeWidth={1.5} />
                    Margem de lucro
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={margemInputRef}
                      type="number"
                      value={margem}
                      onChange={e => setMargem(e.target.value)}
                      step="0.5"
                      min="0"
                      className="w-16 h-[32px] px-2 border border-[var(--input)] rounded-[4px] bg-[var(--surface-raised)] text-sm text-[var(--text-primary)] text-right outline-none focus:border-[var(--brand-orange)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-orange)_12%,transparent)] font-num transition-all duration-150"
                    />
                    <span className="text-sm text-[var(--text-secondary)]">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={margemNum}
                  onChange={e => setMargem(e.target.value)}
                  className="range-premium"
                />
                <div className="flex justify-between text-[10px] text-[var(--text-disabled)] mt-1 px-0.5">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Preço Sugerido */}
              <div className="card-premium p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)] mb-1">
                  Preço Sugerido
                </p>
                <p className="text-4xl font-bold text-[var(--brand-orange)] font-num">
                  {formatarMoeda(precoSugerido)}
                </p>
                <p className="text-[12px] text-[var(--text-disabled)] mt-1">
                  Custo total: {formatarMoeda(totalGeral)} · Margem: {margem}%
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="btn-secondary flex-1 h-10 text-sm">
                  Salvar cotação
                </button>
                <button className="btn-secondary flex-1 h-10 text-sm">
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

/* ===== CustoLinha helper ===== */
function CustoLinha({ label, valor }: { label: string; valor: number }) {
  if (valor <= 0) return null
  return (
    <div className="flex justify-between">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="font-num text-[var(--text-primary)]">{formatarMoeda(valor)}</span>
    </div>
  )
}

/* ===== CategoriaLinha helper (colored indicator) ===== */
function CategoriaLinha({ label, valor, cor }: { label: string; valor: number; cor: string }) {
  if (valor <= 0) return null
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="flex items-center gap-2 text-[var(--text-secondary)]">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cor }} />
        {label}
      </span>
      <span className="font-num font-medium text-[var(--text-primary)]">{formatarMoeda(valor)}</span>
    </div>
  )
}

/* ===== Weight Ruler ===== */
function PesoRuler({ paradas }: { paradas: Parada[] }) {
  const maxPeso = Math.max(...paradas.map(p => p.pesoReal), 100)
  const marcas = [10, 20, 35, 50, 70, 100, 200, 300, 500]

  return (
    <div className="space-y-4">
      {paradas.map(parada =>
        parada.pesoReal > 0 ? (
          <div key={parada.id}>
            <p className="text-[11px] font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-orange)]" />
              Parada {paradas.indexOf(parada) + 1}: {parada.zona || '—'} —{' '}
              <span className="font-num">{parada.pesoReal} kg</span>
            </p>
            <div className="weight-ruler">
              {marcas.filter(m => m <= maxPeso * 1.2).map(m => {
                const pct = (m / (maxPeso * 1.2)) * 100
                return (
                  <div key={m} className="absolute" style={{ left: `${pct}%` }}>
                    <div className="weight-ruler-mark" />
                    <span className="weight-ruler-label">{m}</span>
                  </div>
                )
              })}
              <div
                className="weight-ruler-indicator"
                style={{ left: `${Math.min((parada.pesoReal / (maxPeso * 1.2)) * 100, 100)}%` }}
              />
            </div>
          </div>
        ) : null
      )}
    </div>
  )
}
