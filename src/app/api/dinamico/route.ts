import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function getDynamicDir() {
  const dir = path.join(process.cwd(), 'data', 'dynamic')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

const ARQUIVOS: Record<string, string> = {
  motoristas: 'motoristas-freelancer.json',
  pagamentos: 'pagamentos-freelancer.json',
  simulacoes: 'simulacoes.json',
  templates: 'templates.json',
}

function getFilePath(tipo: string): string {
  const filename = ARQUIVOS[tipo]
  if (!filename) throw new Error('Tipo inválido')
  return path.join(getDynamicDir(), filename)
}

function lerDados(tipo: string): any[] {
  const fp = getFilePath(tipo)
  if (!fs.existsSync(fp)) return []
  try {
    return JSON.parse(fs.readFileSync(fp, 'utf-8'))
  } catch {
    return []
  }
}

function salvarDados(tipo: string, dados: any[]) {
  fs.writeFileSync(getFilePath(tipo), JSON.stringify(dados, null, 2), 'utf-8')
}

// Field allowlists per tipo — only these fields are accepted on write
function pickSimulacao(body: any) {
  const { nomeCliente, tipoEntrega, agendada, dataHorarioAgendado, acrescimoAgendamento, margemPct, opcaoVeiculo, resultadoJson, inputJson, precoCobrado, observacoes } = body
  return { nomeCliente, tipoEntrega, agendada, dataHorarioAgendado, acrescimoAgendamento, margemPct, opcaoVeiculo, resultadoJson, inputJson, precoCobrado, observacoes }
}
function pickTemplate(body: any) {
  const { nome, descricao, inputJson } = body
  return { nome, descricao, inputJson }
}
function pickMotorista(body: any) {
  const { nome, taxaPadrao, observacoes } = body
  return { nome, taxaPadrao: taxaPadrao || 0, observacoes }
}
function pickPagamento(body: any) {
  const { motoristaId, valor, dataPagamento, descricao } = body
  return { motoristaId, valor: valor || 0, dataPagamento, descricao }
}

const PICK_FN: Record<string, (body: any) => any> = {
  simulacoes: pickSimulacao,
  templates: pickTemplate,
  motoristas: pickMotorista,
  pagamentos: pickPagamento,
}

// Allowed fields on update per tipo
function pickUpdate(tipo: string, body: any): any {
  if (tipo === 'simulacoes') {
    const { precoCobrado, observacoes } = body
    return { precoCobrado, observacoes }
  }
  if (tipo === 'motoristas') {
    const { nome, taxaPadrao, observacoes } = body
    return { nome, taxaPadrao, observacoes }
  }
  if (tipo === 'pagamentos') {
    const { valor, dataPagamento, descricao } = body
    return { valor, dataPagamento, descricao }
  }
  if (tipo === 'templates') {
    const { nome, descricao, inputJson } = body
    return { nome, descricao, inputJson }
  }
  return {}
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    if (!tipo || !ARQUIVOS[tipo]) {
      return NextResponse.json({ erro: 'Parâmetro "tipo" obrigatório: motoristas, pagamentos, simulacoes, templates' }, { status: 400 })
    }
    const dados = lerDados(tipo)
    return NextResponse.json(dados)
  } catch (error) {
    console.error('Erro ao ler dados dinâmicos:', error)
    return NextResponse.json({ erro: 'Erro ao ler dados' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    if (!tipo || !ARQUIVOS[tipo]) {
      return NextResponse.json({ erro: 'Parâmetro "tipo" obrigatório' }, { status: 400 })
    }
    const body = await request.json()
    const pickFn = PICK_FN[tipo]
    const dados = lerDados(tipo)
    const novo = {
      id: crypto.randomUUID(),
      ...(pickFn ? pickFn(body) : body),
      criadoEm: new Date().toISOString(),
    }
    dados.push(novo)
    salvarDados(tipo, dados)
    return NextResponse.json(novo, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar registro:', error)
    return NextResponse.json({ erro: 'Erro ao criar registro' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const id = searchParams.get('id')
    if (!tipo || !ARQUIVOS[tipo] || !id) {
      return NextResponse.json({ erro: 'Parâmetros "tipo" e "id" obrigatórios' }, { status: 400 })
    }
    const body = await request.json()
    const dados = lerDados(tipo)
    const idx = dados.findIndex((d: any) => d.id === id)
    if (idx === -1) {
      return NextResponse.json({ erro: 'Registro não encontrado' }, { status: 404 })
    }
    const allowed = pickUpdate(tipo, body)
    dados[idx] = { ...dados[idx], ...allowed, atualizadoEm: new Date().toISOString() }
    salvarDados(tipo, dados)
    return NextResponse.json(dados[idx])
  } catch (error) {
    console.error('Erro ao atualizar registro:', error)
    return NextResponse.json({ erro: 'Erro ao atualizar registro' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const id = searchParams.get('id')
    if (!tipo || !ARQUIVOS[tipo] || !id) {
      return NextResponse.json({ erro: 'Parâmetros "tipo" e "id" obrigatórios' }, { status: 400 })
    }
    const dados = lerDados(tipo)
    const novos = dados.filter((d: any) => d.id !== id)
    if (novos.length === dados.length) {
      return NextResponse.json({ erro: 'Registro não encontrado' }, { status: 404 })
    }
    salvarDados(tipo, novos)
    return NextResponse.json({ sucesso: true })
  } catch (error) {
    console.error('Erro ao deletar registro:', error)
    return NextResponse.json({ erro: 'Erro ao deletar registro' }, { status: 500 })
  }
}
