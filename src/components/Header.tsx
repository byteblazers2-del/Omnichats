import React from 'react';
import { 
  Eye, 
  Languages, 
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { Operator } from '../types';
import { motion } from 'motion/react';

interface HeaderProps {
  currentOperator: Operator;
  onStatusChange: (status: 'online' | 'busy' | 'offline') => void;
  onlineVisitorsCount: number;
  activeChatsCount: number;
  isWidgetOpen: boolean;
  onToggleWidget: () => void;
  onOpenInstaller: () => void;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  language: 'fa' | 'en';
  onToggleLanguage: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentOperator,
  onStatusChange,
  onlineVisitorsCount,
  activeChatsCount,
  isWidgetOpen,
  onToggleWidget,
  activeTab,
  language,
  onToggleLanguage,
  isDarkMode = false,
  onToggleDarkMode,
  isMobileMenuOpen = false,
  onToggleMobileMenu,
}) => {
  const isFa = language === 'fa';

  const tabTitles: Record<string, { fa: string; en: string }> = {
    'chats': { fa: 'گفتگوهای زنده', en: 'Live Conversations' },
    'visitors': { fa: 'بازدیدکنندگان لحظه‌ای', en: 'Real-time Visitors' },
    'themes': { fa: 'استودیوی قالب‌ها', en: 'Themes Studio' },
    'operators': { fa: 'مدیریت کارشناسان', en: 'Operators & Agents' },
    'departments': { fa: 'دپارتمان‌های پشتیبانی', en: 'Departments' },
    'offline-leads': { fa: 'پیام‌های آفلاین', en: 'Offline Leads' },
    'analytics': { fa: 'گزارشات و آمار', en: 'Analytics' },
    'embed': { fa: 'کد اسکریپت و افزونه', en: 'Embed Script' },
    'commercial-guide': { fa: 'معماری فنی سلف‌هاستد', en: 'Architecture' },
  };

  const currentTitle = tabTitles[activeTab] || { fa: 'میز کار پشتیبانی', en: 'Support Desk' };

  return (
    <header className={`h-16 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 border-b transition-colors ${
      isDarkMode 
        ? 'bg-[#17212b] border-slate-800 text-white' 
        : 'bg-white border-slate-200 text-slate-800'
    }`}>
      {/* Title, Hamburger & Section Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile & Tablet Hamburger Toggle Button */}
        {onToggleMobileMenu && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            onClick={onToggleMobileMenu}
            className={`lg:hidden p-2 rounded-xl transition-all border shrink-0 ${
              isDarkMode 
                ? 'bg-[#242f3d] border-slate-700 text-slate-200 hover:bg-[#2c394a]' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            aria-label={isMobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </motion.button>
        )}

        <h1 className="text-sm md:text-base font-bold tracking-tight truncate">
          {isFa ? currentTitle.fa : currentTitle.en}
        </h1>
        
        <div className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
          isDarkMode ? 'bg-[#34C759]/15 text-[#34C759]' : 'bg-emerald-50 text-emerald-700'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
          <span>{isFa ? 'سرور سلف‌هاستد فعال' : 'Local Host Active'}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        
        {/* Visitor Metrics Pill (hidden on small mobile) */}
        <div className={`hidden lg:flex items-center gap-2.5 text-xs px-3 py-1.5 rounded-xl border transition-colors ${
          isDarkMode ? 'bg-[#242f3d] border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#34C759]" />
            <span>{isFa ? `${onlineVisitorsCount} آنلاین` : `${onlineVisitorsCount} online`}</span>
          </span>
          <span className="opacity-30">•</span>
          <span className="font-medium">
            {isFa ? `${activeChatsCount} گفتگو` : `${activeChatsCount} active`}
          </span>
        </div>

        {/* Live Widget Toggle Button */}
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={onToggleWidget}
          className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
            isWidgetOpen
              ? 'bg-[#007AFF] text-white border-transparent'
              : (isDarkMode 
                  ? 'bg-[#242f3d] text-[#0A84FF] border-slate-700 hover:bg-[#2a3746]' 
                  : 'bg-blue-50 text-[#007AFF] border-blue-100 hover:bg-blue-100')
          }`}
          title={isFa ? 'پیش‌نمایش زنده ویجت کاربر در گوشه سایت' : 'Toggle customer widget preview'}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isFa ? (isWidgetOpen ? 'بستن ویجت' : 'پیش‌نمایش ویجت') : (isWidgetOpen ? 'Hide Widget' : 'Preview Widget')}
          </span>
        </motion.button>

        {/* Dark / Light Mode Toggle */}
        {onToggleDarkMode && (
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onToggleDarkMode}
            className={`p-2 rounded-xl transition-colors border ${
              isDarkMode 
                ? 'bg-[#242f3d] border-slate-700 text-amber-400 hover:bg-[#2c394a]' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
            }`}
            title={isDarkMode ? (isFa ? 'حالت روز' : 'Light mode') : (isFa ? 'حالت شب' : 'Dark mode')}
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </motion.button>
        )}

        {/* Language Switcher */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onToggleLanguage}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 border ${
            isDarkMode 
              ? 'bg-[#242f3d] border-slate-700 text-slate-300 hover:bg-[#2c394a]' 
              : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
          }`}
          title={isFa ? 'Switch to English' : 'تغییر به زبان فارسی'}
        >
          <Languages className="w-3.5 h-3.5 text-slate-400" />
          <span>{isFa ? 'EN' : 'فا'}</span>
        </motion.button>

        {/* Operator Status Indicator */}
        <div className="flex items-center gap-2 pr-1 sm:pr-2">
          <div className="relative">
            {currentOperator.avatar ? (
              <img 
                src={currentOperator.avatar} 
                alt={currentOperator.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-700" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#007AFF] text-white flex items-center justify-center font-bold text-xs">
                {currentOperator.name.substring(0, 1)}
              </div>
            )}
            <span 
              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-800 ${
                currentOperator.status === 'online' ? 'bg-[#34C759]' : currentOperator.status === 'busy' ? 'bg-[#FF9500]' : 'bg-slate-400'
              }`}
            />
          </div>

          <div className="hidden md:block text-right">
            <div className="text-xs font-bold leading-tight">{currentOperator.name}</div>
            <select
              value={currentOperator.status}
              onChange={(e) => onStatusChange(e.target.value as any)}
              className={`text-[10px] font-semibold bg-transparent border-0 p-0 focus:outline-hidden cursor-pointer ${
                currentOperator.status === 'online' ? 'text-[#34C759]' : currentOperator.status === 'busy' ? 'text-[#FF9500]' : 'text-slate-400'
              }`}
            >
              <option value="online" className="text-slate-800 bg-white dark:bg-slate-900 dark:text-slate-100">{isFa ? 'آنلاین (آماده)' : 'Online'}</option>
              <option value="busy" className="text-slate-800 bg-white dark:bg-slate-900 dark:text-slate-100">{isFa ? 'مشغول' : 'Busy'}</option>
              <option value="offline" className="text-slate-800 bg-white dark:bg-slate-900 dark:text-slate-100">{isFa ? 'آفلاین' : 'Offline'}</option>
            </select>
          </div>
        </div>

      </div>
    </header>
  );
};
