'use client'

import { useState } from 'react'
import { Play, Edit3, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type Template = { id: string; nome: string; tipo: string; cliente: string }

export default function TemplatesPage() {
  const [templates] = useState<Template[]>([])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Templates</h1>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">Nenhum template salvo</p>
            <p className="text-sm text-muted-foreground">
              Após realizar uma simulação, você pode salvá-la como template para reutilizar depois.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {templates.map(t => (
            <Card key={t.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{t.nome}</p>
                  <p className="text-sm text-muted-foreground">{t.tipo} — {t.cliente}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm"><Play size={14} /> Usar</Button>
                  <Button variant="outline" size="icon"><Edit3 size={14} /></Button>
                  <Button variant="destructive" size="icon"><Trash2 size={14} /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
