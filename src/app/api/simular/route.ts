import { NextRequest, NextResponse } from 'next/server'
import { simular } from '@/lib/precificacao/simular'
import { EntradaSimulacao, FaixaPreco, ConfigMotoristaProprio } from '@/lib/precificacao/tipos'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, paradas, numeroEntregasDia, margemPct, agendada, acrescimoAgendamento, taxaFreelancer, configs, veiculoDedicada, diasDedicada, kmEstimadoDedicada, ajudanteDedicada } = body

    if (!configs) {
      return NextResponse.json({ erro: 'Configurações não fornecidas' }, { status: 400 })
    }

    const entrada: EntradaSimulacao = {
      tipo,
      paradas: paradas || [],
      numeroEntregasDia: numeroEntregasDia || 8,
      margemPct: margemPct || 8,
      agendada: agendada || false,
      acrescimoAgendamento: parseFloat(acrescimoAgendamento) || 0,
      taxaFreelancer: taxaFreelancer ? parseFloat(taxaFreelancer) : undefined,
      veiculoDedicada,
      diasDedicada: diasDedicada || 1,
      kmEstimadoDedicada: kmEstimadoDedicada || 0,
      ajudanteDedicada: ajudanteDedicada || false,
    }

    const insumos = {
      taxasRegioes: configs.taxas as FaixaPreco[],
      configMotoristas: configs.motoristas as ConfigMotoristaProprio,
      configDedicada: configs.dedicada,
      acrescimoAgendamento: parseFloat(acrescimoAgendamento) || 0,
    }

    const resultado = simular(entrada, insumos)
    return NextResponse.json(resultado)
  } catch (error) {
    console.error('Erro na simulação:', error)
    return NextResponse.json({ erro: 'Erro interno ao calcular simulação' }, { status: 500 })
  }
}
