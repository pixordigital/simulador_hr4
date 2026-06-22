'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, Clock, FileText, Users, Settings, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const itensMenu = [
  { href: '/simulacao', label: 'Nova Simulação', icon: Calculator },
  { href: '/historico', label: 'Histórico', icon: Clock },
  { href: '/templates', label: 'Templates', icon: FileText },
  { href: '/motoristas', label: 'Motoristas', icon: Users },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  return (
    <Sidebar collapsible="none" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            SF
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-sm">Simulador de Frete</h1>
            <p className="text-[11px] text-sidebar-foreground/50">João Pessoa / PB</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5 px-2">
              {itensMenu.map((item) => {
                const Icon = item.icon
                const ativo = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={ativo}
                      render={<Link href={item.href} />}
                      className={`
                        rounded-lg transition-all duration-150
                        ${ativo
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm border-l-2 border-l-blue-500'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                        }
                      `}
                      size="lg"
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenuButton
          onClick={toggleTheme}
          className="w-full justify-start rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-150"
          size="lg"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
