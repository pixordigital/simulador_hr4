'use client'

import { useState, useEffect, useCallback } from 'react'
import { Info, ChevronDown, ChevronUp, AlertTriangle, Plus, Trash2 } from 'lucide-react'
import DicaTooltip from '@/components/DicaTooltip'

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
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nova Simulação</h1>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTipo('regular')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tipo === 'regular'
              ? 'bg-blue-600 text-white'
              : 'bg-[var(--color-muted)] text-[var(--color-muted-fg)] hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }`}
        >
          Entrega Regular
        </button>
        <button
          onClick={() => setTipo('dedicada')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tipo === 'dedicada'
              ? 'bg-blue-600 text-white'
              : 'bg-[var(--color-muted)] text-[var(--color-muted-fg)] hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }`}
        >
          Entrega Dedicada
        </button>
      </div>

      {/* Opção de veículo / motorista */}
      <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Veículo / Motorista</h2>

        <div className="grid grid-cols-3 gap-4">
          {OPCOES_VEICULO.map(op => (
            <button
              key={op}
              onClick={() => setOpcaoVeiculo(op)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                opcaoVeiculo === op
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-[var(--color-border)] hover:border-blue-300'
              }`}
            >
              <span className="font-medium">{op}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Entregas no dia
              <DicaTooltip texto="Número de entregas que o motorista fará no dia" />
            </label>
            <input
              type="number"
              value={numeroEntregas}
              onChange={(e) => setNumeroEntregas(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>

          {opcaoVeiculo === 'Freelancer' && tipo === 'regular' && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Taxa negociada (R$)
                <DicaTooltip texto="Valor único para o trabalho inteiro, não por parada" />
              </label>
              <input
                type="number"
                value={taxaFreelancer}
                onChange={(e) => setTaxaFreelancer(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>
          )}

          {tipo === 'dedicada' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Dias</label>
                <input
                  type="number"
                  value={diasDedicada}
                  onChange={(e) => setDiasDedicada(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Km estimado da rota
                  <DicaTooltip texto="Distância total estimada do trabalho" />
                </label>
                <input
                  type="number"
                  value={kmEstimado}
                  onChange={(e) => setKmEstimado(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                  min="0"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ajudante"
                  checked={ajudante}
                  onChange={(e) => setAjudante(e.target.checked)}
                  className="rounded border-[var(--color-border)]"
                />
                <label htmlFor="ajudante" className="text-sm font-medium">
                  Ajudante / auxiliar
                </label>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Paradas (regular) */}
      {tipo === 'regular' && (
        <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Paradas</h2>
            <button
              onClick={adicionarParada}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Plus size={16} /> Adicionar parada
            </button>
          </div>

          {paradas.map((parada, idx) => (
            <div key={parada.id} className="p-4 bg-[var(--color-muted)] rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Parada {idx + 1}</h3>
                {paradas.length > 1 && (
                  <button
                    onClick={() => removerParada(parada.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Zona</label>
                  <select
                    value={parada.zona}
                    onChange={(e) => atualizarParada(parada.id, 'zona', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Selecione</option>
                    {ZONAS.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Peso real (kg)</label>
                  <input
                    type="number"
                    value={parada.pesoReal || ''}
                    onChange={(e) => atualizarParada(parada.id, 'pesoReal', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    step="0.1"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Cx (m) <DicaTooltip texto="Comprimento da caixa em metros" />
                  </label>
                  <input
                    type="number"
                    value={parada.comprimento}
                    onChange={(e) => atualizarParada(parada.id, 'comprimento', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Lg (m)</label>
                  <input
                    type="number"
                    value={parada.largura}
                    onChange={(e) => atualizarParada(parada.id, 'largura', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Alt (m)</label>
                  <input
                    type="number"
                    value={parada.altura}
                    onChange={(e) => atualizarParada(parada.id, 'altura', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Valor NF (R$) <DicaTooltip texto="Opcional. Necessário para GRIS e Ad-Valorem" />
                  </label>
                  <input
                    type="number"
                    value={parada.valorNF}
                    onChange={(e) => atualizarParada(parada.id, 'valorNF', e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Agendada */}
      <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="agendada"
            checked={agendada}
            onChange={(e) => setAgendada(e.target.checked)}
            className="rounded border-[var(--color-border)]"
          />
          <label htmlFor="agendada" className="text-lg font-semibold">
            Entrega Agendada
          </label>
          <span className="text-xs text-[var(--color-muted-fg)]">Serviço de horário garantido</span>
        </div>

        {agendada && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-7">
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <input
                type="date"
                value={dataAgendamento}
                onChange={(e) => setDataAgendamento(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Horário</label>
              <input
                type="time"
                value={horarioAgendado}
                onChange={(e) => setHorarioAgendado(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Acréscimo (R$)</label>
              <input
                type="number"
                value={acrescimoAgendamento}
                onChange={(e) => setAcrescimoAgendamento(e.target.value)}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        )}
      </section>

      {/* Margem */}
      <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Margem (%)
              <DicaTooltip texto="Margem de lucro aplicada sobre o custo total" />
            </label>
            <input
              type="number"
              value={margem}
              onChange={(e) => setMargem(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
              step="0.5"
              min="0"
            />
          </div>
          <button
            onClick={calcular}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Calcular
          </button>
        </div>
      </section>

      {erro && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
          {erro}
        </div>
      )}

      {/* Resultado */}
      {resultadoVisible && (
        <section className="space-y-4">
          {alertaBreakEven && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  Atenção: o preço sugerido está abaixo do seu custo.
                </p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  Você terá prejuízo de {formatarMoeda(valorPrejuizo)} nesta entrega.
                </p>
              </div>
            </div>
          )}

          {avisoSemNF && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-lg text-sm text-yellow-700 dark:text-yellow-400">
              <Info size={16} className="inline mr-1" />
              GRIS e Ad-Valorem não incluídos — informe o valor da NF para cálculo completo
            </div>
          )}

          {/* Opções lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {opcoes.map((opcao, idx) => {
              const isMaisBarata = opcao.custoTotal === opcaoMaisBarata
              const isSelecionada = opcao.rotulo === opcaoVeiculo || (idx === 0 && opcaoVeiculo !== 'Freelancer')

              return (
                <div
                  key={opcao.rotulo}
                  className={`rounded-xl p-5 border-2 transition-all ${
                    isSelecionada
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-[var(--color-border)]'
                  } ${isMaisBarata ? 'ring-2 ring-[var(--color-accent)]' : ''}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-base">{opcao.rotulo}</h3>
                    {isMaisBarata && (
                      <span className="text-xs bg-[var(--color-accent)] text-white px-2 py-0.5 rounded-full">
                        Mais barato
                      </span>
                    )}
                  </div>

                  <p className="text-2xl font-bold mb-4">
                    {formatarMoeda(opcao.custoTotal)}
                  </p>

                  {isSelecionada && !isMaisBarata && opcaoMaisBarata < opcao.custoTotal && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                      ℹ️ Existe uma opção {formatarMoeda(opcao.custoTotal - opcaoMaisBarata)} mais barata disponível
                    </p>
                  )}

                  {/* Detalhamento colapsável por parada */}
                  {opcao.custoPorParada.map((cp, pIdx) => (
                    <div key={pIdx} className="border-t border-[var(--color-border)] pt-2 mt-2">
                      <button
                        onClick={() => toggleDetalhe(idx * 100 + pIdx)}
                        className="flex items-center justify-between w-full text-sm"
                      >
                        <span>{cp.zona} — {formatarMoeda(cp.total)}</span>
                        {(detalhesAbertos[idx * 100 + pIdx] ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                      </button>

                      {detalhesAbertos[idx * 100 + pIdx] && (
                        <div className="mt-2 space-y-1 text-xs text-[var(--color-muted-fg)]">
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
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>

          {/* Resumo geral */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Resumo Geral</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-[var(--color-muted-fg)]">Custo total</p>
                <p className="text-xl font-bold">{formatarMoeda(totalGeral)}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-muted-fg)]">Margem</p>
                <p className="text-xl font-bold">{margem}%</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-[var(--color-muted-fg)]">Preço sugerido ao cliente</p>
                <p className="text-3xl font-bold text-[var(--color-accent)]">{formatarMoeda(precoSugerido)}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
