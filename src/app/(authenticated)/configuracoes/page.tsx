'use client'

import { useState, useEffect } from 'react'
import { Save, AlertTriangle, Check } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ConfiguracoesPage() {
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)

  // Geral
  const [margemPadrao, setMargemPadrao] = useState('8')
  const [entregasPorDia, setEntregasPorDia] = useState('8')
  const [acrescimoAgendamento, setAcrescimoAgendamento] = useState('0')

  // Motoristas próprios
  const [salario, setSalario] = useState('1964.63')
  const [diasUteis, setDiasUteis] = useState('22')
  const [vale, setVale] = useState('738')

  // KANGOO
  const [kangooCombustivel, setKangooCombustivel] = useState('1704.78')
  const [kangooManutencao, setKangooManutencao] = useState('184')
  const [kangooSeguro, setKangooSeguro] = useState('589.15')
  const [kangooDepreciacao, setKangooDepreciacao] = useState('0')
  const [kangooPrecoLitro, setKangooPrecoLitro] = useState('6.20')
  const [kangooConsumo, setKangooConsumo] = useState('10')

  // 8-160
  const [oitoCombustivel, setOitoCombustivel] = useState('3397.51')
  const [oitoManutencao, setOitoManutencao] = useState('1944.37')
  const [oitoSeguro, setOitoSeguro] = useState('1767.46')
  const [oitoDepreciacao, setOitoDepreciacao] = useState('0')
  const [oitoPrecoLitro, setOitoPrecoLitro] = useState('6.20')
  const [oitoConsumo, setOitoConsumo] = useState('7')

  // Dedicada KANGOO
  const [dedKangooKm, setDedKangooKm] = useState('50')
  const [dedKangooCustoFixo, setDedKangooCustoFixo] = useState('500')
  const [dedKangooLitros, setDedKangooLitros] = useState('6.20')
  const [dedKangooConsumo, setDedKangooConsumo] = useState('10')
  const [dedKangooManutencao, setDedKangooManutencao] = useState('0.15')
  const [dedKangooAjudante, setDedKangooAjudante] = useState('50')

  // Dedicada 8-160
  const [dedOitoKm, setDedOitoKm] = useState('50')
  const [dedOitoCustoFixo, setDedOitoCustoFixo] = useState('800')
  const [dedOitoLitros, setDedOitoLitros] = useState('6.20')
  const [dedOitoConsumo, setDedOitoConsumo] = useState('7')
  const [dedOitoManutencao, setDedOitoManutencao] = useState('0.25')
  const [dedOitoAjudante, setDedOitoAjudante] = useState('50')

  useEffect(() => {
    carregarConfigs()
  }, [])

  async function carregarConfigs() {
    try {
      const [geral, motoristas, dedicada] = await Promise.all([
        fetch('/api/configuracoes?tipo=geral').then(r => r.json()),
        fetch('/api/configuracoes?tipo=motoristas').then(r => r.json()),
        fetch('/api/configuracoes?tipo=dedicada').then(r => r.json()),
      ])

      if (geral.erro) return
      setMargemPadrao(String(geral.margemPadrao))
      setEntregasPorDia(String(geral.entregasPorDia))
      setAcrescimoAgendamento(String(geral.acrescimoAgendamento))

      if (!motoristas.erro) {
        setSalario(String(motoristas.salarioMensal))
        setDiasUteis(String(motoristas.diasUteisPorMes))
        setVale(String(motoristas.valeAlimentacao))
        if (motoristas.veiculos?.KANGOO) {
          setKangooCombustivel(String(motoristas.veiculos.KANGOO.combustivelMensal))
          setKangooManutencao(String(motoristas.veiculos.KANGOO.manutencaoMensal))
          setKangooSeguro(String(motoristas.veiculos.KANGOO.seguroMensal))
          setKangooDepreciacao(String(motoristas.veiculos.KANGOO.depreciacaoMensal))
          setKangooPrecoLitro(String(motoristas.veiculos.KANGOO.precoCombustivelLitro))
          setKangooConsumo(String(motoristas.veiculos.KANGOO.consumoKmPorLitro))
        }
        if (motoristas.veiculos?.['8-160']) {
          setOitoCombustivel(String(motoristas.veiculos['8-160'].combustivelMensal))
          setOitoManutencao(String(motoristas.veiculos['8-160'].manutencaoMensal))
          setOitoSeguro(String(motoristas.veiculos['8-160'].seguroMensal))
          setOitoDepreciacao(String(motoristas.veiculos['8-160'].depreciacaoMensal))
          setOitoPrecoLitro(String(motoristas.veiculos['8-160'].precoCombustivelLitro))
          setOitoConsumo(String(motoristas.veiculos['8-160'].consumoKmPorLitro))
        }
      }

      if (!dedicada.erro) {
        if (dedicada.KANGOO) {
          setDedKangooKm(String(dedicada.KANGOO.kmInclusosNaDiaria))
          setDedKangooCustoFixo(String(dedicada.KANGOO.custoFixoMensal))
          setDedKangooLitros(String(dedicada.KANGOO.precoCombustivelLitro))
          setDedKangooConsumo(String(dedicada.KANGOO.consumoKmPorLitro))
          setDedKangooManutencao(String(dedicada.KANGOO.manutencaoPorKm))
          setDedKangooAjudante(String(dedicada.KANGOO.ajudanteDiaria))
        }
        if (dedicada['8-160']) {
          setDedOitoKm(String(dedicada['8-160'].kmInclusosNaDiaria))
          setDedOitoCustoFixo(String(dedicada['8-160'].custoFixoMensal))
          setDedOitoLitros(String(dedicada['8-160'].precoCombustivelLitro))
          setDedOitoConsumo(String(dedicada['8-160'].consumoKmPorLitro))
          setDedOitoManutencao(String(dedicada['8-160'].manutencaoPorKm))
          setDedOitoAjudante(String(dedicada['8-160'].ajudanteDiaria))
        }
      }
    } catch {
      // Configs não carregadas ainda — usa defaults
    }
  }

  async function salvarTudo() {
    setSalvando(true)
    setMensagem(null)
    let erros: string[] = []

    try {
      const geralRes = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'geral', dados: { margemPadrao: parseFloat(margemPadrao), entregasPorDia: parseInt(entregasPorDia), acrescimoAgendamento: parseFloat(acrescimoAgendamento) } }),
      })
      if (!geralRes.ok) erros.push('Geral')
    } catch { erros.push('Geral') }

    try {
      const motRes = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'motoristas',
          dados: {
            salarioMensal: parseFloat(salario),
            diasUteisPorMes: parseInt(diasUteis),
            valeAlimentacao: parseFloat(vale),
            veiculos: {
              KANGOO: {
                combustivelMensal: parseFloat(kangooCombustivel),
                manutencaoMensal: parseFloat(kangooManutencao),
                seguroMensal: parseFloat(kangooSeguro),
                depreciacaoMensal: parseFloat(kangooDepreciacao),
                precoCombustivelLitro: parseFloat(kangooPrecoLitro),
                consumoKmPorLitro: parseFloat(kangooConsumo),
              },
              '8-160': {
                combustivelMensal: parseFloat(oitoCombustivel),
                manutencaoMensal: parseFloat(oitoManutencao),
                seguroMensal: parseFloat(oitoSeguro),
                depreciacaoMensal: parseFloat(oitoDepreciacao),
                precoCombustivelLitro: parseFloat(oitoPrecoLitro),
                consumoKmPorLitro: parseFloat(oitoConsumo),
              },
            },
          },
        }),
      })
      if (!motRes.ok) erros.push('Motoristas')
    } catch { erros.push('Motoristas') }

    try {
      const dedRes = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'dedicada',
          dados: {
            KANGOO: {
              kmInclusosNaDiaria: parseInt(dedKangooKm),
              custoFixoMensal: parseFloat(dedKangooCustoFixo),
              precoCombustivelLitro: parseFloat(dedKangooLitros),
              consumoKmPorLitro: parseFloat(dedKangooConsumo),
              manutencaoPorKm: parseFloat(dedKangooManutencao),
              ajudanteDiaria: parseFloat(dedKangooAjudante),
            },
            '8-160': {
              kmInclusosNaDiaria: parseInt(dedOitoKm),
              custoFixoMensal: parseFloat(dedOitoCustoFixo),
              precoCombustivelLitro: parseFloat(dedOitoLitros),
              consumoKmPorLitro: parseFloat(dedOitoConsumo),
              manutencaoPorKm: parseFloat(dedOitoManutencao),
              ajudanteDiaria: parseFloat(dedOitoAjudante),
            },
          },
        }),
      })
      if (!dedRes.ok) erros.push('Dedicada')
    } catch { erros.push('Dedicada') }

    setSalvando(false)
    if (erros.length === 0) {
      setMensagem({ tipo: 'sucesso', texto: 'Todas as configurações salvas com sucesso!' })
    } else {
      setMensagem({ tipo: 'erro', texto: `Erro ao salvar: ${erros.join(', ')}. Verifique as permissões dos arquivos.` })
    }

    setTimeout(() => setMensagem(null), 4000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <h1 className="text-2xl font-bold">Configurações</h1>

      {mensagem && (
        <Alert variant={mensagem.tipo === 'sucesso' ? 'default' : 'destructive'}>
          {mensagem.tipo === 'sucesso' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <AlertTitle>{mensagem.tipo === 'sucesso' ? 'Sucesso' : 'Erro'}</AlertTitle>
          <AlertDescription>{mensagem.texto}</AlertDescription>
        </Alert>
      )}

      {/* Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Geral</CardTitle>
          <CardDescription>Campos alterados com frequência mensal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="margemPadrao">Margem padrão (%)</Label>
              <Input
                id="margemPadrao"
                type="number"
                value={margemPadrao}
                onChange={e => setMargemPadrao(e.target.value)}
                step="0.5"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="entregasPorDia">Entregas/dia padrão</Label>
              <Input
                id="entregasPorDia"
                type="number"
                value={entregasPorDia}
                onChange={e => setEntregasPorDia(e.target.value)}
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acrescimoAgendamento">Acréscimo agendamento (R$)</Label>
              <Input
                id="acrescimoAgendamento"
                type="number"
                value={acrescimoAgendamento}
                onChange={e => setAcrescimoAgendamento(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Combustível */}
      <Card>
        <CardHeader>
          <CardTitle>Combustível</CardTitle>
          <CardDescription>Alterado mensalmente conforme variação de preço</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kangooPrecoLitro">KANGOO — Preço do litro (R$)</Label>
              <Input
                id="kangooPrecoLitro"
                type="number"
                value={kangooPrecoLitro}
                onChange={e => setKangooPrecoLitro(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oitoPrecoLitro">8-160 — Preço do litro (R$)</Label>
              <Input
                id="oitoPrecoLitro"
                type="number"
                value={oitoPrecoLitro}
                onChange={e => setOitoPrecoLitro(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kangooConsumo">KANGOO — Consumo (km/L)</Label>
              <Input
                id="kangooConsumo"
                type="number"
                value={kangooConsumo}
                onChange={e => setKangooConsumo(e.target.value)}
                step="0.1"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oitoConsumo">8-160 — Consumo (km/L)</Label>
              <Input
                id="oitoConsumo"
                type="number"
                value={oitoConsumo}
                onChange={e => setOitoConsumo(e.target.value)}
                step="0.1"
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Accordion sections */}
      <Accordion multiple defaultValue={[]}>
        {/* Motoristas Próprios */}
        <AccordionItem value="motoristas">
          <AccordionTrigger className="text-base font-semibold">Motoristas Próprios</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="salario">Salário mensal (R$)</Label>
                <Input
                  id="salario"
                  type="number"
                  value={salario}
                  onChange={e => setSalario(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="diasUteis">Dias úteis/mês</Label>
                <Input
                  id="diasUteis"
                  type="number"
                  value={diasUteis}
                  onChange={e => setDiasUteis(e.target.value)}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vale">Vale alimentação (R$/mês)</Label>
                <Input
                  id="vale"
                  type="number"
                  value={vale}
                  onChange={e => setVale(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Veículo: KANGOO */}
        <AccordionItem value="veiculoKangoo">
          <AccordionTrigger className="text-base font-semibold">Veículo: KANGOO</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="kangooCombustivel">Combustível mensal (R$)</Label>
                <Input id="kangooCombustivel" type="number" value={kangooCombustivel} onChange={e => setKangooCombustivel(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kangooManutencao">Manutenção mensal (R$)</Label>
                <Input id="kangooManutencao" type="number" value={kangooManutencao} onChange={e => setKangooManutencao(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kangooSeguro">Seguro mensal (R$)</Label>
                <Input id="kangooSeguro" type="number" value={kangooSeguro} onChange={e => setKangooSeguro(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kangooDepreciacao">Depreciação mensal (R$)</Label>
                <Input id="kangooDepreciacao" type="number" value={kangooDepreciacao} onChange={e => setKangooDepreciacao(e.target.value)} step="0.01" min="0" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Veículo: 8-160 */}
        <AccordionItem value="veiculo8160">
          <AccordionTrigger className="text-base font-semibold">Veículo: 8-160</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="oitoCombustivel">Combustível mensal (R$)</Label>
                <Input id="oitoCombustivel" type="number" value={oitoCombustivel} onChange={e => setOitoCombustivel(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oitoManutencao">Manutenção mensal (R$)</Label>
                <Input id="oitoManutencao" type="number" value={oitoManutencao} onChange={e => setOitoManutencao(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oitoSeguro">Seguro mensal (R$)</Label>
                <Input id="oitoSeguro" type="number" value={oitoSeguro} onChange={e => setOitoSeguro(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oitoDepreciacao">Depreciação mensal (R$)</Label>
                <Input id="oitoDepreciacao" type="number" value={oitoDepreciacao} onChange={e => setOitoDepreciacao(e.target.value)} step="0.01" min="0" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Entrega Dedicada — KANGOO */}
        <AccordionItem value="dedicadaKangoo">
          <AccordionTrigger className="text-base font-semibold">Entrega Dedicada — KANGOO</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="dedKangooKm">Km incluídos na diária</Label>
                <Input id="dedKangooKm" type="number" value={dedKangooKm} onChange={e => setDedKangooKm(e.target.value)} min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dedKangooCustoFixo">Custo fixo mensal (R$)</Label>
                <Input id="dedKangooCustoFixo" type="number" value={dedKangooCustoFixo} onChange={e => setDedKangooCustoFixo(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dedKangooManutencao">Manutenção por km (R$)</Label>
                <Input id="dedKangooManutencao" type="number" value={dedKangooManutencao} onChange={e => setDedKangooManutencao(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dedKangooAjudante">Ajudante diária (R$)</Label>
                <Input id="dedKangooAjudante" type="number" value={dedKangooAjudante} onChange={e => setDedKangooAjudante(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dedKangooLitros">Preço litro (R$)</Label>
                <Input id="dedKangooLitros" type="number" value={dedKangooLitros} onChange={e => setDedKangooLitros(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dedKangooConsumo">Consumo (km/L)</Label>
                <Input id="dedKangooConsumo" type="number" value={dedKangooConsumo} onChange={e => setDedKangooConsumo(e.target.value)} step="0.1" min="0" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Entrega Dedicada — 8-160 */}
        <AccordionItem value="dedicada8160">
          <AccordionTrigger className="text-base font-semibold">Entrega Dedicada — 8-160</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="dedOitoKm">Km incluídos na diária</Label>
                <Input id="dedOitoKm" type="number" value={dedOitoKm} onChange={e => setDedOitoKm(e.target.value)} min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dedOitoCustoFixo">Custo fixo mensal (R$)</Label>
                <Input id="dedOitoCustoFixo" type="number" value={dedOitoCustoFixo} onChange={e => setDedOitoCustoFixo(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dedOitoManutencao">Manutenção por km (R$)</Label>
                <Input id="dedOitoManutencao" type="number" value={dedOitoManutencao} onChange={e => setDedOitoManutencao(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dedOitoAjudante">Ajudante diária (R$)</Label>
                <Input id="dedOitoAjudante" type="number" value={dedOitoAjudante} onChange={e => setDedOitoAjudante(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dedOitoLitros">Preço litro (R$)</Label>
                <Input id="dedOitoLitros" type="number" value={dedOitoLitros} onChange={e => setDedOitoLitros(e.target.value)} step="0.01" min="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dedOitoConsumo">Consumo (km/L)</Label>
                <Input id="dedOitoConsumo" type="number" value={dedOitoConsumo} onChange={e => setDedOitoConsumo(e.target.value)} step="0.1" min="0" />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Tabela de Preços por Zona */}
        <AccordionItem value="taxas">
          <AccordionTrigger className="text-base font-semibold">Tabela de Preços por Zona</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground italic">
              Edite o arquivo <code className="text-xs bg-muted px-1.5 py-0.5 rounded">data/rates/taxas-regioes.json</code> para configurar as faixas de preço por zona.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        onClick={salvarTudo}
        disabled={salvando}
        className="w-full"
        size="lg"
      >
        <Save className="mr-2 h-4 w-4" />
        {salvando ? 'Salvando...' : 'Salvar Todas as Configurações'}
      </Button>
    </div>
  )
}
