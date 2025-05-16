'use client'

import { useState, useEffect } from 'react'
import { saveAs } from 'file-saver'
import Papa from 'papaparse'
import dynamic from 'next/dynamic'
import AsyncSelect from 'react-select/async'

const LineChart = dynamic(
  () => import('../components/LineChart'),
  { ssr: false }
)

const formatDateTime = (timestamp: number) => {
  if (!timestamp) return "Invalid Date";
  const date = new Date(timestamp * 1000);
  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZoneName: "short",
  };
  return date.toLocaleString("en-US", options);
};

export default function DataDownloader() {
  const [symbol, setSymbol] = useState('reliance.ns')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [interval, setInterval] = useState('1d')
  const [data, setData] = useState<any[] | null>(null)
  const [companyInfo, setCompanyInfo] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const today = new Date()
    const fifteenDaysAgo = new Date()
    fifteenDaysAgo.setDate(today.getDate() - 15)
    setStartDate(fifteenDaysAgo.toISOString().split('T')[0])
    setEndDate(today.toISOString().split('T')[0])
  }, [])

  const fetchStockSuggestions = async (inputValue: string) => {
    if (!inputValue) return []
    try {
      const response = await fetch(`/api/search?query=${inputValue}`)
      const data = await response.json()
      return data.map((stock: any) => ({
        label: `${stock.shortname} (${stock.symbol})`,
        value: stock.symbol,
      }))
    } catch (error) {
      console.error('Error fetching stock suggestions:', error)
      return []
    }
  }

  const handleSymbolChange = (selectedOption: any) => {
    setSymbol(selectedOption ? selectedOption.value : "")
  }

  const fetchData = async () => {
    setLoading(true)
    setCompanyInfo(null)
    setData(null)
    try {
      const [stockRes, companyRes] = await Promise.all([
        fetch(`/api/historicalData?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}&interval=${interval}`),
        fetch(`/api/companyInfo?symbol=${symbol}`)
      ])

      if (!stockRes.ok) throw new Error('Failed to fetch stock data')
      if (!companyRes.ok) throw new Error('Failed to fetch company info')

      const stockData = await stockRes.json()
      const companyData = await companyRes.json()

      const historicalData = stockData.historicalData.quotes.map((item: any) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      }));

      const companyProfile = companyData.companyProfile || {}
      const quoteData = stockData.quoteData || {}
      const marketDayRange = quoteData.regularMarketDayRange || "N/A"
      const fiftyTwoWeekRange = quoteData.fiftyTwoWeekRange || "N/A"

      setData(historicalData)
      setCompanyInfo({
        name: quoteData.shortName || "N/A",
        type: quoteData.typeDisp || "N/A",
        industry: companyProfile.industry || "N/A",
        country: companyProfile.country || "N/A",
        currency: quoteData.currency || "N/A",
        regularMarketPrice: quoteData.regularMarketPrice || 0,
        regularMarketChange: quoteData.regularMarketChange || 0,
        regularMarketChangePercent: quoteData.regularMarketChangePercent || 0,
        marketTime: formatDateTime(quoteData.regularMarketTime),
        afterHoursPrice: quoteData.postMarketPrice || 0,
        afterHoursChange: quoteData.postMarketChange || 0,
        afterHoursChangePercent: quoteData.postMarketChangePercent || 0,
        afterHoursTime: formatDateTime(quoteData.postMarketTime),
        marketDayRange: marketDayRange,
        fiftyTwoWeekRange: fiftyTwoWeekRange,
        marketCap: quoteData.marketCap || 0,
        volume: quoteData.regularMarketVolume || 0,
      })
      setError("")
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const downloadData = () => {
    if (!data) return
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, `${symbol}_historical_data_${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div className="max-w-7xl mx-auto p-4 min-h-screen">
      {!symbol && !startDate && !endDate && (
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-6">
            Explore Stock Market Insights
          </h1>
          <p className="text-xl">
            Start by entering a stock symbol, selecting a date range, and
            choosing an interval to see detailed stock data.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <label className="block font-bold mb-2">Stock Symbol:</label>
          <AsyncSelect
            className="w-full"
            cacheOptions
            loadOptions={fetchStockSuggestions}
            onChange={handleSymbolChange}
            placeholder="Search for a stock..."
            isClearable
          />
        </div>
        
        <div className="flex-grow">
          <label className="block font-bold mb-2">Start Date:</label>
          <input
            className="w-full p-2 border rounded"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>

        <div className="flex-grow">
          <label className="block font-bold mb-2">End Date:</label>
          <input
            className="w-full p-2 border rounded"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        <div className="flex-grow">
          <label className="block font-bold mb-2">Interval:</label>
          <select
            className="w-full p-2 border rounded"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            required
          >
            <option value="1d">Daily</option>
            <option value="1wk">Weekly</option>
            <option value="1mo">Monthly</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            className={`p-2 px-4 ${loading ? 'bg-gray-400' : 'bg-blue-500'} text-white rounded h-[42px]`}
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? 'Fetching...' : 'Get Data'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="ml-2">Loading data...</p>
        </div>
      )}

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {companyInfo && (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">{companyInfo.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p><strong>Type:</strong> {companyInfo.type}</p>
              <p><strong>Industry:</strong> {companyInfo.industry}</p>
            </div>
            <div>
              <p><strong>Country:</strong> {companyInfo.country}</p>
              <p><strong>Currency:</strong> {companyInfo.currency}</p>
            </div>
            <div>
              <p><strong>Price:</strong> {companyInfo.regularMarketPrice?.toFixed(2)}</p>
              <p><strong>Change:</strong> {companyInfo.regularMarketChange?.toFixed(2)}</p>
            </div>
            <div>
              <p><strong>Market Cap:</strong> {companyInfo.marketCap?.toLocaleString()}</p>
              <p><strong>Volume:</strong> {companyInfo.volume?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Stock Price Chart</h2>
          <div className="h-[400px] w-full bg-white p-4 rounded-lg shadow">
            <LineChart data={data} symbol={symbol} />
          </div>
        </div>
      )}

      {data && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Historical Prices</h3>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={downloadData}
            >
              Download CSV
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Open</th>
                  <th className="p-2 border">High</th>
                  <th className="p-2 border">Low</th>
                  <th className="p-2 border">Close</th>
                  <th className="p-2 border">Volume</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-2 border">{item.date}</td>
                    <td className="p-2 border">{item.open?.toFixed(2)}</td>
                    <td className="p-2 border">{item.high?.toFixed(2)}</td>
                    <td className="p-2 border">{item.low?.toFixed(2)}</td>
                    <td className="p-2 border">{item.close?.toFixed(2)}</td>
                    <td className="p-2 border">{item.volume?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}