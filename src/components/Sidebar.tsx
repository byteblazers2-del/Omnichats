import React from 'react';
import { 
  MessageSquare, 
  Users, 
  UserCheck, 
  Building2, 
  Palette, 
  Mail, 
  BarChart3, 
  Package, 
  Settings,
  Sparkles,
  ShieldCheck,
  Sun,
  Moon,
  LogOut,
  HardDrive
} from 'lucide-react';
import { Operator } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadChatsCount: number;
  onlineVisitorsCount: number;
  offlineLeadsCount: number;
  language: 'fa' | 'en';
  currentOperator?: Operator;
  onOpenInstallWizard?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  unreadChatsCount,
  onlineVisitorsCount,
  offlineLeadsCount,
  language,
  currentOperator,
  onOpenInstallWizard,
  isDarkMode = false,
  onToggleDarkMode,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isFa = language === 'fa';

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Navigation Items
  const dashboardNav = [
    {
      id: 'chats',
      label: isFa ? 'گفتگوها' : 'Conversations',
      icon: MessageSquare,
      badge: unreadChatsCount > 0 ? unreadChatsCount : null,
      badgeColor: 'bg-[#007AFF] text-white',
    },
    {
      id: 'departments',
      label: isFa ? 'دپارتمان‌ها' : 'Departments',
      icon: Building2,
      badge: isFa ? 'جدید' : 'New',
      badgeColor: 'bg-[#34C759]/15 text-[#34C759]',
    },
    {
      id: 'operators',
      label: isFa ? 'مدیریت اپراتورها' : 'Operator Staff',
      icon: UserCheck,
    },
    {
      id: 'visitors',
      label: isFa ? 'بازدیدکنندگان' : 'Live Visitors',
      icon: Users,
      badge: onlineVisitorsCount > 0 ? onlineVisitorsCount : null,
      badgeColor: 'bg-[#34C759] text-white',
    },
    {
      id: 'offline-leads',
      label: isFa ? 'پیام‌های آفلاین' : 'Offline Inquiries',
      icon: Mail,
      badge: offlineLeadsCount > 0 ? offlineLeadsCount : null,
      badgeColor: 'bg-[#FF9500] text-white',
    },
  ];

  const settingsNav = [
    {
      id: 'embed',
      label: isFa ? 'نصب ابزارک' : 'Embed Widget',
      icon: Package,
    },
    {
      id: 'themes',
      label: isFa ? 'استودیو قالب‌ها' : 'Themes Studio',
      icon: Palette,
    },
    {
      id: 'analytics',
      label: isFa ? 'آمار و گزارشات' : 'Analytics',
      icon: BarChart3,
    },
  ];

  const sovereignNav = [
    {
      id: 'commercial-guide',
      label: isFa ? 'استقلال ۱۰۰٪ سرور' : '100% Self-Hosted',
      icon: HardDrive,
      highlight: true,
    },
  ];

  const operatorName = currentOperator?.name || (isFa ? 'آرمان میمندی' : 'Arman Meymandi');
  const operatorHandle = currentOperator?.email ? currentOperator.email.split('@')[0] : 'arman.support';
  const operatorAvatar = currentOperator?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';

  const renderSidebarContent = () => (
    <>
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        
        {/* Top Dark Hero Brand Card (omni chat with Apple iOS Blue accent) */}
        <div className="bg-[#0b111a] text-white rounded-3xl p-4 shadow-md space-y-2 relative overflow-hidden border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#007AFF] to-[#0A84FF] flex items-center justify-center text-white shadow-md shadow-[#007AFF]/30">
                <MessageSquare className="w-4 h-4 fill-white text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight font-sans text-white">omni chat</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#007AFF]/30 text-[#0A84FF] font-mono">
                    MAC
                  </span>
                </div>
              </div>
            </div>

            {/* Close button on mobile & tablet drawer */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            {isFa ? 'پلتفرم چت آنلاین و پشتیبانی مستقل' : 'Autonomous Live Support Platform'}
          </p>
        </div>

        {/* Floating Operator Profile Card */}
        <div className={`rounded-2xl p-3 flex items-center justify-between transition-colors ${
          isDarkMode ? 'bg-[#17212b] shadow-xs' : 'bg-slate-50/90 shadow-2xs'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img 
                src={operatorAvatar} 
                alt={operatorName} 
                className="w-9 h-9 rounded-full object-cover" 
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#34C759] ring-2 ring-white dark:ring-[#17212b]" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-xs truncate">{operatorName}</div>
              <div className="text-[10px] text-slate-400 font-mono truncate dir-ltr text-right">{operatorHandle}</div>
            </div>
          </div>

          <button 
            onClick={() => {
              if (onOpenInstallWizard) onOpenInstallWizard();
              if (onCloseMobile) onCloseMobile();
            }}
            className={`p-1.5 rounded-xl transition-colors shrink-0 ${
              isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-[#007AFF] hover:bg-white'
            }`}
            title={isFa ? 'ویزارد هاست محلی' : 'Host wizard'}
          >
            <LogOut className="w-4 h-4 rotate-180" />
          </button>
        </div>

        {/* Section: داشبورد */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <span className="text-[10px] font-semibold text-slate-400">{isFa ? 'داشبورد' : 'Dashboard'}</span>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>

          <div className="space-y-1">
            {dashboardNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25'
                      : (isDarkMode 
                          ? 'text-slate-300 hover:text-white hover:bg-[#17212b]' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge !== null && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive 
                        ? 'bg-white text-[#007AFF]' 
                        : item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Section: تنظیمات omni chat */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <span className="text-[10px] font-semibold text-slate-400">{isFa ? 'تنظیمات omni chat' : 'Settings'}</span>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>

          <div className="space-y-1">
            {settingsNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25'
                      : (isDarkMode 
                          ? 'text-slate-300 hover:text-white hover:bg-[#17212b]' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Section: استقلال ۱۰۰٪ و معماری */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-2 py-1">
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <span className="text-[10px] font-semibold text-slate-400">{isFa ? 'معماری سرور' : 'Architecture'}</span>
            <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>

          <div className="space-y-1">
            {sovereignNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25'
                      : (isDarkMode 
                          ? 'bg-[#34C759]/15 text-[#34C759] hover:bg-[#34C759]/25' 
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#34C759]'}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-[#34C759]/20 text-[#34C759] font-mono">
                    LOCAL
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Footer & Sun/Moon Mode Switcher */}
      <div className={`p-4 space-y-3 border-t transition-colors ${
        isDarkMode ? 'bg-[#111922] border-slate-800/80' : 'bg-white border-slate-100/80'
      }`}>
        <div className="flex items-center justify-center">
          <div className={`p-1 rounded-full flex items-center gap-1 shadow-inner ${
            isDarkMode ? 'bg-[#1e293b]' : 'bg-slate-100'
          }`}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={onToggleDarkMode ? onToggleDarkMode : undefined}
              className={`p-1.5 rounded-full transition-all ${
                !isDarkMode ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-400 hover:text-slate-200'
              }`}
              title={isFa ? 'حالت روشن' : 'Light mode'}
            >
              <Sun className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={onToggleDarkMode ? onToggleDarkMode : undefined}
              className={`p-1.5 rounded-full transition-all ${
                isDarkMode ? 'bg-[#007AFF] text-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title={isFa ? 'حالت تاریک' : 'Dark mode'}
            >
              <Moon className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-400 font-medium">
          {isFa ? 'تمامی حقوق متعلق به omni chat می‌باشد.' : 'All rights reserved by omni chat.'}
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar (Desktop & Large screens >= lg) */}
      <aside className={`hidden lg:flex w-68 flex-col justify-between shrink-0 select-none z-20 h-screen overflow-hidden transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-[#111922] text-slate-200 border-l border-slate-800' 
          : 'bg-white text-slate-700 border-l border-slate-200 shadow-xs'
      }`}>
        {renderSidebarContent()}
      </aside>

      {/* 2. Mobile & Tablet Slide-out Drawer (< lg) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop overlay (Solid dark overlay, no blur) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/70"
            />
            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: isFa ? 320 : -320 }}
              animate={{ x: 0 }}
              exit={{ x: isFa ? 320 : -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`relative w-72 max-w-[85vw] h-full flex flex-col justify-between shadow-2xl z-10 transition-colors ${
                isDarkMode 
                  ? 'bg-[#111922] text-slate-200 border-l border-slate-800' 
                  : 'bg-white text-slate-700'
              }`}
            >
              {renderSidebarContent()}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
