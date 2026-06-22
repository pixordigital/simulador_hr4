'use client'

import { useState, useEffect } from 'react'
import { Save, AlertTriangle, Check, Fuel, Settings2, Truck, DollarSign, Gauge } from 'lucide-react'

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
  const [margemPadrao, setMargemPadrao] = useState('8')
  const [entregasPorDia, setEntregasPorDia] = useState('8')
  const [acrescimoAgendamento, setAcrescimoAgendamento] = useState('0')
  const [salario, setSalario] = useState('1964.63')
  const [diasUteis, setDiasUteis] = useState('22')
  const [vale, setVale] = useState('738')
  const [kangooCombustivel, setKangooCombustivel] = useState('1704.78')
  const [kangooManutencao, setKangooManutencao] = useState('184')
  const [kangooSeguro, setKangooSeguro] = useState('589.15')
  const [kangooDepreciacao, setKangooDepreciacao] = useState('0')
  const [kangooPrecoLitro, setKangooPrecoLitro] = useState('6.20')
  const [kangooConsumo, setKangooConsumo] = useState('10')
  const [oitoCombustivel, setOitoCombustivel] = useState('3397.51')
  const [oitoManutencao, setOitoManutencao] = useState('1944.37')
  const [oitoSeguro, setOitoSeguro] = useState('1767.46')
  const [oitoDepreciacao, setOitoDepreciacao] = useState('0')
  const [oitoPrecoLitro, setOitoPrecoLitro] = useState('6.20')
  const [oitoConsumo, setOitoConsumo] = useState('7')
  const [dedKangooKm, setDedKangooKm] = useState('50')
  const [dedKangooCustoFixo, setDedKangooCustoFixo] = useState('500')
  const [dedKangooLitros, setDedKangooLitros] = useState('6.20')
  const [dedKangooConsumo, setDedKangooConsumo] = useState('10')
  const [dedKangooManutencao, setDedKangooManutencao] = useState('0.15')
  const [dedKangooAjudante, setDedKangooAjudante] = useState('50')
  const [dedOitoKm, setDedOitoKm] = useState('50')
  const [dedOitoCustoFixo, setDedOitoCustoFixo] = useState('800')
  const [dedOitoLitros, setDedOitoLitros] = useState('6.20')
  const [dedOitoConsumo, setDedOitoConsumo] = useState('7')
  const [dedOitoManutencao, setDedOitoManutencao] = useState('0.25')
  const [dedOitoAjudante, setDedOitoAjudante] = useState('50')

  useEffect(() => { carregarConfigs() }, [])

  async function carregarConfigs() {
    try {
      const [geral, motoristas, dedicada] = await Promise.all([
        fetch('/api/configuracoes?tipo=geral').then(r => r.json()),
        fetch('/api/configuracoes?tipo=motoristas').then(r => r.json()),
        fetch('/api/configuracoes?tipo=dedicada').then(r => r.json()),
      ])
      if (geral.erro) return
      setMargemPadrao(String(geral.margemPadrao)); setEntregasPorDia(String(geral.entregasPorDia)); setAcrescimoAgendamento(String(geral.acrescimoAgendamento))
      if (!motoristas.erro) {
        setSalario(String(motoristas.salarioMensal)); setDiasUteis(String(motoristas.diasUteisPorMes)); setVale(String(motoristas.valeAlimentacao))
        if (motoristas.veiculos?.KANGOO) {
          setKangooCombustivel(String(motoristas.veiculos.KANGOO.combustivelMensal)); setKangooManutencao(String(motoristas.veiculos.KANGOO.manutencaoMensal))
          setKangooSeguro(String(motoristas.veiculos.KANGOO.seguroMensal)); setKangooDepreciacao(String(motoristas.veiculos.KANGOO.depreciacaoMensal))
          setKangooPrecoLitro(String(motoristas.veiculos.KANGOO.precoCombustivelLitro)); setKangooConsumo(String(motoristas.veiculos.KANGOO.consumoKmPorLitro))
        }
        if (motoristas.veiculos?.['8-160']) {
          setOitoCombustivel(String(motoristas.veiculos['8-160'].combustivelMensal)); setOitoManutencao(String(motoristas.veiculos['8-160'].manutencaoMensal))
          setOitoSeguro(String(motoristas.veiculos['8-160'].seguroMensal)); setOitoDepreciacao(String(motoristas.veiculos['8-160'].depreciacaoMensal))
          setOitoPrecoLitro(String(motoristas.veiculos['8-160'].precoCombustivelLitro)); setOitoConsumo(String(motoristas.veiculos['8-160'].consumoKmPorLitro))
        }
      }
      if (!dedicada.erro) {
        if (dedicada.KANGOO) { setDedKangooKm(String(dedicada.KANGOO.kmInclusosNaDiaria)); setDedKangooCustoFixo(String(dedicada.KANGOO.custoFixoMensal)); setDedKangooLitros(String(dedicada.KANGOO.precoCombustivelLitro)); setDedKangooConsumo(String(dedicada.KANGOO.consumoKmPorLitro)); setDedKangooManutencao(String(dedicada.KANGOO.manutencaoPorKm)); setDedKangooAjudante(String(dedicada.KANGOO.ajudanteDiaria)) }
        if (dedicada['8-160']) { setDedOitoKm(String(dedicada['8-160'].kmInclusosNaDiaria)); setDedOitoCustoFixo(String(dedicada['8-160'].custoFixoMensal)); setDedOitoLitros(String(dedicada['8-160'].precoCombustivelLitro)); setDedOitoConsumo(String(dedicada['8-160'].consumoKmPorLitro)); setDedOitoManutencao(String(dedicada['8-160'].manutencaoPorKm)); setDedOitoAjudante(String(dedicada['8-160'].ajudanteDiaria)) }
      }
    } catch { /* defaults */ }
  }

  async function salvarTudo() {
    setSalvando(true); setMensagem(null); const erros: string[] = []
    try { const r = await fetch('/api/configuracoes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: 'geral', dados: { margemPadrao: parseFloat(margemPadrao), entregasPorDia: parseInt(entregasPorDia), acrescimoAgendamento: parseFloat(acrescimoAgendamento) } }) }); if (!r.ok) erros.push('Geral') } catch { erros.push('Geral') }
    try {
      const r = await fetch('/api/configuracoes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: 'motoristas', dados: { salarioMensal: parseFloat(salario), diasUteisPorMes: parseInt(diasUteis), valeAlimentacao: parseFloat(vale), veiculos: { KANGOO: { combustivelMensal: parseFloat(kangooCombustivel), manutencaoMensal: parseFloat(kangooManutencao), seguroMensal: parseFloat(kangooSeguro), depreciacaoMensal: parseFloat(kangooDepreciacao), precoCombustivelLitro: parseFloat(kangooPrecoLitro), consumoKmPorLitro: parseFloat(kangooConsumo) }, '8-160': { combustivelMensal: parseFloat(oitoCombustivel), manutencaoMensal: parseFloat(oitoManutencao), seguroMensal: parseFloat(oitoSeguro), depreciacaoMensal: parseFloat(oitoDepreciacao), precoCombustivelLitro: parseFloat(oitoPrecoLitro), consumoKmPorLitro: parseFloat(oitoConsumo) } } } }) }); if (!r.ok) erros.push('Motoristas') } catch { erros.push('Motoristas') }
    try {
      const r = await fetch('/api/configuracoes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: 'dedicada', dados: { KANGOO: { kmInclusosNaDiaria: parseInt(dedKangooKm), custoFixoMensal: parseFloat(dedKangooCustoFixo), precoCombustivelLitro: parseFloat(dedKangooLitros), consumoKmPorLitro: parseFloat(dedKangooConsumo), manutencaoPorKm: parseFloat(dedKangooManutencao), ajudanteDiaria: parseFloat(dedKangooAjudante) }, '8-160': { kmInclusosNaDiaria: parseInt(dedOitoKm), custoFixoMensal: parseFloat(dedOitoCustoFixo), precoCombustivelLitro: parseFloat(dedOitoLitros), consumoKmPorLitro: parseFloat(dedOitoConsumo), manutencaoPorKm: parseFloat(dedOitoManutencao), ajudanteDiaria: parseFloat(dedOitoAjudante) } } }) }); if (!r.ok) erros.push('Dedicada') } catch { erros.push('Dedicada') }
    setSalvando(false)
    if (erros.length === 0) setMensagem({ tipo: 'sucesso', texto: 'Todas as configurações salvas com sucesso!' })
    else setMensagem({ tipo: 'erro', texto: `Erro ao salvar: ${erros.join(', ')}. Verifique as permissões.` })
    setTimeout(() => setMensagem(null), 4000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie os parâmetros operacionais do simulador</p>
      </div>

      {mensagem && (
        <Alert variant={mensagem.tipo === 'sucesso' ? 'default' : 'destructive'} className={mensagem.tipo === 'sucesso' ? 'border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300' : ''}>
          {mensagem.tipo === 'sucesso' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <AlertTitle>{mensagem.tipo === 'sucesso' ? 'Sucesso' : 'Erro'}</AlertTitle>
          <AlertDescription>{mensagem.texto}</AlertDescription>
        </Alert>
      )}

      {/* Geral + Combustível — destaque mensal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Settings2 size={16} className="text-primary" /> Geral</CardTitle>
            <CardDescription>Alterado mensalmente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="margemPadrao" className="text-sm">Margem padrão (%)</Label><Input id="margemPadrao" type="number" value={margemPadrao} onChange={e => setMargemPadrao(e.target.value)} step="0.5" min="0" /></div>
            <div className="space-y-2"><Label htmlFor="entregasPorDia" className="text-sm">Entregas/dia padrão</Label><Input id="entregasPorDia" type="number" value={entregasPorDia} onChange={e => setEntregasPorDia(e.target.value)} min="1" /></div>
            <div className="space-y-2"><Label htmlFor="acrescimoAgendamento" className="text-sm">Acréscimo agendamento (R$)</Label><Input id="acrescimoAgendamento" type="number" value={acrescimoAgendamento} onChange={e => setAcrescimoAgendamento(e.target.value)} step="0.01" min="0" /></div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><Fuel size={16} className="text-amber-500" /> Combustível</CardTitle>
            <CardDescription>Atualize conforme o preço</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label htmlFor="kangooPrecoLitro" className="text-xs">KANGOO — R$/L</Label><Input id="kangooPrecoLitro" type="number" value={kangooPrecoLitro} onChange={e => setKangooPrecoLitro(e.target.value)} step="0.01" min="0" /></div>
              <div className="space-y-1"><Label htmlFor="oitoPrecoLitro" className="text-xs">8-160 — R$/L</Label><Input id="oitoPrecoLitro" type="number" value={oitoPrecoLitro} onChange={e => setOitoPrecoLitro(e.target.value)} step="0.01" min="0" /></div>
              <div className="space-y-1"><Label htmlFor="kangooConsumo" className="text-xs">KANGOO — km/L</Label><Input id="kangooConsumo" type="number" value={kangooConsumo} onChange={e => setKangooConsumo(e.target.value)} step="0.1" min="0" /></div>
              <div className="space-y-1"><Label htmlFor="oitoConsumo" className="text-xs">8-160 — km/L</Label><Input id="oitoConsumo" type="number" value={oitoConsumo} onChange={e => setOitoConsumo(e.target.value)} step="0.1" min="0" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Accordion multiple defaultValue={[]} className="space-y-2">
        {[
          { value: 'motoristas', icon: <DollarSign size={16} />, title: 'Motoristas Próprios', fields: [
            { id: 'salario', label: 'Salário mensal (R$)', val: salario, set: setSalario, step: '0.01' },
            { id: 'diasUteis', label: 'Dias úteis/mês', val: diasUteis, set: setDiasUteis, min: '1' },
            { id: 'vale', label: 'Vale alimentação (R$/mês)', val: vale, set: setVale, step: '0.01' },
          ]},
          { value: 'veiculoKangoo', icon: <Truck size={16} />, title: 'Veículo: KANGOO', fields: [
            { id: 'kangooCombustivel', label: 'Combustível mensal (R$)', val: kangooCombustivel, set: setKangooCombustivel, step: '0.01' },
            { id: 'kangooManutencao', label: 'Manutenção mensal (R$)', val: kangooManutencao, set: setKangooManutencao, step: '0.01' },
            { id: 'kangooSeguro', label: 'Seguro mensal (R$)', val: kangooSeguro, set: setKangooSeguro, step: '0.01' },
            { id: 'kangooDepreciacao', label: 'Depreciação mensal (R$)', val: kangooDepreciacao, set: setKangooDepreciacao, step: '0.01' },
          ]},
          { value: 'veiculo8160', icon: <Truck size={16} />, title: 'Veículo: 8-160', fields: [
            { id: 'oitoCombustivel', label: 'Combustível mensal (R$)', val: oitoCombustivel, set: setOitoCombustivel, step: '0.01' },
            { id: 'oitoManutencao', label: 'Manutenção mensal (R$)', val: oitoManutencao, set: setOitoManutencao, step: '0.01' },
            { id: 'oitoSeguro', label: 'Seguro mensal (R$)', val: oitoSeguro, set: setOitoSeguro, step: '0.01' },
            { id: 'oitoDepreciacao', label: 'Depreciação mensal (R$)', val: oitoDepreciacao, set: setOitoDepreciacao, step: '0.01' },
          ]},
          { value: 'dedicadaKangoo', icon: <Gauge size={16} />, title: 'Entrega Dedicada — KANGOO', fields: [
            { id: 'dedKangooKm', label: 'Km incluídos na diária', val: dedKangooKm, set: setDedKangooKm, min: '0' },
            { id: 'dedKangooCustoFixo', label: 'Custo fixo mensal (R$)', val: dedKangooCustoFixo, set: setDedKangooCustoFixo, step: '0.01' },
            { id: 'dedKangooManutencao', label: 'Manutenção por km (R$)', val: dedKangooManutencao, set: setDedKangooManutencao, step: '0.01' },
            { id: 'dedKangooAjudante', label: 'Ajudante diária (R$)', val: dedKangooAjudante, set: setDedKangooAjudante, step: '0.01' },
            { id: 'dedKangooLitros', label: 'Preço litro (R$)', val: dedKangooLitros, set: setDedKangooLitros, step: '0.01' },
            { id: 'dedKangooConsumo', label: 'Consumo (km/L)', val: dedKangooConsumo, set: setDedKangooConsumo, step: '0.1' },
          ]},
          { value: 'dedicada8160', icon: <Gauge size={16} />, title: 'Entrega Dedicada — 8-160', fields: [
            { id: 'dedOitoKm', label: 'Km incluídos na diária', val: dedOitoKm, set: setDedOitoKm, min: '0' },
            { id: 'dedOitoCustoFixo', label: 'Custo fixo mensal (R$)', val: dedOitoCustoFixo, set: setDedOitoCustoFixo, step: '0.01' },
            { id: 'dedOitoManutencao', label: 'Manutenção por km (R$)', val: dedOitoManutencao, set: setDedOitoManutencao, step: '0.01' },
            { id: 'dedOitoAjudante', label: 'Ajudante diária (R$)', val: dedOitoAjudante, set: setDedOitoAjudante, step: '0.01' },
            { id: 'dedOitoLitros', label: 'Preço litro (R$)', val: dedOitoLitros, set: setDedOitoLitros, step: '0.01' },
            { id: 'dedOitoConsumo', label: 'Consumo (km/L)', val: dedOitoConsumo, set: setDedOitoConsumo, step: '0.1' },
          ]},
        ].map(s => (
          <AccordionItem key={s.value} value={s.value} className="bg-card border border-border/60 rounded-xl px-1">
            <AccordionTrigger className="text-sm font-semibold px-3 py-4 hover:no-underline">
              <span className="flex items-center gap-2">{s.icon}<span>{s.title}</span></span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-3 gap-4 px-3 pb-4">
                {s.fields.map(f => (
                  <div key={f.id} className="space-y-2">
                    <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
                    <Input id={f.id} type="number" value={f.val} onChange={e => f.set(e.target.value)} step={f.step || '1'} min={f.min || '0'} />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}

        <AccordionItem value="taxas" className="bg-card border border-border/60 rounded-xl px-1">
          <AccordionTrigger className="text-sm font-semibold px-3 py-4 hover:no-underline">
            <span className="flex items-center gap-2"><Settings2 size={16} /> Tabela de Preços por Zona</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-3 pb-4">
              <p className="text-sm text-muted-foreground">Edite o arquivo <code className="text-xs bg-muted px-1.5 py-0.5 rounded">data/rates/taxas-regioes.json</code> para configurar as faixas de preço por zona.</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button onClick={salvarTudo} disabled={salvando} size="lg" className="w-full shadow-sm">
        <Save className="mr-2 h-4 w-4" />
        {salvando ? 'Salvando...' : 'Salvar Todas as Configurações'}
      </Button>
    </div>
  )
}
