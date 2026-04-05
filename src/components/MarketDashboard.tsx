import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { CropPrice } from '../types';
import { cn } from '../lib/utils';

interface MarketDashboardProps {
  cropPrices: CropPrice[];
}

export default function MarketDashboard({ cropPrices }: MarketDashboardProps) {
  const selectedCrop = cropPrices[0];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        {cropPrices.slice(0, 3).map((crop) => (
          <div key={crop.id} className="bg-white dark:bg-zinc-900 p-6 rounded-[32px] border border-farm-olive/10 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{crop.cropName}</h4>
                <div className="text-2xl font-bold text-gray-800 dark:text-zinc-100">{crop.price} ₺ <span className="text-sm font-normal text-gray-400">/ {crop.unit}</span></div>
              </div>
              <div className={cn(
                "p-2 rounded-xl",
                crop.trend === 'up' ? "bg-green-50 text-green-600" : 
                crop.trend === 'down' ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-600"
              )}>
                {crop.trend === 'up' ? <TrendingUp size={20} /> : 
                 crop.trend === 'down' ? <TrendingDown size={20} /> : <Minus size={20} />}
              </div>
            </div>
            <div className="h-16 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={crop.history || []}>
                  <defs>
                    <linearGradient id={`colorPrice-${crop.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={crop.trend === 'up' ? "#16a34a" : "#dc2626"} stopOpacity={0.1}/>
                      <stop offset="95%" stopColor={crop.trend === 'up' ? "#16a34a" : "#dc2626"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={crop.trend === 'up' ? "#16a34a" : "#dc2626"} 
                    fillOpacity={1} 
                    fill={`url(#colorPrice-${crop.id})`} 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-farm-olive/10 dark:border-white/5 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-zinc-100">Fiyat Analizi & Trendler</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Son 30 günlük piyasa değişim grafiği</p>
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2 px-4 py-2 bg-farm-cream dark:bg-white/5 rounded-xl text-xs font-bold text-farm-olive dark:text-farm-cream">
              <Info size={14} />
              Niğde Borsası Verileri
            </div>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedCrop?.history || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickFormatter={(value) => `${value}₺`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#4a5d4e" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#4a5d4e', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
