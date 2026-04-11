import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Clock, Activity, Thermometer, Wind, Plus } from 'lucide-react';
import { IrrigationLog, WeatherData } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface IrrigationDashboardProps {
  logs: IrrigationLog[];
  weather: WeatherData | null;
  onAdd: () => void;
}

const IrrigationDashboard: React.FC<IrrigationDashboardProps> = ({ logs, weather, onAdd }) => {
  const chartData = logs.slice(-10).reverse().map(log => ({
    date: new Date(log.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    amount: log.amount
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Droplets className="text-blue-500" />
          Akıllı Sulama Kontrol Paneli
        </h3>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Sulama Kaydı Gir
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Thermometer size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Sıcaklık</span>
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300">{weather?.temp}°C</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Activity size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Nem</span>
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300">%{weather?.humidity}</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Wind size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Rüzgar</span>
          </div>
          <div className="text-2xl font-black text-blue-700 dark:text-blue-300">{weather?.windSpeed} km/s</div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <Clock size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Son Sulama</span>
          </div>
          <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
            {logs.length > 0 ? new Date(logs[0].date).toLocaleDateString('tr-TR') : 'Kayıt Yok'}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <h4 className="text-sm font-bold text-gray-500 mb-6 uppercase tracking-widest">Su Tüketim Analizi (m³)</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default IrrigationDashboard;
