import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Smile, 
  CheckCircle, 
  Users, 
  Globe, 
  Smartphone, 
  Laptop,
  ArrowUpRight,
  Star
} from 'lucide-react';
import { Operator } from '../types';
import { motion } from 'motion/react';

interface AnalyticsViewProps {
  operators: Operator[];
  conversations?: any[];
  offlineLeads?: any[];
  language: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  operators,
  language,
  isDarkMode = false,
}) => {
  const isFa = language === 'fa';

  const hourlyVolume = [
    { hour: '۰۰:۰۰', chats: 8 },
    { hour: '۰۳:۰۰', chats: 3 },
    { hour: '۰۶:۰۰', chats: 6 },
    { hour: '۰۹:۰۰', chats: 42 },
    { hour: '۱۲:۰۰', chats: 68 },
    { hour: '۱۵:۰۰', chats: 84 },
    { hour: '۱۸:۰۰', chats: 96 },
    { hour: '۲۱:۰۰', chats: 58 },
  ];

  const topPages = [
    { url: '/checkout', title: 'صفحه تسویه حساب و نهایی‌سازی خرید', count: 342, rate: '۲۸٪' },
    { url: '/pricing', title: 'جدول قیمت‌ها و لایسنس‌های محصول', count: 289, rate: '۲۳٪' },
    { url: '/install-guide', title: 'راهنمای راه‌اندازی سریع در سرور', count: 184, rate: '۱۵٪' },
    { url: '/themes-preview', title: 'پیش‌نمایش تم اختصاصی Apple iOS Blue', count: 147, rate: '۱۲٪' },
    { url: '/wordpress-plugin', title: 'دانلود افزونه وردپرس چت آنلاین', count: 112, rate: '۹٪' },
  ];

  return (
    <div className={`flex-1 p-6 md:p-8 overflow-y-auto space-y-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0e1621] text-slate-100' : 'bg-[#f4f6f8] text-slate-800'
    }`}>
      
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-[#007AFF] text-white flex items-center justify-center shadow-md shadow-[#007AFF]/25">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {isFa ? 'تحلیل رفتار کاربران و گزارشات عملکرد' : 'Analytics & Behavioral Insights'}
          </h1>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isFa 
              ? 'آمار دقیق نرخ پاسخگویی، زمان انتظار، رضایت مشتریان و صفحات با بیشترین تبدیل'
              : 'Detailed metrics on response times, customer satisfaction, and high-conversion chat triggers'}
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: isFa ? 'میانگین زمان پاسخگویی' : 'Avg Response Time',
            value: '۲۴ ثانیه',
            delta: '۳۵٪ سریع‌تر از میانگین صنعت',
            icon: Clock,
            color: 'text-[#007AFF]',
            bgColor: 'bg-[#007AFF]/10',
          },
          {
            title: isFa ? 'شاخص رضایت مشتریان (CSAT)' : 'CSAT Satisfaction',
            value: '۹۸.۴٪',
            delta: 'بر پایه ۳۴۰ نظر در این ماه',
            icon: Smile,
            color: 'text-[#34C759]',
            bgColor: 'bg-[#34C759]/10',
          },
          {
            title: isFa ? 'نرخ تبدیل گفتگو به خرید' : 'Chat-to-Sale Conversion',
            value: '۲۲.۶٪',
            delta: '+۴.۲٪ رشد پس از فعال‌سازی پاسخ‌های آماده',
            icon: TrendingUp,
            color: 'text-[#AF52DE]',
            bgColor: 'bg-[#AF52DE]/10',
          },
          {
            title: isFa ? 'مجموع مکالمات موفق' : 'Total Resolved Chats',
            value: '۱,۴۲۰ چت',
            delta: '۱۰۰٪ ذخیره‌شده بر روی دیتابیس لوکال سرور',
            icon: CheckCircle,
            color: 'text-[#FF9500]',
            bgColor: 'bg-[#FF9500]/10',
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 350, damping: 25 }}
              className={`p-5 rounded-3xl transition-all ${
                isDarkMode 
                  ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)]' 
                  : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.title}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${kpi.bgColor} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-bold font-mono tracking-tight">{kpi.value}</div>
                <div className="text-[11px] font-medium text-emerald-500 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{kpi.delta}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hourly Volume & Top Converting Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Hourly Volume Chart */}
        <div className={`p-6 rounded-3xl transition-all ${
          isDarkMode 
            ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)]' 
            : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)]'
        }`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-sm">{isFa ? 'توزیع مکالمات بر حسب ساعات شبانه‌روز' : 'Hourly Conversation Volume'}</h3>
              <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isFa ? 'بیشترین ترافیک پشتیبانی بین ساعات ۱۵ الی ۱۹ رخ می‌دهد' : 'Peak traffic hours'}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#007AFF]/15 text-[#007AFF]">
              ۲۴ ساعته
            </span>
          </div>

          <div className="space-y-3">
            {hourlyVolume.map((item, idx) => {
              const pct = (item.chats / 96) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[11px]">{item.hour}</span>
                    <span className="font-mono font-bold text-[11px] text-[#007AFF]">{item.chats} چت</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-[#242f3d]' : 'bg-slate-100'}`}>
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-[#007AFF] to-[#0A84FF] transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Converting Pages */}
        <div className={`p-6 rounded-3xl transition-all ${
          isDarkMode 
            ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)]' 
            : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)]'
        }`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-sm">{isFa ? 'صفحات با بیشترین لید و درخواست چت' : 'High-Conversion Pages'}</h3>
              <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isFa ? 'محل‌هایی که مشتری بیشترین نیاز به مشاوره قبل از خرید دارد' : 'Pages where customers trigger support most frequently'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {topPages.map((page, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-2xl flex items-center justify-between gap-3 text-xs transition-colors ${
                  isDarkMode ? 'bg-[#242f3d]/60' : 'bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-semibold truncate">{page.title}</div>
                  <div className="text-[11px] font-mono text-slate-400 truncate dir-ltr text-right">
                    {page.url}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold font-mono text-[#007AFF]">{page.count} چت</div>
                  <div className="text-[10px] text-slate-400 font-mono">{page.rate} کل ترافیک</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
