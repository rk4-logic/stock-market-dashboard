// src/components/navigation/header.tsx
'use client'

import { useState } from 'react'
import { useSidebar } from '../providers/sidebar-provider'
import { Search, Menu } from 'lucide-react' // Or any search icon you prefer
import { useRouter } from 'next/navigation'

export function Header() {
  const router = useRouter() // Initialize router
  const { toggle } = useSidebar()
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Array<{ symbol: string, shortname: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    if (query.length > 1) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
        if (!response.ok) throw new Error('Search failed')
        const results = await response.json()
        setSuggestions(results)
      } catch (error) {
        console.error('Search error:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    } else {
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (symbol: string) => {
    // Navigate to the stock page instead of using callback
    router.push(`/stocks/${symbol}`)
    setSearchQuery('')
    setSuggestions([])
  }

  return (
    <header className="bg-gray-800 text-white p-4 flex items-center justify-between shadow-md">
      {/* Mobile Menu Button */}
      <button
        onClick={toggle}
        className="md:hidden p-2 rounded-md hover:bg-gray-700"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="text-xl font-semibold hidden md:block">Stock Market Dashboard</h1>

      <div className="relative w-full md:w-1/3 ml-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search stocks..."
            className="w-full p-2 pl-10 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleInputChange}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.symbol}
                onClick={() => handleSuggestionClick(suggestion.symbol)}
                className="p-2 hover:bg-gray-600 cursor-pointer flex justify-between"
              >
                <span className="font-medium">{suggestion.symbol}</span>
                <span className="text-gray-300 text-sm">{suggestion.shortname}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  )
}