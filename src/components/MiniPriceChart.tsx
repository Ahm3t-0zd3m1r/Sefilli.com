import React from 'react';
import { 
  ResponsiveContainer, LineChart, Line, Tooltip 
} from 'recharts';

interface PriceHistoryEntry {
  date: string;
  price: number;
}

interface MiniPriceChartProps {
  data: PriceHistoryEntry[];
}

const MiniPriceChart: React.FC<MiniPriceChartProps> = ({ data }) => {
  return (
    <div className="h-12 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line type="monotone" dataKey="price" stroke="#5A5A40" strokeWidth={2} dot={false} />
          <Tooltip />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(MiniPriceChart);
