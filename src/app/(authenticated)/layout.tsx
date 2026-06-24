import AppSidebar from '@/components/AppSidebar'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto bg-surface-base text-text-primary">
          <div className="max-w-6xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  )
}
