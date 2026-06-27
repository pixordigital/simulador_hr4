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
          style={{ background: 'linear-gradient(160deg, #D4CFC6 0%, #E8E5DF 30%, #F5F3EF 60%, #EDE9E3 100%)' }}
        >
          {/* Decorative glass blobs */}
          <div className="absolute top-0 -right-16 w-[420px] h-[420px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle at 40% 40%, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.04) 50%, transparent 70%)', filter: 'blur(40px)' }}
          />
          <div className="absolute -bottom-24 -left-16 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle at 60% 60%, rgba(249,115,22,0.10) 0%, rgba(249,115,22,0.03) 40%, transparent 65%)', filter: 'blur(50px)' }}
          />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 60%)', filter: 'blur(40px)' }}
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
