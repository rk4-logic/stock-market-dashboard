// app/api/search/route.ts
import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')?.trim()

    // Basic validation
    if (!query || query.length < 2) {
      return NextResponse.json(
        { error: 'Please enter at least 2 characters' },
        { status: 400 }
      )
    }

    // Simple timeout handling
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout

    let searchResults;
    try {
      searchResults = await yahooFinance.search(query, undefined);
    } finally {
      clearTimeout(timeout);
    }

    // Filter out invalid entries
    const validQuotes = searchResults.quotes.filter(
      (quote: any) => quote.symbol && quote.shortname
    )

    return NextResponse.json(validQuotes)
    
  } catch (error: any) {
    console.error('Search error:', error)
    
    const status = error.name === 'AbortError' ? 504 : 500
    return NextResponse.json(
      { error: status === 504 ? 'Search timeout' : 'Internal server error' },
      { status }
    )
  }
}