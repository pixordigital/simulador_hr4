import Sidebar from '@/components/Sidebar'
import { ThemeProvider } from '@/contexts/ThemeContext'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-8 bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}
