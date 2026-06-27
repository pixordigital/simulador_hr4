import { NextRequest, NextResponse } from 'next/server'
import { simular } from '@/lib/precificacao/simular'
import { EntradaSimulacao, FaixaPreco, ConfigMotoristaProprio } from '@/lib/precificacao/tipos'

function safeFloat(v: unknown, fallback = 0): number {
  const parsed = typeof v === 'string' || typeof v === 'number' ? parseFloat(String(v)) : NaN
  return isNaN(parsed) ? fallback : parsed
}

function safeInt(v: unknown, fallback = 1): number {
  const parsed = typeof v === 'string' || typeof v === 'number' ? parseInt(String(v), 10) : NaN
  return isNaN(parsed) ? fallback : parsed
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, paradas, numeroEntregasDia, margemPct, agendada, acrescimoAgendamento, taxaFreelancer, configs, veiculoDedicada, diasDedicada, kmEstimadoDedicada, ajudanteDedicada } = body

    if (!configs) {
      return NextResponse.json({ erro: 'Configurações não fornecidas' }, { status: 400 })
    }

    const taxaFreelancerNum = taxaFreelancer ? safeFloat(taxaFreelancer) : undefined

    const entrada: EntradaSimulacao = {
      tipo,
      paradas: paradas || [],
      numeroEntregasDia: safeInt(numeroEntregasDia, 8),
      margemPct: safeFloat(margemPct, 8),
      agendada: agendada || false,
      acrescimoAgendamento: safeFloat(acrescimoAgendamento, 0),
      taxaFreelancer: taxaFreelancerNum && taxaFreelancerNum > 0 ? taxaFreelancerNum : undefined,
      veiculoDedicada,
      diasDedicada: safeInt(diasDedicada, 1),
      kmEstimadoDedicada: safeFloat(kmEstimadoDedicada, 0),
      ajudanteDedicada: ajudanteDedicada || false,
    }

    if (!Array.isArray(configs.taxas)) {
      return NextResponse.json({ erro: 'Configuração de taxas inválida' }, { status: 400 })
    }

    if (!configs.motoristas?.veiculos?.KANGOO) {
      return NextResponse.json({ erro: 'Configuração de motoristas inválida' }, { status: 400 })
    }

    const insumos = {
      taxasRegioes: configs.taxas as FaixaPreco[],
      configMotoristas: configs.motoristas as ConfigMotoristaProprio,
      configDedicada: configs.dedicada,
      acrescimoAgendamento: safeFloat(acrescimoAgendamento, 0),
    }

    const resultado = simular(entrada, insumos)
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Erro na simulação:', error)
    return NextResponse.json({ erro: 'Erro interno ao calcular simulação' }, { status: 500 })
  }
}
