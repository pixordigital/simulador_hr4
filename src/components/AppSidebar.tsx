'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, Clock, FileText, Users, Settings, Sun, Moon, CreditCard, UserPlus } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const itensMenu = [
  { href: '/simulacao', label: 'Nova Simulação', icon: Calculator },
  { href: '/historico', label: 'Histórico', icon: Clock },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/clientes', label: 'Clientes', icon: UserPlus },
  { href: '/motoristas', label: 'Motoristas', icon: Users },
  { href: '/pagamentos', label: 'Pagamentos', icon: CreditCard },
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
      {/* Logo + Toggle */}
      <div className="px-4 py-3 border-b border-[#1A2E45]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[4px] bg-gradient-to-br from-[#F97316] to-[#C2590A] flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">HR</span>
            </div>
            <div>
              <span className="text-white font-bold text-xs tracking-tight block leading-tight">HR CARGO</span>
              <p className="text-[9px] text-slate-500 tracking-wide">João Pessoa / PB</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="w-7 h-7 flex items-center justify-center rounded-[3px] text-slate-500 hover:text-white hover:bg-[#1A2E45] transition-all duration-100"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col py-2">
        <div className="flex-1 space-y-0.5 px-2">
          {itensMenu.map((item) => {
            const Icon = item.icon
            const ativo = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-1.5 text-sm rounded-[4px] transition-all duration-100 relative
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

        <div className="px-2">
          <div className="h-px bg-[#1A2E45] mx-4 my-1.5" />
        </div>
      </nav>
    </aside>
  )
}
