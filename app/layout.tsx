// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { SidebarProvider } from './components/providers/sidebar-provider'
import { Sidebar } from './components/navigation/Sidebar'
import { Header } from './components/navigation/Header'

export const metadata: Metadata = {
  title: 'Stock Market Dashboard',
  description: 'Advanced stock analysis platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  )
}