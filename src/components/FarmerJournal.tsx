import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, Sprout, ChevronRight } from 'lucide-react';
import { HarvestEvent } from '../types';

interface FarmerJournalProps {
  events: HarvestEvent[];
}

const FarmerJournal: React.FC<FarmerJournalProps> = ({ events }) => {
  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl serif text-farm-olive dark:text-farm-cream">Çiftçi Günlüğü</h3>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          <Calendar size={14} />
          <span>{new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-farm-olive/10 dark:bg-white/5 hidden md:block"></div>

        <div className="space-y-12">
          {sortedEvents.length > 0 ? sortedEvents.map((event, index) => (
            <motion.div 
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative md:pl-24"
            >
              {/* Timeline Dot */}
              <div className="absolute left-6 top-0 w-4 h-4 rounded-full bg-farm-olive border-4 border-white dark:border-zinc-900 hidden md:block z-10 shadow-sm"></div>

              <div className="bg-white dark:bg-zinc-900 p-8 rounded-[32px] shadow-sm border border-farm-olive/5 hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      event.action === 'planting' ? "bg-farm-olive/10 text-farm-olive" : "bg-orange-500/10 text-orange-500"
                    )}>
                      {event.action === 'planting' ? <Sprout size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800 dark:text-zinc-100">{event.cropName}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <User size={12} />
                        <span>{event.userName || 'Anonim Çiftçi'}</span>
                        <span>•</span>
                        <span>{new Date(event.createdAt || '').toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                  </div>
                  <div className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest",
                    event.action === 'planting' ? "bg-farm-olive/10 text-farm-olive" : "bg-orange-500/10 text-orange-500"
                  )}>
                    {event.action === 'planting' ? 'Ekim Yapıldı' : 'Hasat Edildi'}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-zinc-400 leading-relaxed mb-6">
                  {event.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-farm-olive/5">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-zinc-900 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                          <img src={`https://i.pravatar.cc/100?u=${event.id}${i}`} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">+12 beğeni</span>
                  </div>
                  <button className="text-farm-olive text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    Detaylar <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-20 text-gray-400 italic bg-white dark:bg-zinc-900 rounded-[40px] border-2 border-dashed border-farm-olive/10">
              Henüz günlüğe bir giriş yapılmamış.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default FarmerJournal;
