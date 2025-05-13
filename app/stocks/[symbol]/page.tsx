'use client'

import { useParams } from 'next/navigation'
import { ErrorBoundary } from 'react-error-boundary'
import TechnicalChart from '../TechnicalChart'

function ChartErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 bg-red-100 text-red-800 rounded">
      Chart Error: {error.message}
    </div>
  )
}

export default function StockPage() {
  const params = useParams()
  const symbol = params.symbol as string  // ⬅️ get it from params

  if (!symbol) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <ErrorBoundary FallbackComponent={ChartErrorFallback}>
        <TechnicalChart symbol={symbol} />
      </ErrorBoundary>
    </div>
  )
}
