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
    <Sidebar collapsible="none" className="border-r border-sidebar-border">
      <SidebarHeader className="px-6 py-5 border-b border-sidebar-border">
        <h1 className="font-bold tracking-tight text-base">Simulador de Frete</h1>
        <p className="text-xs text-sidebar-foreground/60">João Pessoa / PB</p>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {itensMenu.map((item) => {
                const Icon = item.icon
                const ativo = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={ativo}
                      render={<Link href={item.href} />}
                      className={ativo ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : ''}
                    >
                      <Icon />
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
        <SidebarMenuButton onClick={toggleTheme} className="w-full justify-start">
          {theme === 'dark' ? <Sun /> : <Moon />}
          <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}
