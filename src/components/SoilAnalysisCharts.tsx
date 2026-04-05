import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { SoilAnalysis } from '../types';
import { FlaskConical, Info } from 'lucide-react';

interface SoilAnalysisChartsProps {
  analysis: SoilAnalysis;
}

export default function SoilAnalysisCharts({ analysis }: SoilAnalysisChartsProps) {
  // Mock data if real data is missing for demonstration
  const chartData = analysis.data ? [
    { subject: 'pH', value: analysis.data.pH * 10, fullMark: 140 },
    { subject: 'Azot (N)', value: analysis.data.nitrogen, fullMark: 100 },
    { subject: 'Fosfor (P)', value: analysis.data.phosphorus, fullMark: 100 },
    { subject: 'Potasyum (K)', value: analysis.data.potassium, fullMark: 100 },
    { subject: 'Org. Madde', value: analysis.data.organicMatter * 20, fullMark: 100 },
  ] : [
    { subject: 'pH', value: 65, fullMark: 140 },
    { subject: 'Azot (N)', value: 45, fullMark: 100 },
    { subject: 'Fosfor (P)', value: 70, fullMark: 100 },
    { subject: 'Potasyum (K)', value: 85, fullMark: 100 },
    { subject: 'Org. Madde', value: 30, fullMark: 100 },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-farm-olive/10 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-farm-olive/10 rounded-xl flex items-center justify-center text-farm-olive">
            <FlaskConical size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 dark:text-zinc-100">Toprak Profili</h4>
            <p className="text-xs text-gray-400">Besin değerleri dağılımı</p>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Toprak Değerleri"
                dataKey="value"
                stroke="#4a5d4e"
                fill="#4a5d4e"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] border border-farm-olive/10 dark:border-white/5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Info size={20} />
            </div>
            <div>
              <h4 className="font-bold text-gray-800 dark:text-zinc-100">Analiz Özeti</h4>
              <p className="text-xs text-gray-400">Kritik parametreler</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {chartData.map((item) => (
              <div key={item.subject} className="space-y-1">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                  <span>{item.subject}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-farm-olive rounded-full transition-all duration-1000" 
                    style={{ width: `${(item.value / item.fullMark) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-farm-cream dark:bg-white/5 rounded-2xl border border-farm-olive/10 dark:border-white/5">
          <p className="text-xs text-farm-olive dark:text-farm-cream italic leading-relaxed">
            * Bu değerler laboratuvar sonuçlarına göre normalize edilmiştir. Optimal değerler için uzman görüşü alınız.
          </p>
        </div>
      </div>
    </div>
  );
}
