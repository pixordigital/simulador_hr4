import AppSidebar from '@/components/AppSidebar'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/sonner'

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main
          className="flex-1 text-text-primary relative overflow-hidden"
          style={{ background: 'var(--bg-gradient)' }}
        >
          {/* Decorative glass blobs */}
          <div
            className="absolute top-0 -right-16 w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{ background: 'var(--blob-orange-1)', filter: 'blur(40px)' }}
          />
          <div
            className="absolute -bottom-24 -left-16 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: 'var(--blob-orange-2)', filter: 'blur(50px)' }}
          />
          <div
            className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{ background: 'var(--blob-blue)', filter: 'blur(40px)' }}
          />
          <div className="relative z-0 max-w-6xl mx-auto p-4 h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster richColors closeButton position="bottom-right" />
    </ThemeProvider>
  )
}
