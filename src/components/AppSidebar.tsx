'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, Clock, FileText, Users, Settings, Sun, Moon, CreditCard } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const itensMenu = [
  { href: '/simulacao', label: 'Nova Simulação', icon: Calculator },
  { href: '/historico', label: 'Histórico', icon: Clock },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/motoristas', label: 'Motoristas', icon: Users },
  { href: '/pagamentos', label: 'Pagamentos', icon: CreditCard },
]

const itensInferiores = [
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  function isActive(href: string) {
    if (href === '/simulacao') return pathname === '/simulacao' || pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-full bg-[#0F1C2E] select-none">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#1A2E45]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[5px] bg-gradient-to-br from-[#F97316] to-[#C2590A] flex items-center justify-center shadow-sm shadow-[#F97316]/20">
            <span className="text-white font-bold text-xs">HR</span>
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight block leading-tight">HR CARGO</span>
            <p className="text-[10px] text-slate-500 tracking-wide">João Pessoa / PB</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col justify-between py-4">
        <div className="space-y-0.5 px-3">
          {itensMenu.map((item) => {
            const Icon = item.icon
            const ativo = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 text-sm rounded-[4px] transition-all duration-100 relative
                  ${ativo
                    ? 'text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-[#1A2E45]'
                  }
                `}
                style={ativo ? { background: 'linear-gradient(90deg, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.02) 100%)' } : {}}
              >
                {ativo && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#F97316]" />
                )}
                <Icon size={17} strokeWidth={ativo ? 2 : 1.5} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="space-y-0.5 px-3">
          <div className="h-px bg-[#1A2E45] mx-4 my-2" />

          {itensInferiores.map((item) => {
            const Icon = item.icon
            const ativo = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 text-sm rounded-[4px] transition-all duration-100 relative
                  ${ativo
                    ? 'text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-[#1A2E45]'
                  }
                `}
                style={ativo ? { background: 'linear-gradient(90deg, rgba(249,115,22,0.08) 0%, rgba(249,115,22,0.02) 100%)' } : {}}
              >
                {ativo && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#F97316]" />
                )}
                <Icon size={17} strokeWidth={ativo ? 2 : 1.5} />
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="h-px bg-[#1A2E45] mx-4 my-2" />
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-full py-2.5 text-slate-400 hover:text-white hover:bg-[#1A2E45] rounded-[4px] transition-all duration-100"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>
    </aside>
  )
}
