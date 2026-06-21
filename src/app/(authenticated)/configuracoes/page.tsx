'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Save, AlertTriangle, Check } from 'lucide-react'

type SecaoCollapsible = {
  id: string
  titulo: string
  aberto: boolean
}

export default function ConfiguracoesPage() {
  const [secoes, setSecoes] = useState<SecaoCollapsible[]>([
    { id: 'geral', titulo: 'Geral', aberto: true },
    { id: 'combustivel', titulo: 'Combustível', aberto: true },
    { id: 'motoristas', titulo: 'Motoristas Próprios', aberto: false },
    { id: 'veiculoKangoo', titulo: 'Veículo: KANGOO', aberto: false },
    { id: 'veiculo8160', titulo: 'Veículo: 8-160', aberto: false },
    { id: 'dedicadaKangoo', titulo: 'Entrega Dedicada — KANGOO', aberto: false },
    { id: 'dedicada8160', titulo: 'Entrega Dedicada — 8-160', aberto: false },
    { id: 'taxas', titulo: 'Tabela de Preços por Zona', aberto: false },
  ])

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

  const toggleSecao = (id: string) => {
    setSecoes(secoes.map(s => s.id === id ? { ...s, aberto: !s.aberto } : s))
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
        <div className={`p-4 rounded-xl flex items-center gap-2 text-sm ${
          mensagem.tipo === 'sucesso'
            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
        }`}>
          {mensagem.tipo === 'sucesso' ? <Check size={18} /> : <AlertTriangle size={18} />}
          {mensagem.texto}
        </div>
      )}

      {/* Seção: Geral + Combustível (sempre visíveis, destaque) */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Geral</h2>
        <p className="text-xs text-[var(--color-muted-fg)]">Campos alterados com frequência mensal</p>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Margem padrão (%)</label>
            <input type="number" value={margemPadrao} onChange={e => setMargemPadrao(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.5" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Entregas/dia padrão</label>
            <input type="number" value={entregasPorDia} onChange={e => setEntregasPorDia(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Acréscimo agendamento (R$)</label>
            <input type="number" value={acrescimoAgendamento} onChange={e => setAcrescimoAgendamento(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" />
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">Combustível</h2>
        <p className="text-xs text-[var(--color-muted-fg)]">Alterado mensalmente conforme variação de preço</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">KANGOO — Preço do litro (R$)</label>
            <input type="number" value={kangooPrecoLitro} onChange={e => setKangooPrecoLitro(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">8-160 — Preço do litro (R$)</label>
            <input type="number" value={oitoPrecoLitro} onChange={e => setOitoPrecoLitro(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">KANGOO — Consumo (km/L)</label>
            <input type="number" value={kangooConsumo} onChange={e => setKangooConsumo(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.1" min="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">8-160 — Consumo (km/L)</label>
            <input type="number" value={oitoConsumo} onChange={e => setOitoConsumo(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.1" min="0" />
          </div>
        </div>
      </div>

      {/* Seções colapsáveis */}
      {secoes.filter(s => !['geral', 'combustivel'].includes(s.id)).map(secao => (
        <div key={secao.id} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl overflow-hidden">
          <button
            onClick={() => toggleSecao(secao.id)}
            className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-muted)] transition-colors"
          >
            <h2 className="text-base font-semibold">{secao.titulo}</h2>
            {secao.aberto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {secao.aberto && (
            <div className="p-6 pt-0 space-y-4">
              {secao.id === 'motoristas' && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Salário mensal (R$)</label>
                    <input type="number" value={salario} onChange={e => setSalario(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dias úteis/mês</label>
                    <input type="number" value={diasUteis} onChange={e => setDiasUteis(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" min="1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Vale alimentação (R$/mês)</label>
                    <input type="number" value={vale} onChange={e => setVale(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" />
                  </div>
                </div>
              )}

              {secao.id === 'veiculoKangoo' && (
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Combustível mensal (R$)</label><input type="number" value={kangooCombustivel} onChange={e => setKangooCombustivel(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Manutenção mensal (R$)</label><input type="number" value={kangooManutencao} onChange={e => setKangooManutencao(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Seguro mensal (R$)</label><input type="number" value={kangooSeguro} onChange={e => setKangooSeguro(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Depreciação mensal (R$)</label><input type="number" value={kangooDepreciacao} onChange={e => setKangooDepreciacao(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                </div>
              )}

              {secao.id === 'veiculo8160' && (
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Combustível mensal (R$)</label><input type="number" value={oitoCombustivel} onChange={e => setOitoCombustivel(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Manutenção mensal (R$)</label><input type="number" value={oitoManutencao} onChange={e => setOitoManutencao(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Seguro mensal (R$)</label><input type="number" value={oitoSeguro} onChange={e => setOitoSeguro(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Depreciação mensal (R$)</label><input type="number" value={oitoDepreciacao} onChange={e => setOitoDepreciacao(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                </div>
              )}

              {secao.id === 'dedicadaKangoo' && (
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Km incluídos na diária</label><input type="number" value={dedKangooKm} onChange={e => setDedKangooKm(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Custo fixo mensal (R$)</label><input type="number" value={dedKangooCustoFixo} onChange={e => setDedKangooCustoFixo(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Manutenção por km (R$)</label><input type="number" value={dedKangooManutencao} onChange={e => setDedKangooManutencao(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Ajudante diária (R$)</label><input type="number" value={dedKangooAjudante} onChange={e => setDedKangooAjudante(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Preço litro (R$)</label><input type="number" value={dedKangooLitros} onChange={e => setDedKangooLitros(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Consumo (km/L)</label><input type="number" value={dedKangooConsumo} onChange={e => setDedKangooConsumo(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.1" min="0" /></div>
                </div>
              )}

              {secao.id === 'dedicada8160' && (
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="block text-sm font-medium mb-1">Km incluídos na diária</label><input type="number" value={dedOitoKm} onChange={e => setDedOitoKm(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Custo fixo mensal (R$)</label><input type="number" value={dedOitoCustoFixo} onChange={e => setDedOitoCustoFixo(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Manutenção por km (R$)</label><input type="number" value={dedOitoManutencao} onChange={e => setDedOitoManutencao(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Ajudante diária (R$)</label><input type="number" value={dedOitoAjudante} onChange={e => setDedOitoAjudante(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Preço litro (R$)</label><input type="number" value={dedOitoLitros} onChange={e => setDedOitoLitros(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.01" min="0" /></div>
                  <div><label className="block text-sm font-medium mb-1">Consumo (km/L)</label><input type="number" value={dedOitoConsumo} onChange={e => setDedOitoConsumo(e.target.value)} className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-transparent outline-none focus:ring-2 focus:ring-blue-500" step="0.1" min="0" /></div>
                </div>
              )}

              {secao.id === 'taxas' && (
                <p className="text-sm text-[var(--color-muted-fg)] italic">
                  Edite o arquivo <code className="text-xs bg-[var(--color-muted)] px-1.5 py-0.5 rounded">data/rates/taxas-regioes.json</code> para configurar as faixas de preço por zona.
                </p>
              )}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={salvarTudo}
        disabled={salvando}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-xl transition-colors"
      >
        <Save size={18} />
        {salvando ? 'Salvando...' : 'Salvar Todas as Configurações'}
      </button>
    </div>
  )
}
