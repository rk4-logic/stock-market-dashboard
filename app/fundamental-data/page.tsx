// app/fundamentals/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'

const defaultSymbol = 'RELIANCE.NS'
const defaultCompanyName = 'Reliance Industries Limited'

const FundamentalData = () => {
  const [query, setQuery] = useState('')
  const [symbol, setSymbol] = useState(defaultSymbol)
  const [companyName, setCompanyName] = useState(defaultCompanyName)
  const [searchResults, setSearchResults] = useState([])
  const [frequency, setFrequency] = useState('quarterly')
  const [module, setModule] = useState('all')
  const [period1, setPeriod1] = useState(
    new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split('T')[0]
  )
  const [period2, setPeriod2] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [fundamentals, setFundamentals] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchFundamentals = async (customSymbol?: string) => {
    const activeSymbol = customSymbol || symbol

    if (!activeSymbol || !period1 || !period2) {
      setError('Please select a symbol and both dates.')
      return
    }

    setLoading(true)

    try {
      const response = await axios.get('/api/fundamentals', {
        params: {
          symbol: activeSymbol,
          period1,
          period2,
          type: frequency,
          module,
        },
      })
      const sortedData = response.data.reverse()
      setFundamentals(sortedData)
      setError('')
    } catch (error) {
      console.error('Error fetching fundamentals:', error)
      setError('No data found for your given request')
    } finally {
      setLoading(false)
    }
  }

  const searchStocks = async (query: string) => {
    try {
      const response = await axios.get('/api/search', {
        params: { query },
      })
      setSearchResults(response.data)
    } catch (error) {
      console.error('Error searching stocks:', error)
      setError('Could not fetch search results.')
    }
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    setQuery(input)
    if (input.length >= 3) {
      searchStocks(input)
    } else {
      setSearchResults([])
    }
  }

  const handleSymbolSelect = (selectedSymbol: string, selectedName?: string) => {
    setSymbol(selectedSymbol)
    setCompanyName(selectedName || 'Unknown Company')
    setQuery(selectedName || selectedSymbol)
    setSearchResults([])
  }

  const processFundamentals = () => {
    if (fundamentals.length === 0) return { rows: [], columns: [] }

    const headers = Array.from(
      new Set(fundamentals.flatMap((entry: any) => Object.keys(entry)))
    )

    const columns = fundamentals.map((entry: any) =>
      headers.map((header) => entry[header] || '--')
    )

    return { rows: headers, columns }
  }

  const downloadCSV = () => {
    const { rows, columns } = processFundamentals()
    if (!rows.length || !columns.length) return

    const today = new Date().toISOString().split('T')[0]

    const csvContent = [
      ['Attribute', ...columns.map((_, i) => `Period ${i + 1}`)],
      ...rows.map((row, i) => [row, ...columns.map((col) => col[i] || 'N/A')]),
    ]
      .map((line) => line.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `${symbol}_fundamental_data_${today}.csv`
    a.click()

    URL.revokeObjectURL(url)
  }

  const { rows, columns } = processFundamentals()

  useEffect(() => {
    fetchFundamentals(defaultSymbol)
  }, [])

  return (
    <div className="p-4 min-h-screen">
      <h1 className="text-4xl text-center font-bold mb-5">
        Ticker Fundamental Data
      </h1>
      <section className="text-center mb-6">
        <h2 className="text-xl font-bold">Explore Comprehensive Fundamental Data</h2>
        <p>Access valuation, financials, ratios and more. Search or explore NIFTY companies.</p>
      </section>

      <section className="p-4">
        <div className="mb-4 flex flex-col md:flex-row items-start">
          <label className="font-semibold">Search Company:</label>
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            className="border p-2 rounded ml-2 w-80"
            placeholder="Enter company name..."
          />
        </div>
        <ul className="border mt-1 max-h-40 overflow-y-auto bg-white shadow-lg rounded">
          {searchResults?.map((result: any, index: number) => (
            <li
              key={index}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleSymbolSelect(result.symbol, result.shortname)}
            >
              {result.shortname || 'Unnamed Company'} ({result.symbol})
            </li>
          ))}
        </ul>

        <div className="my-4 flex gap-4 flex-wrap">
          <div>
            <label className="font-semibold">Frequency:</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="border p-2 rounded ml-2"
            >
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
              <option value="trailing">Trailing</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Module:</label>
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              className="border p-2 rounded ml-2"
            >
              <option value="all">All</option>
              <option value="financials">Financials</option>
              <option value="balance-sheet">Balance Sheet</option>
              <option value="cash-flow">Cash Flow</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Start Date:</label>
            <input
              type="date"
              value={period1}
              onChange={(e) => setPeriod1(e.target.value)}
              className="border p-2 rounded ml-2"
            />
          </div>
          <div>
            <label className="font-semibold">End Date:</label>
            <input
              type="date"
              value={period2}
              onChange={(e) => setPeriod2(e.target.value)}
              className="border p-2 rounded ml-2"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4 flex-wrap">
          <button
            onClick={() => fetchFundamentals()}
            className={`${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-bold py-2 px-4 rounded`}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Get Fundamental Data'}
          </button>

          {fundamentals.length > 0 && (
            <button
              onClick={downloadCSV}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Download CSV
            </button>
          )}
        </div>

        {error && <p className="text-red-600 mt-4">{error}</p>}
      </section>

      <div className="text-center my-4">
        <h2 className="text-2xl font-semibold">
          {companyName} ({symbol})
        </h2>
      </div>

      {rows.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="p-2 border">Attribute</th>
                {columns.map((_, colIndex) => (
                  <th key={colIndex} className="p-2 border">{`Period ${colIndex + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t">
                  <td className="p-2 border font-semibold">{row}</td>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="p-2 border text-center">
                      {col[rowIndex] || 'N/A'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default FundamentalData
