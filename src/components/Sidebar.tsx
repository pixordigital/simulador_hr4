'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calculator,
  Clock,
  FileText,
  Users,
  Settings,
  Sun,
  Moon,
} from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

const itensMenu = [
  { href: '/simulacao', label: 'Nova Simulação', icon: Calculator, destaque: true },
  { href: '/historico', label: 'Histórico', icon: Clock },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/motoristas', label: 'Motoristas', icon: Users },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <aside className="w-64 h-screen bg-[rgb(var(--sidebar))] text-[rgb(var(--sidebar-foreground))] flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-lg font-bold tracking-tight">Simulador de Frete</h1>
        <p className="text-xs text-slate-400 mt-1">João Pessoa / PB</p>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-3">
        {itensMenu.map((item) => {
          const Icon = item.icon
          const ativo = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                ativo
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-300 hover:bg-[rgb(var(--sidebar-hover))] hover:text-white'
              } ${item.destaque ? 'mt-1' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-slate-700 space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-[rgb(var(--sidebar-hover))] hover:text-white w-full transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
        </button>
      </div>
    </aside>
  )
}
