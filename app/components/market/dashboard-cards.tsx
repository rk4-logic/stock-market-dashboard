// src/components/market/dashboard-cards.tsx
'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { ClipLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';
import CountryIndicesHero from './country-indices-hero';
import MajorIndices from './major-indices';
import MarketHighlights from './market-highlights';

interface IndexData {
  name: string;
  price: number;
  change: number;
  changePercent: string;
}

interface DashboardData {
  indices: {
    [key: string]: IndexData;
  };
  gainers: string[];
  losers: string[];
}

export default function DashboardCards() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io('http://localhost:4000', {
      path: '/socket.io',
      transports: ['websocket'],
    });

    socket.on('dashboardUpdate', (newData: DashboardData) => {
      setData(newData);
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ClipLoader size={80} color="#4A90E2" />
      </div>
    );
  }

  return (
    <div className="space-y-14 h-screen">
      {data && <MajorIndices indices={data.indices} />}
      <CountryIndicesHero />
      {data && <MarketHighlights gainers={data.gainers} losers={data.losers} />}
    </div>
  );
}