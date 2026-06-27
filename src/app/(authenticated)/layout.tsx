import AppSidebar from '@/components/AppSidebar'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Toast from '@/components/Toast'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 bg-surface-base text-text-primary">
          <div className="max-w-6xl mx-auto p-4 h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
      <Toast />
    </ThemeProvider>
  )
}
