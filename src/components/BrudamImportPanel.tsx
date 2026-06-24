'use client'

import { useState } from 'react'
import { Database, Download, X, Check, AlertTriangle, Loader, ExternalLink, Search } from 'lucide-react'
import { getBrudamAuth, brudamConsulta } from '@/lib/integracao/brudam/client'

type Coluna = {
  chave: string
  rotulo: string
  formatar?: (v: any) => string
}

type Props = {
  titulo: string
  descricao: string
  endpoint: string
  colunas: Coluna[]
  aoImportar: (selecionados: any[]) => Promise<void>
  aoSelecionar?: (item: any) => void
  modoSelecao?: 'checkbox' | 'click'
  icone?: React.ReactNode
}

export default function BrudamImportPanel({
  titulo,
  descricao,
  endpoint,
  colunas,
  aoImportar,
  aoSelecionar,
  modoSelecao = 'checkbox',
  icone,
}: Props) {
  const [aberto, setAberto] = useState(false)
  const [itens, setItens] = useState<any[]>([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())
  const [buscando, setBuscando] = useState('')
  const [importando, setImportando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  const auth = getBrudamAuth()
  const conectado = !!auth

  async function carregar() {
    setCarregando(true)
    setErro('')
    try {
      const dados = await brudamConsulta(endpoint)
      setItens(dados)
    } catch (e: any) {
      setErro(e.message)
    }
    setCarregando(false)
  }

  function abrir() {
    setAberto(true)
    setSelecionados(new Set())
    setSucesso(false)
    if (itens.length === 0 && conectado) carregar()
  }

  function toggleItem(idx: number) {
    const novos = new Set(selecionados)
    if (novos.has(idx)) novos.delete(idx)
    else novos.add(idx)
    setSelecionados(novos)
  }

  const filtrados = buscando
    ? itens.filter(item =>
        colunas.some(c => String(item[c.chave] || '').toLowerCase().includes(buscando.toLowerCase()))
      )
    : itens

  async function handleImportar() {
    setImportando(true)
    setErro('')
    try {
      const selec = Array.from(selecionados).map(i => filtrados[i])
      await aoImportar(selec)
      setSucesso(true)
      setTimeout(() => setAberto(false), 1200)
    } catch (e: any) {
      setErro(e.message)
    }
    setImportando(false)
  }

  return (
    <>
      <button
        onClick={abrir}
        disabled={!conectado}
        className="h-[32px] px-3 rounded-[4px] bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#A8A29E] disabled:cursor-not-allowed text-white text-xs font-medium transition-colors flex items-center gap-1.5"
        title={conectado ? `Importar do Brudam` : 'Conecte o Brudam em Configurações'}
      >
        {icone || <Database size={12} />}
        {titulo}
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setAberto(false)}>
          <div
            className="bg-[var(--surface-base)] border border-[var(--border)] rounded-[8px] w-[640px] max-h-[80vh] flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-[#7C3AED]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">{descricao}</span>
                <a href="https://brudam.com.br" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#7C3AED] hover:underline flex items-center gap-0.5">
                  Brudam <ExternalLink size={9} />
                </a>
              </div>
              <button onClick={() => setAberto(false)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!conectado ? (
                <div className="text-center py-8 text-[var(--text-disabled)]">
                  <Database size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Brudam não conectado</p>
                  <p className="text-xs mt-1">Vá em Configurações para conectar</p>
                </div>
              ) : carregando ? (
                <div className="text-center py-8">
                  <Loader size={24} className="mx-auto mb-2 animate-spin text-[#7C3AED]" />
                  <p className="text-sm text-[var(--text-secondary)]">Carregando...</p>
                </div>
              ) : (
                <>
                  {/* Search */}
                  <div className="relative">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-disabled)]" />
                    <input
                      type="text"
                      value={buscando}
                      onChange={e => setBuscando(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full h-[32px] pl-8 pr-3 border border-[var(--input)] rounded-[4px] bg-[var(--surface-raised)] text-sm outline-none focus:border-[#7C3AED] text-[var(--text-primary)]"
                    />
                  </div>

                  {/* Reload */}
                  <button onClick={carregar} className="text-xs text-[#7C3AED] hover:underline flex items-center gap-1">
                    <Download size={10} /> Recarregar dados do Brudam
                  </button>

                  {/* List */}
                  {filtrados.length === 0 ? (
                    <p className="text-sm text-[var(--text-disabled)] text-center py-4">
                      {itens.length === 0 ? 'Nenhum registro encontrado no Brudam' : 'Nenhum resultado para a busca'}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-[11px] text-[var(--text-secondary)]">
                        {filtrados.length} registro(s) — {modoSelecao === 'checkbox' ? `${selecionados.size} selecionado(s)` : 'Clique para selecionar'}
                      </p>
                      <div className="border border-[var(--border)] rounded-[4px] divide-y divide-[var(--border)]">
                        {filtrados.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              if (modoSelecao === 'checkbox') toggleItem(idx)
                              else aoSelecionar?.(item)
                            }}
                            className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors ${
                              selecionados.has(idx) ? 'bg-[#7C3AED]/8' : 'hover:bg-[var(--surface-sunken)]'
                            }`}
                          >
                            {modoSelecao === 'checkbox' && (
                              <div className={`w-4 h-4 rounded-[3px] border flex-shrink-0 flex items-center justify-center ${
                                selecionados.has(idx) ? 'bg-[#7C3AED] border-[#7C3AED] text-white' : 'border-[var(--border-strong)]'
                              }`}>
                                {selecionados.has(idx) && <Check size={10} strokeWidth={3} />}
                              </div>
                            )}
                            {colunas.map(col => (
                              <span key={col.chave} className={`flex-1 ${col.formatar ? 'font-num text-right' : 'text-[var(--text-primary)]'}`}>
                                {col.formatar ? col.formatar(item[col.chave]) : item[col.chave] || '—'}
                              </span>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {conectado && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  {sucesso && <span className="text-xs text-[#15803D] flex items-center gap-1"><Check size={12} /> Importado com sucesso!</span>}
                  {erro && <span className="text-xs text-[#B91C1C] flex items-center gap-1"><AlertTriangle size={12} /> {erro}</span>}
                </div>
                {modoSelecao === 'checkbox' && (
                  <button
                    onClick={handleImportar}
                    disabled={selecionados.size === 0 || importando}
                    className="h-[32px] px-4 rounded-[4px] bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-[#A8A29E] disabled:cursor-not-allowed text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    {importando ? <Loader size={12} className="animate-spin" /> : <Download size={12} />}
                    Importar {selecionados.size} registro(s)
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
