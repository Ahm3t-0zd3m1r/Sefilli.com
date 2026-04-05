import React from 'react';
import { 
  Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube 
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-farm-olive text-farm-cream py-24">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <h3 className="text-4xl serif mb-6 italic">Sefilli.com</h3>
          <p className="text-farm-cream/60 max-w-md leading-relaxed font-light mb-8">
            Niğde'nin bereketli topraklarında, geleneksel tarımı teknoloji ile buluşturuyoruz. 
            Tarladan sofranıza en taze ve doğal ürünleri ulaştırıyoruz.
          </p>
          <div className="flex gap-4">
            {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all">
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40">İletişim</h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm opacity-80">
              <MapPin size={16} /> Niğde İçmeli Köyü
            </li>
            <li className="flex items-center gap-3 text-sm opacity-80">
              <Phone size={16} /> +90 (5xx) xxx xx xx
            </li>
            <li className="flex items-center gap-3 text-sm opacity-80">
              <Mail size={16} /> iletisim@sefilli.com
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-40">Hızlı Linkler</h4>
          <ul className="space-y-4">
            {['Hakkımızda', 'Pazar', 'Blog', 'Fiyatlar', 'Galeri'].map(link => (
              <li key={link}>
                <a href="#" className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transition-all inline-block">{link}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest opacity-40 font-bold">
        <p>© 2026 Sefilli.com - Tüm Hakları Saklıdır.</p>
        <div className="flex gap-8">
          <a href="#">Gizlilik Politikası</a>
          <a href="#">Kullanım Şartları</a>
        </div>
      </div>
    </footer>
  );
}
