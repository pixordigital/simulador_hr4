'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function NovoMotoristaPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [taxaPadrao, setTaxaPadrao] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [salvo, setSalvo] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSalvo(true)
    setTimeout(() => router.push('/motoristas'), 1000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/motoristas" className="p-2 hover:bg-muted rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Novo Motorista</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Motorista</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxa">Taxa padrão (R$)</Label>
              <Input id="taxa" type="number" value={taxaPadrao} onChange={e => setTaxaPadrao(e.target.value)} step="0.01" min="0" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea id="obs" value={observacoes} onChange={e => setObservacoes(e.target.value)} rows={3} />
            </div>

            {salvo && (
              <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400">
                <Check size={16} />
                <AlertDescription>Motorista salvo com sucesso!</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">Salvar Motorista</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
