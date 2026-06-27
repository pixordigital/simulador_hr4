import { NextRequest, NextResponse } from 'next/server'

const BRUDAM_API_BASE = 'https://somaexpress.brudam.com.br/api/v1'

const ALLOWED_PREFIXES = ['motoristas', 'pedidos', 'clientes', 'pagamentos']

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caminho: string[] }> },
) {
  const { caminho } = await params
  const authHeader = request.headers.get('authorization')

  if (!authHeader) {
    return NextResponse.json({
      erro: 'Credenciais não fornecidas. Configure em Configurações.',
    }, { status: 401 })
  }

  const firstSegment = caminho[0]?.toLowerCase()
  if (!firstSegment || !ALLOWED_PREFIXES.includes(firstSegment)) {
    return NextResponse.json({
      erro: `Caminho não permitido. Prefixos: ${ALLOWED_PREFIXES.join(', ')}`,
    }, { status: 403 })
  }

  try {
    const pathStr = caminho.join('/')
    const url = new URL(`${BRUDAM_API_BASE}/${pathStr}${request.nextUrl.search}`)

    if (!url.href.startsWith(BRUDAM_API_BASE)) {
      return NextResponse.json({ erro: 'Caminho inválido' }, { status: 403 })
    }

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
