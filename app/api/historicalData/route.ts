import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol') || 'RELIANCE.NS'
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const interval = (searchParams.get('interval') as
      | "1mo" | "3mo"
      | undefined) || '1d'
    const historicalData = await yahooFinance.chart(symbol, {
      period1: startDate as string,
      period2: endDate as string,
      interval,
      includePrePost: true,
      events: 'div|split|earn'
    })

    return NextResponse.json({ historicalData })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    )
  }
}