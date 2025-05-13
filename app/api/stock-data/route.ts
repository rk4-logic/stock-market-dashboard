import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

export const dynamic = 'force-dynamic'

// Define allowed intervals
const allowedIntervals = [
  '1d', '1m', '2m', '5m', '15m', '30m', '60m', '90m',
  '1h', '5d', '1wk', '1mo', '3mo'
] as const;

type Interval = typeof allowedIntervals[number];

interface Quote {
  date: Date;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
}

interface ErrorResponse {
  error: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol')
  const intervalParam = searchParams.get('interval') || '1d'

  if (!symbol) {
    return NextResponse.json<ErrorResponse>({ error: 'Missing symbol parameter' }, { status: 400 })
  }

  // Validate interval
  const interval = allowedIntervals.includes(intervalParam as Interval)
    ? (intervalParam as Interval)
    : '1d'

  try {
    const today = new Date()
    const fourYearsAgo = new Date()
    fourYearsAgo.setFullYear(today.getFullYear() - 4)

    const chartResult = await yahooFinance.chart(symbol, {
      interval,
      period1: fourYearsAgo.toISOString(),
      period2: today.toISOString(),
    })

    if (!chartResult?.quotes || chartResult.quotes.length === 0) {
      return NextResponse.json<ErrorResponse>({ error: 'No stock data found' }, { status: 404 })
    }

    // Type the q parameter properly
    const candlestickData = chartResult.quotes.map((q) => ({
      time: Math.floor(q.date.getTime() / 1000), // lightweight-charts expects UNIX timestamp
      open: q.open ?? 0,
      high: q.high ?? 0,
      low: q.low ?? 0,
      close: q.close ?? 0,
    }))

    return NextResponse.json({ candlestickData })
  } catch (error) {
    console.error('Stock data error:', error instanceof Error ? error.message : error)
    return NextResponse.json<ErrorResponse>({ error: error instanceof Error ? error.message : 'Failed to fetch stock data' }, { status: 500 })
  }
}
