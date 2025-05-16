import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json(
      { error: 'Missing symbol parameter' },
      { status: 400 }
    );
  }

  try {
    const companyProfile = await yahooFinance
      .quoteSummary(symbol, { modules: ['assetProfile'] })
      .catch(() => null);

    const financials = await yahooFinance
      .quoteSummary(symbol, {
        modules: ['incomeStatementHistory', 'balanceSheetHistory'],
      })
      .catch(() => null);

    return NextResponse.json({
      companyProfile: companyProfile?.assetProfile || {},
      financials: {
        incomeStatementHistory: financials?.incomeStatementHistory || [],
        balanceSheetHistory: financials?.balanceSheetHistory || [],
      },
    });
  } catch (error) {
    console.error('Failed to fetch company info or financials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company info or financials' },
      { status: 500 }
    );
  }
}
