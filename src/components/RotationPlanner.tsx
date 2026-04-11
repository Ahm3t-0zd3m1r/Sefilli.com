import React from 'react';
import { motion } from 'framer-motion';
import { Sprout, History, Lightbulb, Plus } from 'lucide-react';
import { RotationPlan } from '../types';

interface RotationPlannerProps {
  plans: RotationPlan[];
  onAdd: () => void;
}

const RotationPlanner: React.FC<RotationPlannerProps> = ({ plans, onAdd }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sprout className="text-farm-leaf" />
          AI Ekim Nöbeti Planlayıcı
        </h3>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 bg-farm-leaf text-white px-4 py-2 rounded-xl hover:bg-farm-leaf/90 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Yeni Plan Oluştur
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {plans.map((plan) => (
          <motion.div 
            key={plan.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/3">
                <div className="flex items-center gap-2 mb-4 text-farm-leaf font-bold">
                  <History size={20} />
                  Tarla Geçmişi: {plan.fieldName}
                </div>
                <div className="space-y-3">
                  {plan.history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                      <span className="text-sm font-bold text-gray-500">{h.year}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{h.crop}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:w-2/3 bg-farm-leaf/5 dark:bg-farm-leaf/10 p-6 rounded-3xl border border-farm-leaf/10">
                <div className="flex items-center gap-2 mb-4 text-farm-leaf font-bold">
                  <Lightbulb size={20} />
                  AI Tavsiyesi
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{plan.recommendation}"
                </p>
                <div className="mt-6 flex gap-2">
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-[10px] font-bold text-farm-leaf border border-farm-leaf/20">
                    TOPRAK SAĞLIĞI: MÜKEMMEL
                  </span>
                  <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-[10px] font-bold text-farm-leaf border border-farm-leaf/20">
                    VERİM TAHMİNİ: +%15
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Sprout size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Henüz bir ekim nöbeti planınız bulunmuyor. AI ile planlamak için yukarıdaki butona tıklayın.</p>
        </div>
      )}
    </div>
  );
};

export default RotationPlanner;
