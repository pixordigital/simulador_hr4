import { NextRequest, NextResponse } from 'next/server'

// Import JSON statically so Next.js bundles them for CF Workers (no fs at runtime)
import dadosGerais from '@/../data/config/geral.json'
import dadosMotoristas from '@/../data/config/motoristas-proprios.json'
import dadosDedicada from '@/../data/config/dedicada.json'
import dadosTaxas from '@/../data/rates/taxas-regioes.json'

const configs: Record<string, unknown> = {
  geral: dadosGerais,
  motoristas: dadosMotoristas,
  dedicada: dadosDedicada,
  taxas: dadosTaxas,
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')

  if (!tipo || !configs[tipo]) {
    return NextResponse.json(
      { erro: 'Parâmetro "tipo" inválido (geral, motoristas, dedicada, taxas)' },
      { status: 400 },
    )
  }

  return NextResponse.json(configs[tipo])
}

export async function PUT() {
  return NextResponse.json(
    {
      erro:
        'Configurações não podem ser alteradas no Cloudflare. Edite os arquivos locais e faça novo deploy.',
    },
    { status: 400 },
  )
}
