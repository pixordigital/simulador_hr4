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
  total: number
}

export interface OpcaoCusto {
  rotulo: string
  custoTotal: number
  custoPorParada: CustoParada[]
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
