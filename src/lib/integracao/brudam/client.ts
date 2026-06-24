export type BrudamAuth = { usuario: string; senha: string } | null

export function getBrudamAuth(): BrudamAuth {
  if (typeof window === 'undefined') return null
  const usuario = localStorage.getItem('brudam_usuario')
  const senha = localStorage.getItem('brudam_senha')
  if (!usuario || !senha) return null
  return { usuario, senha }
}

export function getBrudamBasicHeader(): string | null {
  const auth = getBrudamAuth()
  if (!auth) return null
  return `Basic ${btoa(`${auth.usuario}:${auth.senha}`)}`
}

export async function brudamFetch(caminho: string): Promise<any> {
  const header = getBrudamBasicHeader()
  if (!header) throw new Error('Brudam não conectado')
  const res = await fetch(`/api/integracao/brudam/${caminho}`, {
    headers: { authorization: header },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.erro || data.message || 'Erro Brudam')
  return data
}

export async function brudamConsulta(caminho: string, params?: Record<string, string>): Promise<any[]> {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  const data = await brudamFetch(`${caminho}${qs}`)
  // Brudam returns { message, status, dados? } or array directly
  if (Array.isArray(data)) return data
  if (data.dados && Array.isArray(data.dados)) return data.dados
  if (data.message && data.status !== undefined) {
    // Auth was ok but empty result
    return []
  }
  return []
}

export type BrudamMotorista = {
  id?: string
  nome?: string
  cpf?: string
  telefone?: string
  email?: string
  observacao?: string
}

export type BrudamCliente = {
  id?: string
  nome?: string
  cnpj?: string
  cidade?: string
  uf?: string
  telefone?: string
  email?: string
}

export type BrudamPedido = {
  id?: string
  numero?: string
  cliente?: string
  origem?: string
  destino?: string
  data?: string
  valor?: number
  peso?: number
  status?: string
}

export type BrudamPagamento = {
  id?: string
  motorista?: string
  valor?: number
  data?: string
  descricao?: string
}
