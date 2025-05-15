// app/option-chain/page.tsx
'use client'

import { useEffect, useState } from 'react';
// import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { equitySymbols } from '../components/SymbolData';
import dynamic from 'next/dynamic';

// Dynamic import for Bar and Line charts to avoid SSR issues
const Bar = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Bar),
  { ssr: false }
);

const Line = dynamic(
  () => import('react-chartjs-2').then((mod) => mod.Line),
  { ssr: false }
);

interface OptionData {
    strikePrice: number;
    expiryDate: string;
    CE?: {
        openInterest: number;
        changeinOpenInterest: number;
        totalTradedVolume: number;
        impliedVolatility: number;
        lastPrice: number;
        change: number;
    };
    PE?: {
        openInterest: number;
        changeinOpenInterest: number;
        totalTradedVolume: number;
        impliedVolatility: number;
        lastPrice: number;
        change: number;
    };
}

export default function OptionChain() {
    const [data, setData] = useState<OptionData[]>([]);
    const [filters, setFilters] = useState({
        strike: '',
        expiry: '',
        symbol: 'NIFTY',
        symbolType: 'indices' as 'indices' | 'equities'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    const symbolList = {
        indices: ["NIFTY", "NIFTYNXT50", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"],
        equities: equitySymbols
    };

    useEffect(() => {
        // Register core Chart.js components FIRST
        ChartJS.register(
            CategoryScale, // Add this explicitly
            LinearScale,
            BarElement,
            LineElement,
            PointElement,
            Title,
            Tooltip,
            Legend
        );

        // Then load zoom plugin dynamically
        import('chartjs-plugin-zoom').then((zoomPlugin) => {
            ChartJS.register(zoomPlugin.default);
        });
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/optionchain?symbol=${filters.symbol}&type=${filters.symbolType}`
            );
            const result = await response.json();

            if (result?.records?.data) {
                setData(result.records.data);
                setLastRefreshed(new Date());
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [filters.symbol, filters.symbolType]);

    const filteredData = data
        .filter(item =>
            (!filters.strike || item.strikePrice.toString() === filters.strike) &&
            (!filters.expiry || item.expiryDate === filters.expiry)
        )
        .sort((a, b) => {
            const dateA = new Date(a.expiryDate);
            const dateB = new Date(b.expiryDate);
            return dateA.getTime() - dateB.getTime() || a.strikePrice - b.strikePrice;
        });

    // Chart Configurations
    const chartData = {
        labels: filteredData.map(item => item.strikePrice),
        datasets: [
            {
                label: "Open Interest (Calls)",
                data: filteredData.map(item => item.CE?.openInterest || 0),
                backgroundColor: "rgba(26, 14, 191, 0.97)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
            {
                label: "Open Interest (Puts)",
                data: filteredData.map(item => item.PE?.openInterest || 0),
                backgroundColor: "rgba(230, 165, 84, 0.96)",
                borderColor: "rgba(255, 159, 64, 1)",
                borderWidth: 1,
            },
        ],
    };

    const ivChartData = {
        labels: filteredData.map(item => item.strikePrice),
        datasets: [
            {
                label: "Implied Volatility (Calls)",
                data: filteredData.map(item => item.CE?.impliedVolatility || 0),
                borderColor: "#6abe37",
                backgroundColor: "#50892e",
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.4,
            },
            {
                label: "Implied Volatility (Puts)",
                data: filteredData.map(item => item.PE?.impliedVolatility || 0),
                borderColor: "#6028c9",
                backgroundColor: "#51279f",
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.4,
            },
        ],
    };

    const volumeChartData = {
        labels: filteredData.map(item => item.strikePrice),
        datasets: [
            {
                label: "Volume (Calls)",
                data: filteredData.map(item => item.CE?.totalTradedVolume || 0),
                backgroundColor: "rgba(26, 14, 191, 0.97)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
            {
                label: "Volume (Puts)",
                data: filteredData.map(item => item.PE?.totalTradedVolume || 0),
                backgroundColor: "rgba(230, 165, 84, 0.96)",
                borderColor: "rgba(255, 197, 64, 1)",
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "top" as const,
                labels: {
                    font: {
                        size: 12,
                        weight: 700
                    }
                }
            },
            title: {
                display: true,
                text: "Open Interest vs Strike Price",
                font: {
                    size: 14,
                    weight: 700
                }
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) => {
                        const dataIndex = tooltipItem.dataIndex;
                        const expiry = filteredData[dataIndex]?.expiryDate || "Unknown";
                        return `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(2)} (Expiry: ${expiry})`;
                    }
                }
            },
            zoom: {
                pan: { enabled: true, mode: "x" as const },
                zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" as const }
            }
        },
        scales: {
            x: {
                grid: { color: "rgba(0, 0, 0, 0.1)", lineWidth: 2 },
                ticks: { font: { size: 14, weight: 700 } }
            },
            y: {
                grid: { color: "rgba(0, 0, 0, 0.1)", lineWidth: 2 },
                ticks: { font: { size: 14, weight: "bold" as const } }
            }
        }
    };

    return (
        <div className="px-4 py-1 w-full min-h-screen">
            <h1 className="text-3xl font-bold text-center mb-2">Option Chain</h1>

            {/* Header Section */}
            <div className="text-center mb-4">
                <div className="inline-block bg-white p-4 rounded-lg shadow-md">
                    <span className="font-bold text-xl mr-4">Current Symbol: {filters.symbol}</span>
                    <span className="font-semibold text-gray-600">
                        Last Refreshed: {lastRefreshed?.toLocaleString("en-GB") || "Loading..."}
                    </span>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Symbol Type</label>
                        <select
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 transition"
                            value={filters.symbolType}
                            onChange={(e) => setFilters(prev => ({ ...prev, symbolType: e.target.value as 'indices' | 'equities' }))}
                        >
                            <option value="indices">Indices</option>
                            <option value="equities">Equities</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Symbol</label>
                        <select
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 transition"
                            value={filters.symbol}
                            onChange={(e) => setFilters(prev => ({ ...prev, symbol: e.target.value }))}
                        >
                            {symbolList[filters.symbolType].map((sym) => (
                                <option key={sym} value={sym}>{sym}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Strike Price</label>
                        <select
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 transition"
                            value={filters.strike}
                            onChange={(e) => setFilters(prev => ({ ...prev, strike: e.target.value }))}
                        >
                            <option value="">All Strikes</option>
                            {[...new Set(data.map(i => i.strikePrice))].map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <select
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-400 transition"
                            value={filters.expiry}
                            onChange={(e) => setFilters(prev => ({ ...prev, expiry: e.target.value }))}
                        >
                            <option value="">All Expiries</option>
                            {[...new Set(data.map(i => i.expiryDate))].map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            ) : (
                <>
                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Implied Volatility</h3>
                            <div className="h-96">
                                <Line data={ivChartData} options={chartOptions} />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h3 className="text-lg font-semibold mb-4">Open Interest</h3>
                            <div className="h-96">
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-md lg:col-span-2">
                            <h3 className="text-lg font-semibold mb-4">Volume Analysis</h3>
                            <div className="h-96">
                                <Bar
                                    data={volumeChartData}
                                    options={{
                                        ...chartOptions,
                                        plugins: {
                                            ...chartOptions.plugins,
                                            title: { ...chartOptions.plugins.title, text: "Volume vs Strike Price" }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Option Chain Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-4 border-b">
                            <h3 className="text-lg font-semibold">Detailed Option Chain</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th colSpan={6} className="px-4 py-3 bg-blue-50">CALLS</th>
                                        <th className="px-4 py-3 bg-gray-100">Expiry</th>
                                        <th colSpan={6} className="px-4 py-3 bg-orange-50">PUTS</th>
                                    </tr>
                                    <tr>
                                        {["OI", "Chg OI", "Vol", "IV", "LTP", "Chng"].map((h) => (
                                            <th key={h} className="px-4 py-2 border">{h}</th>
                                        ))}
                                        <th className="px-4 py-2 border">Expiry</th>
                                        {["OI", "Chg OI", "Vol", "IV", "LTP", "Chng"].map((h) => (
                                            <th key={h} className="px-4 py-2 border">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item, i) => (
                                        <tr key={i} className="hover:bg-gray-50 even:bg-gray-50">
                                            {["openInterest", "changeinOpenInterest", "totalTradedVolume", "impliedVolatility", "lastPrice", "change"].map((key) => (
                                                <td key={key} className="px-4 py-2 border text-center">
                                                    {item.CE ? new Intl.NumberFormat().format(item.CE[key as keyof typeof item.CE] || 0) : "-"}
                                                </td>
                                            ))}
                                            <td className="px-4 py-2 border text-center">{item.expiryDate}</td>
                                            {["openInterest", "changeinOpenInterest", "totalTradedVolume", "impliedVolatility", "lastPrice", "change"].map((key) => (
                                                <td key={key} className="px-4 py-2 border text-center">
                                                    {item.PE ? new Intl.NumberFormat().format(item.PE[key as keyof typeof item.PE] || 0) : "-"}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}