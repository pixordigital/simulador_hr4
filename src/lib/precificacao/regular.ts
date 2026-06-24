import { FaixaPreco, Parada, CustoParada, ConfigVeiculo, ConfigMotoristaProprio, CustoAgregado, custoAgregadoVazio, somarCustoAgregado } from './tipos'
import { calcularPesoTaxavel } from './peso'

export function buscarFaixaPreco(taxas: FaixaPreco[], zona: string): FaixaPreco | undefined {
  return taxas.find(t => t.zona.toLowerCase() === zona.toLowerCase())
}

export function calcularFretePeso(taxa: FaixaPreco, pesoTaxavel: number): number {
  if (pesoTaxavel <= taxa.pesoBase) return taxa.taxaMinima

  let total = taxa.taxaMinima
  let restante = pesoTaxavel - taxa.pesoBase

  for (const faixa of taxa.faixas) {
    const pesoNaFaixa = Math.min(restante, faixa.max - faixa.min)
    if (pesoNaFaixa <= 0) break
    total += pesoNaFaixa * faixa.precoPorKg
    restante -= pesoNaFaixa
    if (restante <= 0) break
  }

  return total
}

export function calcularGRIS(valorNF?: number): number {
  if (!valorNF) return 0
  return Math.max(valorNF * 0.001, 4.0)
}

export function calcularAdValorem(valorNF?: number): number {
  if (!valorNF) return 0
  return valorNF * 0.003
}

export function calcularCustoParadaRegular(
  parada: Parada,
  taxa: FaixaPreco,
  custoDiarioVeiculo: number,
  numeroEntregasDia: number,
  acrescimoAgendamento: number
): CustoParada {
  const pesoTaxavel = calcularPesoTaxavel(parada.pesoReal, parada.comprimento, parada.largura, parada.altura)
  const fretePeso = calcularFretePeso(taxa, pesoTaxavel)
  const gris = calcularGRIS(parada.valorNF)
  const adValorem = calcularAdValorem(parada.valorNF)

  const custoVeiculoPorEntrega = custoDiarioVeiculo / numeroEntregasDia
  const taxaFaixaPeso = fretePeso - taxa.taxaMinima

  return {
    zona: parada.zona,
    pesoTaxavel,
    fretePeso,
    gris,
    adValorem,
    salarioParcela: 0,
    valeParcela: 0,
    combustivelParcela: 0,
    manutencaoParcela: 0,
    seguroParcela: 0,
    depreciacaoParcela: 0,
    taxaFaixaPeso,
    acrescimoAgendamento,
    agregado: {
      motorista: 0,
      combustivel: 0,
      veiculo: 0,
      frete: fretePeso,
      taxaNF: gris + adValorem,
      agendamento: acrescimoAgendamento,
      total: fretePeso + gris + adValorem + acrescimoAgendamento,
    },
    total: fretePeso + gris + adValorem + acrescimoAgendamento,
  }
}

export function detalharCustoVeiculo(
  config: ConfigMotoristaProprio,
  veiculo: 'KANGOO' | '8-160'
) {
  const v = config.veiculos[veiculo]
  const custoMensalTotal =
    config.salarioMensal +
    config.valeAlimentacao +
    v.combustivelMensal +
    v.manutencaoMensal +
    v.seguroMensal +
    v.depreciacaoMensal

  const custoDiario = custoMensalTotal / config.diasUteisPorMes

  return {
    custoDiario,
    custoMensalTotal,
    componentes: {
      salario: config.salarioMensal / config.diasUteisPorMes,
      vale: config.valeAlimentacao / config.diasUteisPorMes,
      combustivel: v.combustivelMensal / config.diasUteisPorMes,
      manutencao: v.manutencaoMensal / config.diasUteisPorMes,
      seguro: v.seguroMensal / config.diasUteisPorMes,
      depreciacao: v.depreciacaoMensal / config.diasUteisPorMes,
    },
  }
}

export function calcularOpcoesRegulares(
  paradas: Parada[],
  taxasRegioes: FaixaPreco[],
  configMotoristas: ConfigMotoristaProprio,
  numeroEntregasDia: number,
  acrescimoAgendamento: number,
  taxaFreelancer?: number
) {
  const opcoes = []

  // KANGOO
  const kangoo = detalharCustoVeiculo(configMotoristas, 'KANGOO')
  const paradasKangoo = paradas.map(p => {
    const taxa = buscarFaixaPreco(taxasRegioes, p.zona)
    if (!taxa) throw new Error(`Zona não encontrada: ${p.zona}`)
    const base = calcularCustoParadaRegular(p, taxa, kangoo.custoDiario, numeroEntregasDia, acrescimoAgendamento)
    const custoVeiculoPorEntrega = kangoo.custoDiario / numeroEntregasDia
    const salarioParcela = kangoo.componentes.salario / numeroEntregasDia
    const valeParcela = kangoo.componentes.vale / numeroEntregasDia
    const combustivelParcela = kangoo.componentes.combustivel / numeroEntregasDia
    const manutencaoParcela = kangoo.componentes.manutencao / numeroEntregasDia
    const seguroParcela = kangoo.componentes.seguro / numeroEntregasDia
    const depreciacaoParcela = kangoo.componentes.depreciacao / numeroEntregasDia
    return {
      ...base,
      salarioParcela,
      valeParcela,
      combustivelParcela,
      manutencaoParcela,
      seguroParcela,
      depreciacaoParcela,
      agregado: {
        motorista: salarioParcela + valeParcela,
        combustivel: combustivelParcela,
        veiculo: manutencaoParcela + seguroParcela + depreciacaoParcela,
        frete: base.agregado.frete,
        taxaNF: base.agregado.taxaNF,
        agendamento: base.agregado.agendamento,
        total: base.total + custoVeiculoPorEntrega,
      },
      total: base.total + custoVeiculoPorEntrega,
    }
  })

  opcoes.push({
    rotulo: 'KANGOO',
    custoTotal: paradasKangoo.reduce((s, p) => s + p.total, 0),
    custoPorParada: paradasKangoo,
    agregadoTotal: custoAgregadoVazio(),
    isFreelancer: false,
  })

  // 8-160
  const oito160 = detalharCustoVeiculo(configMotoristas, '8-160')
  const paradasOito160 = paradas.map(p => {
    const taxa = buscarFaixaPreco(taxasRegioes, p.zona)
    if (!taxa) throw new Error(`Zona não encontrada: ${p.zona}`)
    const base = calcularCustoParadaRegular(p, taxa, oito160.custoDiario, numeroEntregasDia, acrescimoAgendamento)
    const salarioParcela = oito160.componentes.salario / numeroEntregasDia
    const valeParcela = oito160.componentes.vale / numeroEntregasDia
    const combustivelParcela = oito160.componentes.combustivel / numeroEntregasDia
    const manutencaoParcela = oito160.componentes.manutencao / numeroEntregasDia
    const seguroParcela = oito160.componentes.seguro / numeroEntregasDia
    const depreciacaoParcela = oito160.componentes.depreciacao / numeroEntregasDia
    return {
      ...base,
      salarioParcela,
      valeParcela,
      combustivelParcela,
      manutencaoParcela,
      seguroParcela,
      depreciacaoParcela,
      agregado: {
        motorista: salarioParcela + valeParcela,
        combustivel: combustivelParcela,
        veiculo: manutencaoParcela + seguroParcela + depreciacaoParcela,
        frete: base.agregado.frete,
        taxaNF: base.agregado.taxaNF,
        agendamento: base.agregado.agendamento,
        total: base.total + oito160.custoDiario / numeroEntregasDia,
      },
      total: base.total + oito160.custoDiario / numeroEntregasDia,
    }
  })

  opcoes.push({
    rotulo: '8-160',
    custoTotal: paradasOito160.reduce((s, p) => s + p.total, 0),
    custoPorParada: paradasOito160,
    agregadoTotal: custoAgregadoVazio(),
    isFreelancer: false,
  })

  // Freelancer
  if (taxaFreelancer !== undefined) {
    const custoPorParada = taxaFreelancer / paradas.length
    const paradasFreela = paradas.map(p => {
      const taxa = buscarFaixaPreco(taxasRegioes, p.zona)
      if (!taxa) throw new Error(`Zona não encontrada: ${p.zona}`)
      const gris = calcularGRIS(p.valorNF)
      const adValorem = calcularAdValorem(p.valorNF)
      return {
        zona: p.zona,
        pesoTaxavel: calcularPesoTaxavel(p.pesoReal, p.comprimento, p.largura, p.altura),
        fretePeso: 0,
        gris,
        adValorem,
        salarioParcela: 0,
        valeParcela: 0,
        combustivelParcela: 0,
        manutencaoParcela: 0,
        seguroParcela: 0,
        depreciacaoParcela: 0,
        taxaFaixaPeso: 0,
        acrescimoAgendamento,
        agregado: {
          motorista: custoPorParada,
          combustivel: 0,
          veiculo: 0,
          frete: 0,
          taxaNF: gris + adValorem,
          agendamento: acrescimoAgendamento,
          total: custoPorParada + gris + adValorem + acrescimoAgendamento,
        },
        total: custoPorParada + gris + adValorem + acrescimoAgendamento,
      }
    })

    opcoes.push({
      rotulo: 'Freelancer',
      custoTotal: paradasFreela.reduce((s, p) => s + p.total, 0),
      custoPorParada: paradasFreela,
      agregadoTotal: custoAgregadoVazio(),
      isFreelancer: true,
    })
  }

  // Compute agregadoTotal per opcao
  for (const op of opcoes) {
    op.agregadoTotal = op.custoPorParada
      .map(p => p.agregado)
      .reduce((acc, a) => somarCustoAgregado(acc, a), custoAgregadoVazio())
  }

  return opcoes
}
