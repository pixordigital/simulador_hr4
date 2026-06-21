'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, Clock, FileText, Users, Settings, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/button'

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
    <aside className="w-64 h-screen bg-sidebar text-sidebar-foreground flex flex-col shrink-0 border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-lg font-bold tracking-tight">Simulador de Frete</h1>
        <p className="text-xs text-muted-foreground mt-1">João Pessoa / PB</p>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-3">
        {itensMenu.map((item) => {
          const Icon = item.icon
          const ativo = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={ativo ? 'secondary' : 'ghost'}
                className={`w-full justify-start gap-3 ${ativo ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
              >
                <Icon size={18} />
                {item.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </Button>
      </div>
    </aside>
  )
}
