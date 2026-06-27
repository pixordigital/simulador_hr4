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
        <main className="flex-1 text-text-primary relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--surface-base) 0%, var(--surface-raised) 50%, color-mix(in srgb, var(--brand-orange) 2%, var(--surface-base)) 100%)' }}
        >
          {/* Subtle decorative blur elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.03] pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--brand-orange), transparent 70%)' }}
          />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.02] pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--brand-orange), transparent 70%)' }}
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
