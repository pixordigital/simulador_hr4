export interface FaixaPreco {
  origem: string
  zona: string
  taxaMinima: number
  pesoBase: number
  faixas: {
    min: number
    max: number
    precoPorKg: number
  }[]
}

export interface ConfigVeiculo {
  combustivelMensal: number
  manutencaoMensal: number
  seguroMensal: number
  depreciacaoMensal: number
  precoCombustivelLitro: number
  consumoKmPorLitro: number
}

export interface ConfigMotoristaProprio {
  salarioMensal: number
  diasUteisPorMes: number
  valeAlimentacao: number
  veiculos: {
    [nome: string]: ConfigVeiculo
  }
}

export interface ConfigDedicada {
  kmInclusosNaDiaria: number
  custoFixoMensal: number
  precoCombustivelLitro: number
  consumoKmPorLitro: number
  manutencaoPorKm: number
  ajudanteDiaria: number
}

export interface Parada {
  zona: string
  pesoReal: number
  comprimento?: number
  largura?: number
  altura?: number
  valorNF?: number
}

export interface CustoAgregado {
  /** Salário + vale — custo do motorista */
  motorista: number
  /** Combustível por km rodado na parada */
  combustivel: number
  /** Manutenção + seguro + depreciação — custo do veículo */
  veiculo: number
  /** Frete por faixa de peso + taxa mínima */
  frete: number
  /** GRIS + Ad-Valorem */
  taxaNF: number
  /** Acréscimo de agendamento */
  agendamento: number
  /** Total = soma de todos acima */
  total: number
}

export function somarCustoAgregado(a: CustoAgregado, b: CustoAgregado): CustoAgregado {
  return {
    motorista: a.motorista + b.motorista,
    combustivel: a.combustivel + b.combustivel,
    veiculo: a.veiculo + b.veiculo,
    frete: a.frete + b.frete,
    taxaNF: a.taxaNF + b.taxaNF,
    agendamento: a.agendamento + b.agendamento,
    total: a.total + b.total,
  }
}

export function custoAgregadoVazio(): CustoAgregado {
  return { motorista: 0, combustivel: 0, veiculo: 0, frete: 0, taxaNF: 0, agendamento: 0, total: 0 }
}

export interface CustoParada {
  zona: string
  pesoTaxavel: number
  fretePeso: number
  gris: number
  adValorem: number
  salarioParcela: number
  valeParcela: number
  combustivelParcela: number
  manutencaoParcela: number
  seguroParcela: number
  depreciacaoParcela: number
  taxaFaixaPeso: number
  acrescimoAgendamento: number
  agregado: CustoAgregado
  total: number
}

export interface OpcaoCusto {
  rotulo: string
  custoTotal: number
  custoPorParada: CustoParada[]
  agregadoTotal: CustoAgregado
  isFreelancer: boolean
}

export interface ResultadoSimulacao {
  opcoes: OpcaoCusto[]
  totalGeral: number
  margemPct: number
  precoSugerido: number
  alertaBreakEven: boolean
  valorPrejuizo: number
  avisoSemNF: boolean
}

export interface EntradaSimulacao {
  tipo: 'regular' | 'dedicada'
  paradas: Parada[]
  numeroEntregasDia: number
  margemPct: number
  valorNF?: number
  agendada: boolean
  dataAgendamento?: string
  horarioAgendado?: string
  acrescimoAgendamento?: number
  taxaFreelancer?: number
  diasDedicada?: number
  kmEstimadoDedicada?: number
  veiculoDedicada?: string
  ajudanteDedicada?: boolean
}
