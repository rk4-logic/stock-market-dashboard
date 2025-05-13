// src/components/market/major-indices.tsx
interface IndexData {
  name: string;
  price: number;
  change: number;
  changePercent: string;
}

interface MajorIndicesProps {
  indices: {
    [key: string]: IndexData;
  };
}

export default function MajorIndices({ indices }: MajorIndicesProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Major Indices</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-6 gap-x-3">
        {Object.entries(indices).map(([key, value]) => (
          <div key={key} className="bg-white shadow-md p-3 rounded-md border hover:shadow-lg transition-shadow">
            <h2 className="text-sm font-bold">{value.name}</h2>
            <p className="text-gray-600 text-sm font-medium">
              {value.price.toLocaleString()}
            </p>
            <p className={`${value.change > 0 ? 'text-green-600' : 'text-red-600'} text-sm`}>
              {value.change > 0 ? '+' : ''}
              {value.change.toFixed(2)} ({value.changePercent}%)
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}