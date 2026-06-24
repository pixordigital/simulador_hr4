import { ConfigDedicada, ConfigMotoristaProprio, CustoAgregado } from './tipos'

export function calcularCustoDedicada(
  veiculo: 'KANGOO' | '8-160',
  dias: number,
  kmEstimado: number,
  configDedicada: ConfigDedicada,
  configMotoristas: ConfigMotoristaProprio,
  ajudante: boolean,
  margemPct: number
) {
  const ded = configDedicada
  const mot = configMotoristas.veiculos[veiculo]

  const custoCombustivelKm = ded.precoCombustivelLitro / ded.consumoKmPorLitro
  const salarioDia = configMotoristas.salarioMensal / configMotoristas.diasUteisPorMes
  const custoFixoDia = ded.custoFixoMensal / configMotoristas.diasUteisPorMes

  const diariaBase = (custoFixoDia + salarioDia) * (1 + margemPct / 100)
  const taxaKmExtra = (custoCombustivelKm + ded.manutencaoPorKm) * (1 + margemPct / 100)
  const kmExtras = Math.max(0, kmEstimado - ded.kmInclusosNaDiaria * dias)
  const custoAjudante = ajudante ? ded.ajudanteDiaria * dias : 0

  const totalDiarias = diariaBase * dias
  const totalKmExtras = taxaKmExtra * kmExtras
  const total = totalDiarias + totalKmExtras + custoAjudante

  const agregado: CustoAgregado = {
    motorista: salarioDia * dias,
    combustivel: custoCombustivelKm * kmExtras,
    veiculo: custoFixoDia * dias + ded.manutencaoPorKm * kmExtras,
    frete: 0,
    taxaNF: 0,
    agendamento: 0,
    total,
  }

  return {
    diariaBase,
    taxaKmExtra,
    kmExtras,
    custoAjudante,
    total,
    agregado,
    componentes: {
      diarias: totalDiarias,
      kmExcedentes: totalKmExtras,
      ajudante: custoAjudante,
    },
  }
}
