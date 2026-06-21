'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit3, Trash2, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

type Motorista = {
  id: string
  nome: string
  taxaPadrao: number
  observacoes: string
}

const MOTORISTAS_SEED: Motorista[] = [
  { id: '1', nome: 'DANIELLA NOBREGA HENRIQUES GAMA', taxaPadrao: 0, observacoes: '' },
  { id: '2', nome: 'MARCIO JOAO DE OLIVEIRA SANTOS', taxaPadrao: 0, observacoes: '' },
  { id: '3', nome: 'HAYRON LEITE COUTINHO RAMOS', taxaPadrao: 0, observacoes: '' },
  { id: '4', nome: 'DAVID HENRICH MEDEIROS DE SANTANA', taxaPadrao: 0, observacoes: '' },
]

export default function MotoristasPage() {
  const [motoristas, setMotoristas] = useState<Motorista[]>(MOTORISTAS_SEED)
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<string | null>(null)
  const [formNome, setFormNome] = useState('')
  const [formTaxa, setFormTaxa] = useState('')
  const [formObs, setFormObs] = useState('')

  const filtrados = motoristas.filter(m =>
    m.nome.toLowerCase().includes(busca.toLowerCase())
  )

  const salvarEdicao = (id: string) => {
    setMotoristas(motoristas.map(m =>
      m.id === id ? { ...m, nome: formNome, taxaPadrao: parseFloat(formTaxa) || 0, observacoes: formObs } : m
    ))
    setEditando(null)
  }

  const iniciarEdicao = (m: Motorista) => {
    setEditando(m.id)
    setFormNome(m.nome)
    setFormTaxa(m.taxaPadrao.toString())
    setFormObs(m.observacoes)
  }

  const excluirMotorista = (id: string) => {
    setMotoristas(motoristas.filter(m => m.id !== id))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Motoristas Freelancers</h1>
        <Link href="/motoristas/novo">
          <Button><Plus className="mr-1 h-4 w-4" /> Novo Motorista</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar motorista..."
          className="pl-9"
        />
      </div>

      {filtrados.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Nenhum motorista encontrado</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            Cadastre motoristas freelancers para usar nas simulações.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtrados.map(motorista => (
            <Card key={motorista.id}>
              <CardContent className="p-4">
                {editando === motorista.id ? (
                  <div className="space-y-3">
                    <Input
                      type="text"
                      value={formNome}
                      onChange={e => setFormNome(e.target.value)}
                      placeholder="Nome do motorista"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Taxa padrão (R$)</label>
                        <Input
                          type="number"
                          value={formTaxa}
                          onChange={e => setFormTaxa(e.target.value)}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Observações</label>
                        <Input
                          type="text"
                          value={formObs}
                          onChange={e => setFormObs(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => salvarEdicao(motorista.id)}>
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditando(null)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{motorista.nome}</p>
                      <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                        {motorista.taxaPadrao > 0 ? (
                          <span>Taxa padrão: R$ {motorista.taxaPadrao.toFixed(2)}</span>
                        ) : (
                          <Badge variant="secondary">A definir</Badge>
                        )}
                        {motorista.observacoes && <span>{motorista.observacoes}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link href={`/motoristas/${motorista.id}/pagamentos`} title="Ver pagamentos">
                        <Button variant="ghost" size="icon"><DollarSign className="h-4 w-4 text-blue-600" /></Button>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => iniciarEdicao(motorista)} title="Editar">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => excluirMotorista(motorista.id)} title="Excluir">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
