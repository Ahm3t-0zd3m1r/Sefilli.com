import React from 'react';
import { motion } from 'framer-motion';
import { Package, AlertCircle, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryManagerProps {
  items: InventoryItem[];
  onUpdate: (id: string, quantity: number) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ items, onUpdate, onDelete, onAdd }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'gubre': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'ilac': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'tohum': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'mazot': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Package className="text-farm-leaf" />
          Dijital Ambar
        </h3>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 bg-farm-leaf text-white px-4 py-2 rounded-xl hover:bg-farm-leaf/90 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Yeni Ürün Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <motion.div 
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative overflow-hidden"
          >
            {item.quantity <= item.minThreshold && (
              <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-bl-xl flex items-center gap-1">
                <AlertCircle size={12} />
                Kritik Stok
              </div>
            )}
            
            <div className="flex flex-col h-full">
              <div className="mb-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
                <h4 className="text-lg font-bold mt-2 text-gray-900 dark:text-white">{item.name}</h4>
              </div>

              <div className="flex items-end justify-between mt-auto">
                <div>
                  <div className="text-3xl font-black text-farm-leaf">
                    {item.quantity}
                    <span className="text-sm font-medium text-gray-500 ml-1">{item.unit}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    Son Güncelleme: {new Date(item.updatedAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => onUpdate(item.id, item.quantity + 1)}
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <RefreshCw size={16} className="text-gray-600 dark:text-gray-300" />
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">Ambarınızda henüz ürün bulunmuyor.</p>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
