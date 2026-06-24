import { NextRequest, NextResponse } from 'next/server'

const BRUDAM_API_BASE = 'https://somaexpress.brudam.com.br/api/v1'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caminho: string[] }> },
) {
  const { caminho } = await params
  const path = caminho.join('/')
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return NextResponse.json({
      erro: 'Credenciais não fornecidas. Configure em Configurações.',
    }, { status: 401 })
  }

  try {
    const url = `${BRUDAM_API_BASE}/${path}${request.nextUrl.search}`
    const res = await fetch(url, {
      headers: {
        authorization: authHeader,
        accept: 'application/json',
      },
    })
    const text = await res.text()
    try {
      return NextResponse.json(JSON.parse(text), { status: res.status })
    } catch {
      return new NextResponse(text, { status: res.status })
    }
  } catch {
    return NextResponse.json({ erro: 'Erro ao conectar com Brudam' }, { status: 502 })
  }
}
