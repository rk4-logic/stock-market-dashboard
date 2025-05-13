// src/components/navigation/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, Menu, LineChart, Copy, Eye, TrendingUp, Activity, BarChart2, CandlestickChart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSidebar } from '../providers/sidebar-provider'

const menuItems = [
  { name: "Dashboard", id: "/", icon: <LineChart className="h-5 w-5" /> },
  { name: "Bhav Copy", id: "bhavcopy", icon: <Copy className="h-5 w-5" /> },
  { name: "Market Overview", id: "market-overview", icon: <Eye className="h-5 w-5" /> },
  { name: "Top Gainers/Losers", id: "gainers-losers", icon: <TrendingUp className="h-5 w-5" /> },
  { name: "Technical Analysis", id: "technical-analysis", icon: <Activity className="h-5 w-5" /> },
  { name: "Participant Wise OI", id: "participantwise-oi", icon: <BarChart2 className="h-5 w-5" /> },
  { name: "Option Chain", id: "option-chain", icon: <CandlestickChart className="h-5 w-5" /> }
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()
  const [isMobile, setIsMobile] = useState(false)

  // Check mobile viewport on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      toggle()
    }
  }, [pathname, isMobile])

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggle}
        className="fixed z-40 p-2 m-2 rounded-md bg-gray-800 text-white md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-50 h-screen bg-gray-800 text-white transition-all duration-300 ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Close Button (Mobile) */}
          {isOpen && (
            <button
              onClick={toggle}
              className="absolute top-4 right-4 p-1 md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          )}

          {/* Logo/Title */}
          <div className="px-4 py-8 text-left border-b border-gray-700 flex items-center justify-center md:justify-start">
            <h1 className={`text-2xl font-bold ${!isOpen && 'hidden md:block md:text-center'}`}>
              {isOpen ? 'Stock Market Dashboard' : 'SD'}
            </h1>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1 p-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/${item.id}`}
                    className={`flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition-colors ${
                      pathname?.includes(item.id) ? 'bg-gray-700' : ''
                    } ${!isOpen && 'justify-center'}`}
                  >
                    <span className={`${!isOpen && 'mx-auto'}`}>
                      {item.icon}
                    </span>
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Collapse Button (Desktop) */}
          {!isMobile && (
            <button
              onClick={toggle}
              className="p-3 text-gray-400 hover:text-white flex items-center justify-center border-t border-gray-700"
              aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isOpen ? (
                <span className="flex items-center gap-2">
                  <X className="h-5 w-5" />
                  <span>Collapse</span>
                </span>
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={toggle}
        />
      )}
    </>
  )
}