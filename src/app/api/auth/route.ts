import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action, email, password } = body

    if (action === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return NextResponse.json({ erro: error.message }, { status: 400 })
      return NextResponse.json({ user: data.user })
    }

    if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return NextResponse.json({ erro: error.message }, { status: 400 })
      return NextResponse.json({ user: data.user })
    }

    return NextResponse.json({ erro: 'Ação inválida' }, { status: 400 })
  } catch (error) {
    console.error('Erro na autenticação:', error)
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 })
  }
}
