import React from 'react';
import { motion } from 'framer-motion';
import { Tractor, Calendar, CheckCircle2, Clock, XCircle, Phone } from 'lucide-react';
import { EquipmentListing, EquipmentBooking } from '../types';

interface EquipmentRentalManagerProps {
  listings: EquipmentListing[];
  bookings: EquipmentBooking[];
  currentUserId: string;
  onBook: (listingId: string) => void;
  onUpdateStatus: (bookingId: string, status: EquipmentBooking['status']) => void;
}

const EquipmentRentalManager: React.FC<EquipmentRentalManagerProps> = ({ listings, bookings, currentUserId, onBook, onUpdateStatus }) => {
  const myListings = listings.filter(l => l.userId === currentUserId);
  const incomingBookings = bookings.filter(b => b.ownerId === currentUserId);
  const myBookings = bookings.filter(b => b.renterId === currentUserId);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 mb-6">
        <Tractor className="text-farm-leaf" />
        <h3 className="text-lg font-bold">Ekipman Paylaşım ve Kiralama</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Incoming Requests */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Clock size={16} />
            Gelen Talepler (Benim Ekipmanlarım)
          </h4>
          <div className="space-y-3">
            {incomingBookings.map((booking) => {
              const listing = listings.find(l => l.id === booking.listingId);
              return (
                <motion.div 
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{listing?.title}</div>
                      <div className="text-xs text-gray-500">Kiracı: {booking.renterName}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(booking.startDate).toLocaleDateString('tr-TR')} - {new Date(booking.endDate).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="font-bold text-farm-leaf">₺{booking.totalPrice}</div>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                        className="flex-grow flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition-colors"
                      >
                        <CheckCircle2 size={14} />
                        Onayla
                      </button>
                      <button 
                        onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                        className="flex-grow flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 py-2 rounded-xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <XCircle size={14} />
                        Reddet
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
            {incomingBookings.length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm italic">Henüz gelen bir talep yok.</p>
            )}
          </div>
        </div>

        {/* My Bookings */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <Calendar size={16} />
            Kiraladıklarım
          </h4>
          <div className="space-y-3">
            {myBookings.map((booking) => {
              const listing = listings.find(l => l.id === booking.listingId);
              return (
                <motion.div 
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">{listing?.title}</div>
                      <div className="text-xs text-gray-500">Sahibi: {listing?.userName}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${getStatusStyle(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(booking.startDate).toLocaleDateString('tr-TR')}
                      </div>
                      <div className="font-bold text-farm-leaf">₺{booking.totalPrice}</div>
                    </div>
                    {listing?.contactPhone && (
                      <a 
                        href={`tel:${listing.contactPhone}`}
                        className="p-2 bg-farm-leaf/10 text-farm-leaf rounded-full hover:bg-farm-leaf/20 transition-colors"
                      >
                        <Phone size={16} />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
            {myBookings.length === 0 && (
              <p className="text-center py-8 text-gray-400 text-sm italic">Henüz bir kiralama yapmadınız.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentRentalManager;
