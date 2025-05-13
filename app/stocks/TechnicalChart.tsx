'use client'

import dynamic from 'next/dynamic'
import React, { useEffect, useState } from 'react'
import { ApexOptions } from 'apexcharts'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const ReactApexChart = dynamic(() => import('react-apexcharts'), { 
  ssr: false,
  loading: () => <Skeleton height={350} />
})

type CandlestickData = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface StockInfo {
  name: string
  type: string
  market: string
  exchange: string
}

interface SummaryInfo {
  [key: string]: string
}

interface ApiResponse {
  candlestickData: CandlestickData[]
  stockInfo: StockInfo
  summary: SummaryInfo
}

interface TechnicalChartProps {
  symbol: string
}

const TechnicalChart: React.FC<TechnicalChartProps> = ({ symbol }) => {
  const [candlestickData, setCandlestickData] = useState<CandlestickData[]>([])
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null)
  const [summary, setSummary] = useState<SummaryInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/stock-data?symbol=${symbol}`)
        if (!response.ok) throw new Error('Failed to fetch data')
        
        const data: ApiResponse = await response.json()

        if (data?.candlestickData) {
          const processedData = data.candlestickData.map(item => ({
            time: item.time,
            open: Number(item.open?.toFixed(2)) || 0,
            high: Number(item.high?.toFixed(2)) || 0,
            low: Number(item.low?.toFixed(2)) || 0,
            close: Number(item.close?.toFixed(2)) || 0,
            volume: Number(item.volume) || 0
          }))
          
          setCandlestickData(processedData)
          setStockInfo(data.stockInfo)
          setSummary(data.summary)
          setError(null)
        } else {
          throw new Error('No candlestick data found')
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStockData()
  }, [symbol])

  const formatNumber = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)

  const chartData: ApexOptions = {
    series: [{
      data: candlestickData.map(data => ({
        x: new Date(data.time * 1000),
        y: [
          data.open || 0,
          data.high || 0,
          data.low || 0,
          data.close || 0
        ].map(v => Number(v.toFixed(2)))
      })),
    }],
    chart: {
      type: 'candlestick',
      height: 500,
      width: '100%',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      zoom: {
        enabled: true
      }
    },
    title: {
      text: `${stockInfo?.name || symbol} Price Chart`,
      align: 'center',
      style: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#1f2937'
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#6b7280'
        }
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        formatter: (val: number) => val?.toFixed(2) || '0.00',
        style: {
          colors: '#6b7280'
        }
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#22c55e',
          downward: '#ef4444'
        },
        wick: {
          useFillColor: true
        }
      }
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 5,
    },
    tooltip: {
      enabled: true,
      x: {
        formatter: (val) => new Date(val).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      },
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
      }
    },
    responsive: [{
      breakpoint: 768,
      options: {
        chart: {
          height: 400
        }
      }
    }]
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-xl">
        <p className="text-red-600 font-medium">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 bg-gray-50 space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
          {stockInfo?.name || symbol}
          {stockInfo?.exchange && (
            <span className="ml-2 text-gray-600 text-base lg:text-lg">
              ({stockInfo.exchange})
            </span>
          )}
        </h1>
        {stockInfo && (
          <div className="flex gap-2 text-sm text-gray-500">
            <span>{stockInfo.type}</span>
            <span>•</span>
            <span>{stockInfo.market}</span>
          </div>
        )}
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Company Information */}
        {stockInfo && (
          <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-base lg:text-lg font-semibold mb-2 lg:mb-3">Company Details</h3>
            <div className="space-y-1 lg:space-y-2 text-sm">
              <p><span className="font-medium">Name:</span> {stockInfo.name}</p>
              <p><span className="font-medium">Type:</span> {stockInfo.type}</p>
              <p><span className="font-medium">Market:</span> {stockInfo.market}</p>
              <p><span className="font-medium">Exchange:</span> {stockInfo.exchange}</p>
            </div>
          </div>
        )}

        {/* Chart Container */}
        <div className="lg:col-span-2 bg-white p-2 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
          {isLoading ? (
            <Skeleton height={500} />
          ) : (
            <ReactApexChart
              options={chartData}
              series={chartData.series}
              type="candlestick"
              height={500}
              width={'100%'}
            />
          )}
        </div>
      </div>

      {/* Summary Information */}
      {summary && (
        <div className="bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-base lg:text-lg font-semibold mb-2 lg:mb-3">Market Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 text-sm">
            {Object.entries(summary).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span className="font-medium text-gray-900">
                  {value || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price History Table */}
      {candlestickData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-3 lg:p-4 border-b">
            <h3 className="text-base lg:text-lg font-semibold">Recent Price History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  {['Date', 'Open', 'High', 'Low', 'Close', 'Volume'].map((header) => (
                    <th key={header} className="px-3 lg:px-4 py-2 lg:py-3 text-left text-sm font-medium text-gray-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candlestickData.slice(-60).reverse().map((row, idx) => (
                  <tr key={idx} className="border-t hover:bg-gray-50">
                    <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm">
                      {new Date(row.time * 1000).toLocaleDateString()}
                    </td>
                    <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm">{formatNumber(row.open)}</td>
                    <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm">{formatNumber(row.high)}</td>
                    <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm">{formatNumber(row.low)}</td>
                    <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm font-medium">{formatNumber(row.close)}</td>
                    <td className="px-3 lg:px-4 py-2 lg:py-3 text-sm">
                      {row.volume?.toLocaleString() ?? 'N/A'}
                    </td>
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

export default TechnicalChart