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
    <aside className="w-60 flex-shrink-0 flex flex-col h-full bg-[var(--sidebar)] select-none border-r border-[var(--sidebar-border)]/40">
      {/* Logo + Toggle */}
      <div className="px-4 py-3.5 border-b border-[var(--sidebar-border)]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-gradient-to-br from-[var(--brand-orange)] to-[var(--brand-orange-dim)] flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-[11px] leading-none">HR</span>
            </div>
            <div>
              <span className="text-white font-bold text-xs tracking-tight block leading-tight">HR CARGO</span>
              <p className="text-[9px] text-[var(--sidebar-foreground)]/60 tracking-wide">João Pessoa / PB</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="w-7 h-7 flex items-center justify-center rounded-[4px] text-[var(--sidebar-foreground)]/50 hover:text-white hover:bg-[var(--sidebar-accent)] transition-all duration-150"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          >
            {theme === 'dark' ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col py-3">
        <div className="flex-1 space-y-0.5 px-2.5">
          {itensMenu.map((item) => {
            const Icon = item.icon
            const ativo = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 text-sm rounded-[6px] transition-all duration-150 relative group
                  ${ativo
                    ? 'text-white font-medium bg-gradient-to-r from-[var(--sidebar-accent)]/60 to-transparent'
                    : 'text-[var(--sidebar-foreground)] hover:text-white hover:bg-[var(--sidebar-accent)]/60'
                  }
                `}
              >
                {ativo && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[var(--brand-orange)] shadow-[0_0_8px_var(--brand-orange-glow)]" />
                )}
                <Icon size={17} strokeWidth={ativo ? 2 : 1.5} className={ativo ? 'text-[var(--brand-orange)] drop-shadow-[0_0_4px_var(--brand-orange-glow)]' : 'group-hover:text-[var(--brand-orange)] transition-colors duration-150'} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="px-4">
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--sidebar-border)]/40 to-transparent my-1" />
        </div>
      </nav>
    </aside>
  )
}
