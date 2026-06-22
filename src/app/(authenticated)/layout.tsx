import AppSidebar from '@/components/AppSidebar'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 overflow-y-auto p-8 bg-background text-foreground">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
