// src/components/market/market-highlights.tsx
interface MarketHighlightsProps {
  gainers: string[];
  losers: string[];
}

export default function MarketHighlights({ gainers, losers }: MarketHighlightsProps) {
  return (
    <div className="pt-2 pb-4">
      <h2 className="text-xl font-bold mb-4">Market Highlights</h2>
      <div className="flex flex-wrap gap-4">
        <div className="bg-white shadow-md p-4 rounded-md border hover:shadow-lg transition-shadow w-60">
          <h2 className="text-md font-bold">Top Gainers</h2>
          <p className="text-gray-700">{gainers.join(', ')}</p>
        </div>
        <div className="bg-white shadow-md p-4 rounded-md border hover:shadow-lg transition-shadow w-60">
          <h2 className="text-md font-bold">Top Losers</h2>
          <p className="text-gray-700">{losers.join(', ')}</p>
        </div>
      </div>
    </div>
  );
}