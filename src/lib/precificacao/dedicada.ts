import { ConfigDedicada, ConfigMotoristaProprio } from './tipos'

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
  const diariaBase =
    (ded.custoFixoMensal / configMotoristas.diasUteisPorMes +
      configMotoristas.salarioMensal / configMotoristas.diasUteisPorMes) *
    (1 + margemPct / 100)

  const taxaKmExtra = (custoCombustivelKm + ded.manutencaoPorKm) * (1 + margemPct / 100)
  const kmExtras = Math.max(0, kmEstimado - ded.kmInclusosNaDiaria * dias)
  const custoAjudante = ajudante ? ded.ajudanteDiaria * dias : 0

  const total = diariaBase * dias + taxaKmExtra * kmExtras + custoAjudante

  return {
    diariaBase,
    taxaKmExtra,
    kmExtras,
    custoAjudante,
    total,
    componentes: {
      diarias: diariaBase * dias,
      kmExcedentes: taxaKmExtra * kmExtras,
      ajudante: custoAjudante,
    },
  }
}
