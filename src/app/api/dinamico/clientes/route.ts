import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data/dynamic/clientes.json')

interface Cliente {
  id: string
  nome: string
  documento?: string
  endereco?: string
  telefone?: string
  email?: string
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
}

async function readClientes(): Promise<Cliente[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function writeClientes(clientes: Cliente[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(clientes, null, 2), 'utf-8')
}

export async function GET() {
  const clientes = await readClientes()
  return NextResponse.json(clientes)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nome, documento, endereco, telefone, email, observacoes } = body

    if (!nome || !nome.trim()) {
      return NextResponse.json({ erro: 'Nome é obrigatório' }, { status: 400 })
    }

    const clientes = await readClientes()
    const novoCliente: Cliente = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      documento: documento?.trim(),
      endereco: endereco?.trim(),
      telefone: telefone?.trim(),
      email: email?.trim(),
      observacoes: observacoes?.trim(),
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    }

    clientes.push(novoCliente)
    await writeClientes(clientes)

    return NextResponse.json(novoCliente, { status: 201 })
  } catch (e) {
    return NextResponse.json({ erro: 'Erro ao criar cliente' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, nome, documento, endereco, telefone, email, observacoes } = body

    if (!id) {
      return NextResponse.json({ erro: 'ID é obrigatório' }, { status: 400 })
    }
    if (!nome || !nome.trim()) {
      return NextResponse.json({ erro: 'Nome é obrigatório' }, { status: 400 })
    }

    const clientes = await readClientes()
    const idx = clientes.findIndex(c => c.id === id)

    if (idx === -1) {
      return NextResponse.json({ erro: 'Cliente não encontrado' }, { status: 404 })
    }

    clientes[idx] = {
      ...clientes[idx],
      nome: nome.trim(),
      documento: documento?.trim(),
      endereco: endereco?.trim(),
      telefone: telefone?.trim(),
      email: email?.trim(),
      observacoes: observacoes?.trim(),
      atualizadoEm: new Date().toISOString(),
    }

    await writeClientes(clientes)
    return NextResponse.json(clientes[idx])
  } catch (e) {
    return NextResponse.json({ erro: 'Erro ao atualizar cliente' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ erro: 'ID é obrigatório' }, { status: 400 })
    }

    const clientes = await readClientes()
    const filtered = clientes.filter(c => c.id !== id)

    if (filtered.length === clientes.length) {
      return NextResponse.json({ erro: 'Cliente não encontrado' }, { status: 404 })
    }

    await writeClientes(filtered)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ erro: 'Erro ao excluir cliente' }, { status: 500 })
  }
}