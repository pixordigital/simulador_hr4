export function calcularPesoTaxavel(
  pesoReal: number,
  comprimento?: number,
  largura?: number,
  altura?: number
): number {
  if (!comprimento || !largura || !altura) return pesoReal

  const pesoCubico = comprimento * largura * altura * 167
  return Math.max(pesoReal, pesoCubico)
}
