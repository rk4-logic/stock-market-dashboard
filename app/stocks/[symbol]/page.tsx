'use client'

import { useParams } from 'next/navigation'
import TechnicalChart from '../TechnicalChart'

export default function StockPage() {
  const params = useParams()
  const symbol = params.symbol as string  // ⬅️ get it from params

  if (!symbol) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">      
        <TechnicalChart symbol={symbol} />
    </div>
  )
}
