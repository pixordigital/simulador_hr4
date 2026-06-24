'use client'

import { useState, useEffect } from 'react'
import { Save, AlertTriangle, Check, Fuel, Settings2, Truck, DollarSign, Gauge } from 'lucide-react'

type FaixaInput = { min: number; max: number; precoPorKg: number }
type ZonaInput = { origem: string; zona: string; taxaMinima: number; pesoBase: number; faixas: FaixaInput[] }

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
  // Dedicada Kangoo
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
  // Taxas
  const [zonas, setZonas] = useState<ZonaInput[]>([])
  const [editandoZona, setEditandoZona] = useState<string | null>(null)

  // Accordion state
  const [accordionAbertos, setAccordionAbertos] = useState<string[]>([])

  useEffect(() => { carregarConfigs() }, [])

  function toggleAccordion(valor: string) {
    setAccordionAbertos(prev =>
      prev.includes(valor) ? prev.filter(v => v !== valor) : [...prev, valor]
    )
  }

  async function carregarConfigs() {
    try {
      const [geral, motoristas, dedicada, taxas] = await Promise.all([
        fetch('/api/configuracoes?tipo=geral').then(r => r.json()),
        fetch('/api/configuracoes?tipo=motoristas').then(r => r.json()),
        fetch('/api/configuracoes?tipo=dedicada').then(r => r.json()),
        fetch('/api/configuracoes?tipo=taxas').then(r => r.json()),
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
      if (!taxas.erro && Array.isArray(taxas)) setZonas(taxas)
    } catch { /* defaults */ }
  }

  async function salvarTudo() {
    setSalvando(true)
    setMensagem(null)
    const erros: string[] = []

    try {
      const r = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'geral',
          dados: { margemPadrao: parseFloat(margemPadrao), entregasPorDia: parseInt(entregasPorDia), acrescimoAgendamento: parseFloat(acrescimoAgendamento) },
        }),
      })
      if (!r.ok) erros.push('Geral')
    } catch { erros.push('Geral') }

    try {
      const r = await fetch('/api/configuracoes', {
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
      if (!r.ok) erros.push('Motoristas')
    } catch { erros.push('Motoristas') }

    try {
      const r = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'dedicada',
          dados: {
            KANGOO: { kmInclusosNaDiaria: parseInt(dedKangooKm), custoFixoMensal: parseFloat(dedKangooCustoFixo), precoCombustivelLitro: parseFloat(dedKangooLitros), consumoKmPorLitro: parseFloat(dedKangooConsumo), manutencaoPorKm: parseFloat(dedKangooManutencao), ajudanteDiaria: parseFloat(dedKangooAjudante) },
            '8-160': { kmInclusosNaDiaria: parseInt(dedOitoKm), custoFixoMensal: parseFloat(dedOitoCustoFixo), precoCombustivelLitro: parseFloat(dedOitoLitros), consumoKmPorLitro: parseFloat(dedOitoConsumo), manutencaoPorKm: parseFloat(dedOitoManutencao), ajudanteDiaria: parseFloat(dedOitoAjudante) },
          },
        }),
      })
      if (!r.ok) erros.push('Dedicada')
    } catch { erros.push('Dedicada') }

    try {
      const r = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'taxas',
          dados: zonas,
        }),
      })
      if (!r.ok) erros.push('Taxas')
    } catch { erros.push('Taxas') }

    setSalvando(false)
    if (erros.length === 0) setMensagem({ tipo: 'sucesso', texto: 'Todas as configurações salvas com sucesso!' })
    else setMensagem({ tipo: 'erro', texto: `Erro ao salvar: ${erros.join(', ')}` })
    setTimeout(() => setMensagem(null), 4000)
  }

  function atualizarFaixa(zonaIdx: number, faixaIdx: number, campo: keyof FaixaInput, valor: string) {
    const novas = [...zonas]
    novas[zonaIdx].faixas[faixaIdx] = { ...novas[zonaIdx].faixas[faixaIdx], [campo]: valor === '' ? 0 : parseFloat(valor) }
    setZonas(novas)
  }

  function atualizarZona(zonaIdx: number, campo: keyof ZonaInput, valor: string) {
    const novas = [...zonas]
    if (campo === 'taxaMinima' || campo === 'pesoBase') {
      (novas[zonaIdx] as any)[campo] = valor === '' ? 0 : parseFloat(valor)
    } else {
      (novas[zonaIdx] as any)[campo] = valor
    }
    setZonas(novas)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-text-primary" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Configurações
        </h1>
        <p className="text-sm text-text-secondary mt-1">Gerencie os parâmetros operacionais do simulador</p>
      </div>

      {mensagem && (
        <div className={`rounded-[4px] p-3 text-sm font-medium flex items-center gap-2 ${
          mensagem.tipo === 'sucesso'
            ? 'bg-[#15803D]/10 text-[#15803D] border-l-[3px] border-l-[#15803D]'
            : 'bg-[#B91C1C]/10 text-[#B91C1C] border-l-[3px] border-l-[#B91C1C]'
        }`}>
          {mensagem.tipo === 'sucesso' ? <Check size={16} /> : <AlertTriangle size={16} />}
          {mensagem.texto}
        </div>
      )}

      {/* Combustível + Geral — destaque mensal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Settings2 size={16} className="text-[#F97316]" />
            <h2 className="text-sm font-semibold text-text-primary">Geral</h2>
          </div>
          <p className="text-[12px] text-text-secondary -mt-2">Alterado mensalmente</p>
          <div className="space-y-3">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">Margem padrão (%)</label>
              <input type="number" value={margemPadrao} onChange={e => setMargemPadrao(e.target.value)} step="0.5" min="0"
                className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">Entregas/dia padrão</label>
              <input type="number" value={entregasPorDia} onChange={e => setEntregasPorDia(e.target.value)} min="1"
                className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">Acréscimo agendamento (R$)</label>
              <input type="number" value={acrescimoAgendamento} onChange={e => setAcrescimoAgendamento(e.target.value)} step="0.01" min="0"
                className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
            </div>
          </div>
        </div>

        <div className="border border-[#F97316]/30 rounded-[6px] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Fuel size={16} className="text-[#F97316]" />
            <h2 className="text-sm font-semibold text-text-primary">Combustível</h2>
          </div>
          <p className="text-[12px] text-text-secondary -mt-2">Atualize conforme o preço</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">KANGOO — R$/L</label>
              <input type="number" value={kangooPrecoLitro} onChange={e => setKangooPrecoLitro(e.target.value)} step="0.01" min="0"
                className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">8-160 — R$/L</label>
              <input type="number" value={oitoPrecoLitro} onChange={e => setOitoPrecoLitro(e.target.value)} step="0.01" min="0"
                className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">KANGOO — km/L</label>
              <input type="number" value={kangooConsumo} onChange={e => setKangooConsumo(e.target.value)} step="0.1" min="0"
                className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1">8-160 — km/L</label>
              <input type="number" value={oitoConsumo} onChange={e => setOitoConsumo(e.target.value)} step="0.1" min="0"
                className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Accordion sections */}
      {[
        { value: 'motoristas', icon: <DollarSign size={16} />, title: 'Motoristas Próprios', fields: [
          { id: 'salario', label: 'Salário mensal (R$)', val: salario, set: setSalario, step: '0.01' },
          { id: 'diasUteis', label: 'Dias úteis/mês', val: diasUteis, set: setDiasUteis },
          { id: 'vale', label: 'Vale alimentação (R$/mês)', val: vale, set: setVale, step: '0.01' },
        ]},
        { value: 'kangoo', icon: <Truck size={16} />, title: 'Veículo: KANGOO', fields: [
          { id: 'kangooCombustivel', label: 'Combustível mensal (R$)', val: kangooCombustivel, set: setKangooCombustivel, step: '0.01' },
          { id: 'kangooManutencao', label: 'Manutenção mensal (R$)', val: kangooManutencao, set: setKangooManutencao, step: '0.01' },
          { id: 'kangooSeguro', label: 'Seguro mensal (R$)', val: kangooSeguro, set: setKangooSeguro, step: '0.01' },
          { id: 'kangooDepreciacao', label: 'Depreciação mensal (R$)', val: kangooDepreciacao, set: setKangooDepreciacao, step: '0.01' },
        ]},
        { value: 'oito', icon: <Truck size={16} />, title: 'Veículo: 8-160', fields: [
          { id: 'oitoCombustivel', label: 'Combustível mensal (R$)', val: oitoCombustivel, set: setOitoCombustivel, step: '0.01' },
          { id: 'oitoManutencao', label: 'Manutenção mensal (R$)', val: oitoManutencao, set: setOitoManutencao, step: '0.01' },
          { id: 'oitoSeguro', label: 'Seguro mensal (R$)', val: oitoSeguro, set: setOitoSeguro, step: '0.01' },
          { id: 'oitoDepreciacao', label: 'Depreciação mensal (R$)', val: oitoDepreciacao, set: setOitoDepreciacao, step: '0.01' },
        ]},
        { value: 'dedKangoo', icon: <Gauge size={16} />, title: 'Entrega Dedicada — KANGOO', fields: [
          { id: 'dedKangooKm', label: 'Km incluídos na diária', val: dedKangooKm, set: setDedKangooKm },
          { id: 'dedKangooCustoFixo', label: 'Custo fixo mensal (R$)', val: dedKangooCustoFixo, set: setDedKangooCustoFixo, step: '0.01' },
          { id: 'dedKangooManutencao', label: 'Manutenção por km (R$)', val: dedKangooManutencao, set: setDedKangooManutencao, step: '0.01' },
          { id: 'dedKangooAjudante', label: 'Ajudante diária (R$)', val: dedKangooAjudante, set: setDedKangooAjudante, step: '0.01' },
        ]},
        { value: 'dedOito', icon: <Gauge size={16} />, title: 'Entrega Dedicada — 8-160', fields: [
          { id: 'dedOitoKm', label: 'Km incluídos na diária', val: dedOitoKm, set: setDedOitoKm },
          { id: 'dedOitoCustoFixo', label: 'Custo fixo mensal (R$)', val: dedOitoCustoFixo, set: setDedOitoCustoFixo, step: '0.01' },
          { id: 'dedOitoManutencao', label: 'Manutenção por km (R$)', val: dedOitoManutencao, set: setDedOitoManutencao, step: '0.01' },
          { id: 'dedOitoAjudante', label: 'Ajudante diária (R$)', val: dedOitoAjudante, set: setDedOitoAjudante, step: '0.01' },
        ]},
      ].map(s => (
        <div key={s.value} className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px]">
          <button
            onClick={() => toggleAccordion(s.value)}
            className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-text-primary hover:text-[#F97316] transition-colors"
          >
            <span className="flex items-center gap-2">{s.icon}{s.title}</span>
            <span className={`transition-transform ${accordionAbertos.includes(s.value) ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {accordionAbertos.includes(s.value) && (
            <div className="px-5 pb-4 pt-2 border-t border-[#E0DFDD] dark:border-[#1F2937]">
              <div className="grid grid-cols-3 gap-4">
                {s.fields.map((f: any) => (
                  <div key={f.id}>
                    <label className="block text-[13px] font-medium text-text-secondary mb-1">{f.label}</label>
                    <input type="number" value={f.val} onChange={e => f.set(e.target.value)} step={f.step || '1'} min="0"
                      className="w-full h-[38px] px-3 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Taxas section */}
      <div className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[6px]">
        <button
          onClick={() => toggleAccordion('taxas')}
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-text-primary hover:text-[#F97316] transition-colors"
        >
          <span className="flex items-center gap-2"><DollarSign size={16} />Tabela de Preços por Zona</span>
          <span className={`transition-transform ${accordionAbertos.includes('taxas') ? 'rotate-180' : ''}`}>▼</span>
        </button>
        {accordionAbertos.includes('taxas') && (
          <div className="px-5 pb-4 pt-2 border-t border-[#E0DFDD] dark:border-[#1F2937] space-y-3">
            <p className="text-[13px] text-text-secondary">Edite as taxas mínimas e R$/kg por faixa de peso para cada zona.</p>
            {zonas.map((zona, zIdx) => (
              <div key={zona.zona} className="border border-[#E0DFDD] dark:border-[#1F2937] rounded-[4px] p-3">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-semibold text-text-primary">{zona.zona}</span>
                  <div className="flex gap-2">
                    <div>
                      <label className="text-[10px] text-text-secondary block">Taxa mínima (R$)</label>
                      <input type="number" value={zona.taxaMinima} onChange={e => atualizarZona(zIdx, 'taxaMinima', e.target.value)} step="0.01" min="0"
                        className="w-24 h-[30px] px-2 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
                    </div>
                    <div>
                      <label className="text-[10px] text-text-secondary block">Peso base (kg)</label>
                      <input type="number" value={zona.pesoBase} onChange={e => atualizarZona(zIdx, 'pesoBase', e.target.value)} min="0"
                        className="w-24 h-[30px] px-2 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  {zona.faixas.map((faixa, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-[13px]">
                      <span className="text-text-secondary w-24">
                        {faixa.min}-{faixa.max > 999 ? `${faixa.max}kg` : `${faixa.max}kg`}
                      </span>
                      <input type="number" value={faixa.precoPorKg} onChange={e => atualizarFaixa(zIdx, fIdx, 'precoPorKg', e.target.value)} step="0.01" min="0"
                        className="w-24 h-[28px] px-2 border border-[#A8A29E] dark:border-[#374151] rounded-[4px] bg-surface-raised text-sm outline-none focus:border-[#F97316] focus:border-2 font-num" />
                      <span className="text-text-secondary">R$/kg</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={salvarTudo}
        disabled={salvando}
        className="w-full h-12 bg-[#F97316] hover:bg-[#C2590A] text-white font-semibold text-sm rounded-[6px] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Save size={16} />
        {salvando ? 'Salvando...' : 'Salvar Todas as Configurações'}
      </button>
    </div>
  )
}
