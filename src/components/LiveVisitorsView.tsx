import React, { useState } from 'react';
import { Visitor } from '../types';
import { 
  Users, 
  Search, 
  MessageSquarePlus, 
  Globe, 
  Clock, 
  PlusCircle, 
  Laptop, 
  Smartphone,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface LiveVisitorsViewProps {
  visitors: Visitor[];
  onInitiateChat?: (visitor: Visitor) => void;
  onStartChatWithVisitor?: (visitor: Visitor) => void;
  onSimulateNewVisitor?: () => void;
  language: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const LiveVisitorsView: React.FC<LiveVisitorsViewProps> = ({
  visitors,
  onInitiateChat,
  onStartChatWithVisitor,
  onSimulateNewVisitor,
  language,
  isDarkMode = false,
}) => {
  const isFa = language === 'fa';
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'browsing' | 'chatting' | 'idle'>('all');

  const filteredVisitors = visitors.filter((v) => {
    if (filterStatus !== 'all' && v.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.ip.includes(q) ||
        v.currentUrl.toLowerCase().includes(q) ||
        v.pageTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className={`flex-1 p-6 md:p-8 overflow-y-auto space-y-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0e1621] text-slate-100' : 'bg-[#f4f6f8] text-slate-800'
    }`}>
      
      {/* Page Header (macOS window style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#34C759] text-white flex items-center justify-center shadow-md shadow-[#34C759]/25">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {isFa ? 'بازدیدکنندگان زنده سایت' : 'Real-time Visitors'}
                </h1>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34C759]"></span>
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isFa 
                  ? 'رصد بدون واسطه بازدیدکنندگان در حال گشت‌وگذار و امکان ارسال دعوت هوشمند چت'
                  : 'Real-time visitor monitoring and direct proactive chat invitations'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSimulateNewVisitor}
          className="px-4 py-2.5 bg-[#007AFF] hover:bg-[#0071e3] text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-[#007AFF]/25 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isFa ? 'شبیه‌سازی ورود کاربر جدید' : 'Simulate Visitor'}</span>
        </motion.button>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className={`p-3 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDarkMode ? 'bg-[#17212b]' : 'bg-white shadow-xs'
      }`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'browsing', 'chatting', 'idle'] as const).map((st) => {
            const labels = {
              all: isFa ? 'همه' : 'All',
              browsing: isFa ? 'در حال بازدید' : 'Browsing',
              chatting: isFa ? 'در حال گفتگو' : 'Chatting',
              idle: isFa ? 'غیرفعال' : 'Idle',
            };
            const active = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-[#242f3d]' : 'text-slate-600 hover:bg-slate-100')
                }`}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[220px]">
          <input
            type="text"
            placeholder={isFa ? 'جستجوی نام، شهر، IP یا صفحه...' : 'Search visitor...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full text-xs pr-8 pl-3 py-2 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#007AFF]/30 transition-all ${
              isDarkMode ? 'bg-[#242f3d] text-white placeholder-slate-400' : 'bg-slate-100/80 text-slate-800 placeholder-slate-400'
            }`}
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Visitors Cards Grid (Telegram macOS style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVisitors.map((visitor, index) => {
          const isDesktop = visitor.device.toLowerCase().includes('desktop') || visitor.device.toLowerCase().includes('mac');
          return (
            <motion.div
              key={visitor.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, type: 'spring', stiffness: 350, damping: 25 }}
              className={`p-5 rounded-3xl transition-all relative overflow-hidden flex flex-col justify-between ${
                isDarkMode 
                  ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-[#1f2b38]' 
                  : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)]'
              }`}
            >
              <div className="space-y-3">
                {/* Top Info Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#34C759] to-[#30D158] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {visitor.name.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm">{visitor.name}</span>
                        <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                      </div>
                      <div className={`text-[11px] flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Globe className="w-3 h-3 text-[#007AFF]" />
                        <span>{visitor.city}، {visitor.country}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                    visitor.status === 'chatting'
                      ? 'bg-[#007AFF]/15 text-[#007AFF]'
                      : visitor.status === 'browsing'
                      ? 'bg-[#34C759]/15 text-[#34C759]'
                      : (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500')
                  }`}>
                    {visitor.status === 'chatting' ? (isFa ? 'در چت' : 'Chatting') : visitor.status === 'browsing' ? (isFa ? 'مشاهده' : 'Browsing') : (isFa ? 'معلق' : 'Idle')}
                  </span>
                </div>

                {/* Page info */}
                <div className={`p-3 rounded-2xl text-xs space-y-1 ${
                  isDarkMode ? 'bg-[#242f3d]/60 text-slate-300' : 'bg-slate-50 text-slate-700'
                }`}>
                  <div className="font-semibold truncate">{visitor.pageTitle}</div>
                  <div className="text-[11px] font-mono text-slate-400 truncate dir-ltr text-right">
                    {visitor.currentUrl}
                  </div>
                </div>

                {/* Device & Time */}
                <div className={`flex items-center justify-between text-[11px] ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <div className="flex items-center gap-1.5">
                    {isDesktop ? <Laptop className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                    <span>{visitor.device}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{visitor.timeOnSiteMinutes} دقیقه در سایت</span>
                  </div>
                </div>
              </div>

              {/* Proactive Chat Trigger Button */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (onStartChatWithVisitor) onStartChatWithVisitor(visitor);
                    else if (onInitiateChat) onInitiateChat(visitor);
                  }}
                  className="w-full py-2 bg-[#007AFF] hover:bg-[#0071e3] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-sm shadow-[#007AFF]/25 transition-all"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>{isFa ? 'ارسال دعوت به گفتگوی اختصاصی' : 'Invite to Chat'}</span>
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
};
