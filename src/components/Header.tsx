import React from 'react';
import { 
  Menu, X, Sun, Moon, TrendingUp, User as UserIcon, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from 'firebase/auth';
import { cn } from '../lib/utils';

interface HeaderProps {
  user: User | null;
  activeSection: string;
  setActiveSection: (id: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
  language: 'tr' | 'en' | 'de';
  setLanguage: (lang: 'tr' | 'en' | 'de') => void;
  weatherAlerts: any[];
  setWeatherAlerts: (alerts: any[]) => void;
  scrollToSection: (id: string) => void;
  navLinks: { id: string, label: string }[];
  setShowProfileSettings: (show: boolean) => void;
  setEditingProfile: (profile: any) => void;
  currentUserProfile: any;
}

export default function Header({
  user,
  activeSection,
  setActiveSection,
  isMenuOpen,
  setIsMenuOpen,
  isDarkMode,
  setIsDarkMode,
  language,
  setLanguage,
  weatherAlerts,
  setWeatherAlerts,
  scrollToSection,
  navLinks,
  setShowProfileSettings,
  setEditingProfile,
  currentUserProfile
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-farm-cream/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-farm-olive/10 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveSection('anasayfa')}>
          <div className="w-10 h-10 bg-farm-olive rounded-full flex items-center justify-center text-farm-cream">
            <TrendingUp size={20} />
          </div>
          <span className="text-2xl serif font-bold tracking-tight text-farm-olive dark:text-farm-cream">Sefilli.com</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map(link => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveSection(link.id);
                scrollToSection(link.id);
              }}
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-farm-olive dark:hover:text-farm-cream",
                activeSection === link.id ? "text-farm-olive dark:text-farm-cream border-b-2 border-farm-olive dark:border-farm-cream" : "text-gray-400 dark:text-zinc-500"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-farm-olive/5 dark:bg-white/5 text-farm-olive dark:text-farm-cream hover:bg-farm-olive/10 dark:hover:bg-white/10 transition-all"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Profile Button */}
          {user && (
            <button 
              onClick={() => {
                setEditingProfile(currentUserProfile || {
                  userId: user.uid,
                  displayName: user.displayName || '',
                  role: 'farmer',
                  reliabilityScore: 5.0,
                  totalSales: 0,
                  photoUrl: user.photoURL || '',
                  bio: '',
                  locationName: 'Niğde'
                });
                setShowProfileSettings(true);
              }}
              className="p-2 rounded-full bg-farm-olive/5 dark:bg-white/5 text-farm-olive dark:text-farm-cream hover:bg-farm-olive/10 dark:hover:bg-white/10 transition-all"
            >
              <UserIcon size={18} />
            </button>
          )}

          {/* Language Toggle */}
          <div className="hidden sm:flex items-center gap-2 bg-farm-olive/5 dark:bg-white/5 p-1 rounded-full border border-farm-olive/10 dark:border-white/5">
            {(['tr', 'en', 'de'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all",
                  language === lang ? "bg-farm-olive text-white shadow-sm" : "text-farm-olive/40 dark:text-zinc-500 hover:text-farm-olive dark:hover:text-farm-cream"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
          
          {/* Mobile Menu Toggle */}
          <button className="lg:hidden p-2 text-farm-olive dark:text-farm-cream" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Weather Alerts Banner */}
      <AnimatePresence>
        {weatherAlerts.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500 text-white overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle size={16} className="animate-pulse" />
                <span>{weatherAlerts[0].message}</span>
              </div>
              <button onClick={() => setWeatherAlerts([])} className="p-1 hover:bg-white/20 rounded">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-farm-cream dark:bg-zinc-900 border-b border-farm-olive/10 dark:border-white/5 overflow-hidden"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map(link => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(link.id);
                    scrollToSection(link.id);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "text-lg font-medium transition-colors",
                    activeSection === link.id ? "text-farm-olive dark:text-farm-cream" : "text-gray-600 dark:text-zinc-400"
                  )}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
