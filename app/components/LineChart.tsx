'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
)

export default function LineChart({ data, symbol }: any) {
  const chartData = {
    labels: data?.map((item: any) => item.date),
    datasets: [
      {
        label: 'High Price',
        data: data?.map((item: any) => item.high),
        borderColor: 'rgba(0, 128, 0, 1)',
        backgroundColor: 'rgba(0, 128, 0, 0.2)',
      },
      {
        label: 'Low Price',
        data: data?.map((item: any) => item.low),
        borderColor: 'rgba(255, 0, 0, 1)',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      zoom: {
        pan: { enabled: true, mode: 'x' as const },
        zoom: { wheel: { enabled: true }, mode: 'x' as const }
      },
      title: { display: true, text: `Stock Performance for ${symbol}` }
    },
  }

  return <Line data={chartData} options={options} />
}