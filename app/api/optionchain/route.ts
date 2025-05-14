// app/api/optionchain/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const type = searchParams.get('type');

  if (!symbol || !type) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const url = type === 'indices'
      ? `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}`
      : `https://www.nseindia.com/api/option-chain-equities?symbol=${symbol}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.nseindia.com/'
      }
    });

    if (!response.ok) throw new Error('Failed to fetch data');
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Option chain error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch option chain data' },
      { status: 500 }
    );
  }
}