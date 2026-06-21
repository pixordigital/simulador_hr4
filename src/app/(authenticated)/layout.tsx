import Sidebar from '@/components/Sidebar'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { TooltipProvider } from '@/components/ui/tooltip'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8 bg-background text-foreground">
            {children}
          </main>
        </div>
      </TooltipProvider>
    </ThemeProvider>
  )
}
