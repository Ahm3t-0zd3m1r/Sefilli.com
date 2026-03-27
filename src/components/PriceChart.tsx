import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

interface PriceHistoryEntry {
  date: string;
  price: number;
}

interface PriceChartProps {
  data: PriceHistoryEntry[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#5A5A40" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis dataKey="date" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#5A5A40' }}
          />
          <Area type="monotone" dataKey="price" stroke="#5A5A40" strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default React.memo(PriceChart);
