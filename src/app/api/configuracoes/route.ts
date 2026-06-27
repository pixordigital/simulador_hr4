import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Static fallbacks bundled at build time (for CF Workers without fs)
import dadosGerais from '@/../data/config/geral.json'
import dadosMotoristas from '@/../data/config/motoristas-proprios.json'
import dadosDedicada from '@/../data/config/dedicada.json'
import dadosTaxas from '@/../data/rates/taxas-regioes.json'

const CONFIG_FILE = path.join(process.cwd(), 'data', 'dynamic', 'configuracoes.json')

function lerConfigsRuntime(): Record<string, any> | null {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
    }
  } catch {}
  return null
}

function salvarConfigsRuntime(dados: Record<string, any>) {
  const dir = path.dirname(CONFIG_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  // Merge: keep existing keys not in this write
  const existentes = lerConfigsRuntime() || {}
  const merged = { ...existentes, ...dados }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8')
}

const DEFAULTS: Record<string, unknown> = {
  geral: dadosGerais,
  motoristas: dadosMotoristas,
  dedicada: dadosDedicada,
  taxas: dadosTaxas,
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo')

  if (!tipo || !DEFAULTS[tipo]) {
    return NextResponse.json(
      { erro: 'Parâmetro "tipo" inválido (geral, motoristas, dedicada, taxas)' },
      { status: 400 },
    )
  }

  // If runtime configs exist, serve from there (overrides static defaults)
  const runtime = lerConfigsRuntime()
  if (runtime && runtime[tipo]) {
    return NextResponse.json(runtime[tipo])
  }

  return NextResponse.json(DEFAULTS[tipo])
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, dados } = body

    if (!tipo || !DEFAULTS[tipo]) {
      return NextResponse.json({ erro: 'Tipo inválido' }, { status: 400 })
    }

    salvarConfigsRuntime({ [tipo]: dados })
    return NextResponse.json({ sucesso: true, tipo })
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    return NextResponse.json({ erro: 'Erro ao salvar configurações' }, { status: 500 })
  }
}
