'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Pagamento = { id: string; data: string; valor: number; descricao: string }

export default function PagamentosPage({ params }: { params: { id: string } }) {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [data, setData] = useState('')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')

  const adicionar = () => {
    if (!data || !valor) return
    setPagamentos([...pagamentos, { id: Math.random().toString(36).slice(2), data, valor: parseFloat(valor), descricao }])
    setData(''); setValor(''); setDescricao('')
  }

  const excluir = (id: string) => setPagamentos(pagamentos.filter(p => p.id !== id))
  const total = pagamentos.reduce((s, p) => s + p.valor, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/motoristas" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Pagamentos</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrar Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" value={data} onChange={e => setData(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input id="valor" type="number" value={valor} onChange={e => setValor(e.target.value)} step="0.01" min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descrição</Label>
              <Input id="desc" value={descricao} onChange={e => setDescricao(e.target.value)} />
            </div>
          </div>
          <Button onClick={adicionar}><Plus size={16} /> Adicionar Pagamento</Button>
        </CardContent>
      </Card>

      {pagamentos.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <span className="text-lg font-bold">Total: R$ {total.toFixed(2)}</span>
          </CardHeader>
          <CardContent className="space-y-2">
            {pagamentos.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">R$ {p.valor.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{p.data} {p.descricao && `— ${p.descricao}`}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => excluir(p.id)} className="text-destructive hover:text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum pagamento registrado
          </CardContent>
        </Card>
      )}
    </div>
  )
}
