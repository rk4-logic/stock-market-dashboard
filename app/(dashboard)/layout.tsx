// app/(dashboard)/layout.tsx
import { SidebarProvider } from '../components/providers/sidebar-provider'
import { Sidebar } from '../components/navigation/Sidebar'
import { Header } from '../components/navigation/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}