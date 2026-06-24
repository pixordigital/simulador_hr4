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
      <div className="px-5 py-5 border-b border-[#1A2E45]">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-sm tracking-tight">HR CARGO</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">João Pessoa / PB</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col justify-between py-3">
        <div className="space-y-0.5 px-3">
          {itensMenu.map((item) => {
            const Icon = item.icon
            const ativo = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 text-sm rounded-[4px] transition-colors duration-100
                  ${ativo
                    ? 'bg-[#1A2E45] text-white border-l-[3px] border-l-[#F97316] pl-[13px]'
                    : 'text-slate-400 hover:text-white hover:bg-[#1A2E45]'
                  }
                `}
              >
                <Icon size={17} strokeWidth={1.5} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="space-y-0.5 px-3">
          {/* Separator */}
          <div className="h-px bg-[#1A2E45] mx-4 my-2" />

          {itensInferiores.map((item) => {
            const Icon = item.icon
            const ativo = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 text-sm rounded-[4px] transition-colors duration-100
                  ${ativo
                    ? 'bg-[#1A2E45] text-white border-l-[3px] border-l-[#F97316] pl-[13px]'
                    : 'text-slate-400 hover:text-white hover:bg-[#1A2E45]'
                  }
                `}
              >
                <Icon size={17} strokeWidth={1.5} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* Theme toggle — icon only */}
          <div className="h-px bg-[#1A2E45] mx-4 my-2" />
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-full py-2.5 text-slate-400 hover:text-white hover:bg-[#1A2E45] rounded-[4px] transition-colors duration-100"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={17} strokeWidth={1.5} /> : <Moon size={17} strokeWidth={1.5} />}
          </button>
        </div>
      </nav>
    </aside>
  )
}
