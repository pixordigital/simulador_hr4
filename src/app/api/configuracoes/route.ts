import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function getDataDir() {
  return path.join(process.cwd(), 'data')
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')

    if (!tipo) {
      return NextResponse.json({ erro: 'Parâmetro "tipo" é obrigatório (geral, motoristas, dedicada, taxas)' }, { status: 400 })
    }

    const dataDir = getDataDir()
    let filePath: string

    switch (tipo) {
      case 'geral':
        filePath = path.join(dataDir, 'config', 'geral.json')
        break
      case 'motoristas':
        filePath = path.join(dataDir, 'config', 'motoristas-proprios.json')
        break
      case 'dedicada':
        filePath = path.join(dataDir, 'config', 'dedicada.json')
        break
      case 'taxas':
        filePath = path.join(dataDir, 'rates', 'taxas-regioes.json')
        break
      default:
        return NextResponse.json({ erro: 'Tipo inválido' }, { status: 400 })
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    return NextResponse.json(JSON.parse(content))
  } catch (error) {
    console.error('Erro ao ler configuração:', error)
    return NextResponse.json({ erro: 'Erro ao ler configuração' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { tipo, dados } = body

    if (!tipo || !dados) {
      return NextResponse.json({ erro: 'Campos "tipo" e "dados" são obrigatórios' }, { status: 400 })
    }

    const dataDir = getDataDir()
    let filePath: string

    switch (tipo) {
      case 'geral':
        filePath = path.join(dataDir, 'config', 'geral.json')
        break
      case 'motoristas':
        filePath = path.join(dataDir, 'config', 'motoristas-proprios.json')
        break
      case 'dedicada':
        filePath = path.join(dataDir, 'config', 'dedicada.json')
        break
      case 'taxas':
        filePath = path.join(dataDir, 'rates', 'taxas-regioes.json')
        break
      default:
        return NextResponse.json({ erro: 'Tipo inválido' }, { status: 400 })
    }

    fs.writeFileSync(filePath, JSON.stringify(dados, null, 2), 'utf-8')
    return NextResponse.json({ sucesso: true })
  } catch (error) {
    console.error('Erro ao salvar configuração:', error)
    return NextResponse.json({ erro: 'Erro ao salvar configuração. Verifique as permissões do arquivo.' }, { status: 500 })
  }
}
