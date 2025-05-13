// src/components/market/country-indices-hero.tsx
'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

interface CountryIndex {
    name: string;
    price: number;
    change: number;
    changePercent: string;
    currency: string;
}

interface CountryIndices {
    [country: string]: CountryIndex[];
}

export default function CountryIndicesHero() {
    const router = useRouter();
    const [indicesData, setIndicesData] = useState<CountryIndices | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const socket = io('http://localhost:4000', {
            path: '/socket.io',
            transports: ['websocket'],
        });


        socket.on('countryIndicesUpdate', (data: CountryIndices) => {
            setIndicesData(data);
            setLoading(false);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    if (loading || !indicesData) return null;

    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-3">Global Market Indices</h2>
            {Object.entries(indicesData).map(([country, indices]) => (
                <div key={country} className="mb-1">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                        {country.toUpperCase()}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {indices.slice(0, 4).map((index, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                            >
                                <h3 className="text-sm font-semibold">{index.name}</h3>
                                <p className="text-gray-700 text-sm font-medium">
                                    {index.price.toLocaleString()} {index.currency}
                                </p>
                                <p
                                    className={`text-xs ${index.change > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}
                                >
                                    {index.change > 0 ? '+' : ''}
                                    {index.change.toFixed(2)} ({index.changePercent}%)
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="flex justify-center mt-6">
                <button
                    onClick={() => router.push('/premiumMarketInsights')}
                    className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition-all"
                >
                    Premium Stock Insights
                </button>
            </div>
        </div>
    );
}