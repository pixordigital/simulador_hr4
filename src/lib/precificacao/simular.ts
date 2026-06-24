import { EntradaSimulacao, ResultadoSimulacao, OpcaoCusto, CustoParada, custoAgregadoVazio } from './tipos'
import { calcularOpcoesRegulares } from './regular'
import { calcularCustoDedicada } from './dedicada'
import { aplicarAgendamento } from './agendada'
import { FaixaPreco, ConfigMotoristaProprio, ConfigDedicada } from './tipos'

interface InsumosCalculo {
  taxasRegioes: FaixaPreco[]
  configMotoristas: ConfigMotoristaProprio
  configDedicada: { KANGOO: ConfigDedicada; '8-160': ConfigDedicada }
  acrescimoAgendamento: number
}

export function simular(
  entrada: EntradaSimulacao,
  insumos: InsumosCalculo
): ResultadoSimulacao {
  const margemPct = entrada.margemPct
  let opcoes: OpcaoCusto[] = []
  let avisoSemNF = false

  if (entrada.tipo === 'regular') {
    const temNF = entrada.paradas.some(p => p.valorNF !== undefined && p.valorNF > 0)
    avisoSemNF = !temNF

    opcoes = calcularOpcoesRegulares(
      entrada.paradas,
      insumos.taxasRegioes,
      insumos.configMotoristas,
      entrada.numeroEntregasDia,
      entrada.agendada ? insumos.acrescimoAgendamento : 0,
      entrada.taxaFreelancer
    )
  } else if (entrada.tipo === 'dedicada') {
    const veiculo = (entrada.veiculoDedicada || 'KANGOO') as 'KANGOO' | '8-160'
    const dedConfig = insumos.configDedicada[veiculo]
    if (!dedConfig) throw new Error(`Configuração dedicada não encontrada para ${veiculo}`)

    const resultado = calcularCustoDedicada(
      veiculo,
      entrada.diasDedicada || 1,
      entrada.kmEstimadoDedicada || 0,
      dedConfig,
      insumos.configMotoristas,
      entrada.ajudanteDedicada || false,
      margemPct
    )

    const acrescimoAgend = entrada.agendada ? insumos.acrescimoAgendamento : 0
    const custoParada: CustoParada = {
      zona: 'Dedicada',
      pesoTaxavel: 0,
      fretePeso: 0,
      gris: 0,
      adValorem: 0,
      salarioParcela: resultado.componentes.diarias / (entrada.diasDedicada || 1),
      valeParcela: 0,
      combustivelParcela: resultado.componentes.kmExcedentes / (entrada.diasDedicada || 1),
      manutencaoParcela: 0,
      seguroParcela: 0,
      depreciacaoParcela: 0,
      taxaFaixaPeso: 0,
      acrescimoAgendamento: acrescimoAgend,
      agregado: {
        ...resultado.agregado,
        agendamento: acrescimoAgend,
        total: resultado.total + acrescimoAgend,
      },
      total: resultado.total + acrescimoAgend,
    }

    opcoes = [{
      rotulo: veiculo,
      custoTotal: custoParada.total,
      custoPorParada: [custoParada],
      agregadoTotal: { ...resultado.agregado, agendamento: acrescimoAgend, total: resultado.total + acrescimoAgend },
      isFreelancer: false,
    }]
  }

  const custoMaisBarato = Math.min(...opcoes.map(o => o.custoTotal))
  let totalGeral = custoMaisBarato

  const precoSugerido = totalGeral * (1 + margemPct / 100)
  const alertaBreakEven = precoSugerido < totalGeral
  const valorPrejuizo = alertaBreakEven ? totalGeral - precoSugerido : 0

  return {
    opcoes,
    totalGeral,
    margemPct,
    precoSugerido,
    alertaBreakEven,
    valorPrejuizo,
    avisoSemNF,
  }
}
