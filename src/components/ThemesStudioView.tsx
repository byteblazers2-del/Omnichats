import React, { useState } from 'react';
import { 
  ThemeConfig, 
  WidgetRadius, 
  LauncherShape, 
  LauncherIcon, 
  HeaderStyle, 
  BubbleStyle,
  ChatPattern,
  LayoutStyle,
  LauncherStyle
} from '../types';
import { mockThemes, themeCategories, flagshipTemplates, FlagshipTemplate } from '../data/mockThemes';
import { 
  Palette, 
  Search, 
  Check, 
  Sliders, 
  Copy, 
  Eye, 
  Sparkles, 
  MessageSquare, 
  Headphones, 
  Square, 
  Circle,
  Sun,
  Moon,
  CheckCircle2,
  Grid,
  Zap,
  HelpCircle,
  Radio,
  Clock,
  ShieldCheck,
  CheckCheck,
  Layers,
  Layout,
  Terminal,
  Crown
} from 'lucide-react';
import { motion } from 'motion/react';
import { ChatWallpaperPattern } from './ChatWallpaperPattern';

interface ThemesStudioViewProps {
  currentTheme: ThemeConfig;
  onSelectTheme: (theme: ThemeConfig) => void;
  onUpdateCurrentTheme?: (updates: Partial<ThemeConfig>) => void;
  onUpdateTheme?: (updates: Partial<ThemeConfig>) => void;
  language: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const ThemesStudioView: React.FC<ThemesStudioViewProps> = ({
  currentTheme,
  onSelectTheme,
  onUpdateCurrentTheme: onUpdateCurrentThemeProp,
  onUpdateTheme: onUpdateThemeProp,
  language,
  isDarkMode = false,
}) => {
  const handleUpdateTheme = (updates: Partial<ThemeConfig>) => {
    if (onUpdateCurrentThemeProp) onUpdateCurrentThemeProp(updates);
    else if (onUpdateThemeProp) onUpdateThemeProp(updates);
  };
  const onUpdateCurrentTheme = handleUpdateTheme;
  const isFa = language === 'fa';
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'templates' | 'gallery' | 'customizer'>('templates');
  const [copiedCode, setCopiedCode] = useState(false);

  const filteredThemes = mockThemes.filter((t) => {
    if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.nameFa.toLowerCase().includes(q) ||
        t.categoryFa.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyCSS = () => {
    const cssVars = `/* omni chat Production CSS & Pattern Configuration */
:root {
  --omni-primary: ${currentTheme.primaryColor};
  --omni-accent: ${currentTheme.accentColor};
  --omni-text: ${currentTheme.textColor};
  --omni-radius: ${
    currentTheme.widgetRadius === 'none' ? '0px' :
    currentTheme.widgetRadius === 'sm' ? '12px' :
    currentTheme.widgetRadius === 'md' ? '18px' :
    currentTheme.widgetRadius === 'lg' ? '24px' : '32px'
  };
  --omni-pattern: "${currentTheme.pattern || 'none'}";
  --omni-pattern-opacity: ${currentTheme.patternOpacity || 0.08};
  --omni-layout: "${currentTheme.layoutStyle || 'telegram-mac'}";
  --omni-launcher: "${currentTheme.launcherStyle || 'pill-expanded'}";
  --omni-bubble: "${currentTheme.bubbleStyle || 'telegram'}";
}`;
    navigator.clipboard.writeText(cssVars);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const patternOptions: { id: ChatPattern; nameFa: string; nameEn: string; descFa: string }[] = [
    { id: 'telegram-doodle', nameFa: 'دودل تلگرام', nameEn: 'Telegram Doodle', descFa: 'طرح دست‌کشیده و آیکون‌های نمادین پیام‌رسانی' },
    { id: 'mesh-aura', nameFa: 'گرادیان شیشه‌ای اپل', nameEn: 'Apple Mesh Aura', descFa: 'هاله‌های نوری ملایم و مدرن Glassmorphic' },
    { id: 'dots', nameFa: 'نقطه‌چین سوئیسی', nameEn: 'Swiss Dot Matrix', descFa: 'ماتریس نقطه‌ای منظم و مینیمال' },
    { id: 'geometric-cubes', nameFa: 'کیوب‌های سه‌بعدی', nameEn: 'Isometric 3D Cubes', descFa: 'مکعب‌های ایزومتریک مدرن هندسی' },
    { id: 'circuit', nameFa: 'مدار الکترونیک و سایبر', nameEn: 'Cyber Circuit', descFa: 'خطوط برد الکترونیکی برای سایت‌های فنی و تکنولوژی' },
    { id: 'blueprint', nameFa: 'بلوپرینت مهندسی', nameEn: 'Blueprint Grid', descFa: 'شبکه شطرنجی نقشه‌کشی و معماری' },
    { id: 'topography', nameFa: 'کانتور توپوگرافی', nameEn: 'Topography Contours', descFa: 'خطوط ارتفاعی ارگانیک و پویا' },
    { id: 'stars-constellation', nameFa: 'ستارگان و کهکشان', nameEn: 'Constellations', descFa: 'ستاره‌های درخشان و صور فلکی لوکس' },
    { id: 'moroccan-arabesque', nameFa: 'نقوش اسلیمی اصیل', nameEn: 'Arabesque Star', descFa: 'هندسه اسلیمی ایرانی برای برندهای فاخر' },
    { id: 'none', nameFa: 'ساده بدون پترن', nameEn: 'Clean Solid', descFa: 'صفحه شفاف و بدون هیچ‌گونه طرح پس‌زمینه' },
  ];

  const layoutOptions: { id: LayoutStyle; nameFa: string; nameEn: string; descFa: string }[] = [
    { id: 'telegram-mac', nameFa: 'تلگرام مک دسکتاپ', nameEn: 'Telegram macOS', descFa: 'حباب‌های سبک تلگرام، تیک‌های دوتایی و اینپوت کپسولی' },
    { id: 'ios-glass', nameFa: 'شیشه‌ای مات آی‌او‌اس', nameEn: 'Apple iOS Glass', descFa: 'افکت بلور و لایه‌های شیشه‌ای با هایلایت نرم' },
    { id: 'neo-card', nameFa: 'کارت نئو ساس مدرن', nameEn: 'Neo-Card SaaS', descFa: 'بنر خوش‌آمدگویی اپراتورها و چیپ‌های راهنمای سریع' },
    { id: 'terminal-geek', nameFa: 'ترمینال دولوپر و تک', nameEn: 'Developer Dark CLI', descFa: 'استایل مونو با پرامپت خط فرمان و تم سبز فسفری' },
    { id: 'luxury-concierge', nameFa: 'کنسیرژ هتل و خدمات لوکس', nameEn: 'Luxury Concierge', descFa: 'طراحی ویژه برندهای گران‌قیمت با المان‌های طلایی' },
    { id: 'compact-dock', nameFa: 'داک کامپکت مینیمال', nameEn: 'Compact Dock', descFa: 'ارتفاع کمتر برای پرسش و پاسخ‌های فوق‌سریع' },
  ];

  const bubbleOptions: { id: BubbleStyle; nameFa: string; descFa: string }[] = [
    { id: 'telegram', nameFa: 'تلگرام (با ساعت و تیک)', descFa: 'گوشه‌های نامتقارن با ساعت و تیک دوتایی درون حباب' },
    { id: 'ios', nameFa: 'پیام‌رسان iOS اپل', descFa: 'گوشه‌های پیوسته ۱۸ پیکسلی با دم خمیده ملایم' },
    { id: 'modern-pill', nameFa: 'کپسولی مدرن (Pill)', descFa: 'حباب‌های کاملاً بیضی و کپسولی فوق‌مدرن' },
    { id: 'floating-card', nameFa: 'کارت شناور بدون مرز', descFa: 'کارت‌های شناور با سایه محو بدون هیچ خط مرزی' },
    { id: 'sharp-minimal', nameFa: 'مینیمال تیز (Sharp)', descFa: 'لبه‌های کوچک ۶ پیکسلی برای تم‌های رسمی و مهندسی' },
    { id: 'rounded', nameFa: 'گرد کلاسیک', descFa: 'فرم استاندارد و همه‌پسند چت وب' },
  ];

  const launcherOptions: { id: LauncherStyle; nameFa: string; descFa: string }[] = [
    { id: 'pill-expanded', nameFa: 'کپسول عریض با آواتارها', descFa: 'نمایش آواتار اپراتورهای آنلاین + متن دعوت به گفتگو' },
    { id: 'glow-pulse', nameFa: 'هاله نور نئونی درخشان', descFa: 'دکمه شناور دارای هاله نوری انیمیشنی چشم‌نواز' },
    { id: 'circle', nameFa: 'دکمه گرد کلاسیک شناور', descFa: 'دکمه استاندارد با آیکون چت و نشانگر پیام‌های خوانده‌نشده' },
    { id: 'minimal-dock', nameFa: 'داک شناور مک', descFa: 'دکمه افقی جمع‌وجور شبیه داک سیستم‌عامل مک' },
  ];

  return (
    <div className={`flex-1 p-6 md:p-8 overflow-y-auto space-y-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0e1621] text-slate-100' : 'bg-[#f4f6f8] text-slate-800'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#007AFF] text-white flex items-center justify-center shadow-md shadow-[#007AFF]/25">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  {isFa ? 'استودیو قالب‌ها، پترن‌ها و معماری ویجت چت' : 'Chat Themes, Patterns & Architectural Studio'}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#007AFF] text-white font-mono">
                  {mockThemes.length} PRESETS
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isFa
                  ? 'شخصی‌سازی نامحدود ظاهر سمت کاربر: انواع پترن‌های وکتور، سبک‌های ساختاری تلگرام و iOS، حباب‌ها و لانچرهای متنوع'
                  : 'Customize patterns, layout engines, bubble physics, and launchers with instant real-time live preview.'}
              </p>
            </div>
          </div>
        </div>

        {/* Tab switch */}
        {/* Segmented Mode Switcher - Crafted Physical Track */}
        <div className={`flex items-center gap-1 p-1 rounded-2xl border shadow-inner ${
          isDarkMode 
            ? 'bg-[#121a24] border-white/10' 
            : 'bg-slate-200/60 border-slate-300/40'
        }`}>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'templates'
                ? (isDarkMode 
                    ? 'bg-[#242f3d] text-white border border-white/10 shadow-xs' 
                    : 'bg-white text-slate-900 border border-slate-200 shadow-xs')
                : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>{isFa ? 'معماری‌های ویجت (Templates)' : 'User Templates'}</span>
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'gallery'
                ? (isDarkMode 
                    ? 'bg-[#242f3d] text-white border border-white/10 shadow-xs' 
                    : 'bg-white text-slate-900 border border-slate-200 shadow-xs')
                : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>{isFa ? 'کاتالوگ رنگ‌ها (۱۰۸ تم)' : 'Color Catalog'}</span>
          </button>
          <button
            onClick={() => setActiveTab('customizer')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'customizer'
                ? (isDarkMode 
                    ? 'bg-[#242f3d] text-white border border-white/10 shadow-xs' 
                    : 'bg-white text-slate-900 border border-slate-200 shadow-xs')
                : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>{isFa ? 'شخصی‌سازی دقیق استودیو' : 'Deep Customizer'}</span>
          </button>
        </div>
      </div>

      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Banner Info */}
          <div className={`p-6 rounded-3xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 border ${
            isDarkMode 
              ? 'bg-[#17212b] border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-white' 
              : 'bg-white border-slate-200/80 shadow-[0_2px_14px_rgba(15,23,42,0.04)] text-slate-800'
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center shadow-lg shadow-[#007AFF]/25 shrink-0">
                <Layout className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-2">
                  <span>{isFa ? 'قالب‌ها و معماری‌های اختصاصی ویجت سمت کاربر' : 'Flagship Client Chat Templates'}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#007AFF]/15 text-[#007AFF] font-mono font-bold">
                    {flagshipTemplates.length} READY ARCHITECTURES
                  </span>
                </h2>
                <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isFa
                    ? 'تغییر کامل ساختار پنجره، پترن‌های پس‌زمینه وکتور (دودل تلگرام، مش شیشه‌ای، کانتور، مدار و بلوپرینت)، فیزیک حباب‌های پیام، تیک‌های تحویل و دکمه‌های لانچر تنها با یک کلیک.'
                    : 'Complete transformation of layout, vector wallpaper patterns, message bubble physics, and launchers with zero external dependencies.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleCopyCSS}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all flex items-center gap-2 shrink-0 ${
                isDarkMode 
                  ? 'bg-[#242f3d] border-white/10 text-slate-200 hover:bg-[#2c394a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3.5 h-3.5 text-[#007AFF]" />}
              <span>{copiedCode ? (isFa ? 'کپی شد!' : 'Copied!') : (isFa ? 'کپی کدهای تم و پترن' : 'Copy CSS')}</span>
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {flagshipTemplates.map((tpl) => {
              const isActive =
                currentTheme.layoutStyle === tpl.theme.layoutStyle &&
                (currentTheme.pattern === tpl.theme.pattern || (!tpl.theme.pattern && currentTheme.pattern === 'none'));

              return (
                <div
                  key={tpl.id}
                  className={`rounded-3xl border transition-all flex flex-col overflow-hidden relative ${
                    isActive
                      ? 'border-[#007AFF] ring-2 ring-[#007AFF]/30 shadow-xl'
                      : (isDarkMode ? 'border-white/10 bg-[#17212b] hover:border-white/20' : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-xs')
                  }`}
                >
                  {/* Top Header Card */}
                  <div className="p-5 pb-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#007AFF]/15 text-[#007AFF]">
                        {tpl.tagFa}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#34C759] text-white flex items-center gap-1 shadow-2xs">
                          <Check className="w-3 h-3" />
                          <span>{isFa ? 'فعال روی وب‌سایت' : 'Active'}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold truncate">{tpl.nameFa}</h3>
                    <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {tpl.descriptionFa}
                    </p>
                  </div>

                  {/* Live Interactive Mini Simulator Window */}
                  <div className="px-5 py-2 flex-1">
                    <div
                      className="w-full h-64 rounded-2xl border shadow-inner overflow-hidden relative flex flex-col justify-between transition-all"
                      style={{
                        backgroundColor: tpl.theme.bgMode === 'dark' ? '#17212b' : '#ffffff',
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                      }}
                    >
                      {/* Background Pattern */}
                      <ChatWallpaperPattern
                        pattern={tpl.theme.pattern || 'none'}
                        opacity={tpl.theme.patternOpacity || 0.08}
                        isDark={tpl.theme.bgMode === 'dark'}
                        color={tpl.theme.primaryColor}
                      />

                      {/* Simulated Header */}
                      <div
                        className="p-2.5 text-white flex items-center justify-between shrink-0 relative z-10 shadow-xs"
                        style={{
                          backgroundColor: tpl.theme.headerStyle === 'minimal'
                            ? (tpl.theme.bgMode === 'dark' ? '#1e2c3a' : '#f8fafc')
                            : tpl.theme.primaryColor,
                          color: tpl.theme.headerStyle === 'minimal'
                            ? (tpl.theme.bgMode === 'dark' ? '#f4f4f5' : '#18181b')
                            : tpl.theme.textColor,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {tpl.id === 'terminal-geek' ? (
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                              <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                              <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                              OC
                            </div>
                          )}
                          <span className="text-[11px] font-bold truncate">
                            {tpl.id === 'terminal-geek' ? 'omnichat_daemon_v3' : tpl.nameFa.split('(')[0]}
                          </span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-[#34C759]" />
                      </div>

                      {/* Simulated Messages */}
                      <div className="p-3 space-y-2 overflow-hidden text-[11px] relative z-10 flex-1 flex flex-col justify-end">
                        {/* Operator bubble */}
                        <div className="flex justify-start">
                          <div
                            className={`p-2 max-w-[85%] shadow-xs leading-tight ${
                              tpl.theme.bgMode === 'dark' ? 'bg-[#242f3d] text-slate-100' : 'bg-white text-slate-800'
                            }`}
                            style={{
                              borderRadius: tpl.theme.bubbleStyle === 'sharp-minimal' ? '4px' : tpl.theme.bubbleStyle === 'modern-pill' ? '18px' : '12px',
                            }}
                          >
                            <p>{isFa ? 'درود! چطور می‌تونم راهنماییتون کنم؟' : 'Hello! How can I assist you?'}</p>
                            <div className="flex items-center justify-end gap-1 mt-0.5 text-[8px] opacity-60 font-mono">
                              <span>۱۰:۴۰</span>
                              <CheckCheck className="w-2.5 h-2.5 text-[#007AFF]" />
                            </div>
                          </div>
                        </div>

                        {/* Visitor bubble */}
                        <div className="flex justify-end">
                          <div
                            className="p-2 max-w-[85%] shadow-xs leading-tight text-white"
                            style={{
                              backgroundColor: tpl.theme.primaryColor,
                              borderRadius: tpl.theme.bubbleStyle === 'sharp-minimal' ? '4px' : tpl.theme.bubbleStyle === 'modern-pill' ? '18px' : '12px',
                            }}
                          >
                            <p>{isFa ? 'می‌خواستم اطلاعات خرید بگیرم' : 'Wanted to ask for product info'}</p>
                            <div className="flex items-center justify-end gap-1 mt-0.5 text-[8px] opacity-80 font-mono">
                              <span>۱۰:۴۲</span>
                              <CheckCheck className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        </div>

                        {/* Sample prompt chips */}
                        <div className="flex gap-1 overflow-hidden pt-1">
                          {tpl.theme.quickPrompts?.slice(0, 2).map((pr, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full text-[9px] truncate bg-[#007AFF]/15 text-[#007AFF] font-medium"
                            >
                              {pr}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Simulated Input */}
                      <div className="p-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between bg-black/5 dark:bg-white/5 relative z-10">
                        <span className="text-[10px] opacity-50 px-1">{isFa ? 'پیام خود را بنویسید...' : 'Type message...'}</span>
                        <div
                          className="w-5 h-5 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: tpl.theme.primaryColor }}
                        >
                          <Sparkles className="w-2.5 h-2.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="p-5 pt-2 space-y-3">
                    <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-black/5 dark:border-white/5 text-[10px]">
                      {tpl.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Check className="w-3 h-3 text-[#34C759] shrink-0" />
                          <span className={`truncate ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons - Distinctive Anti-AI Aesthetic */}
                    <div className="pt-2 flex items-center gap-2">
                      {isActive ? (
                        <div className="flex-1 py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 select-none">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                          <span>{isFa ? 'قالب فعال روی وب‌سایت' : 'Active Template'}</span>
                          <Check className="w-3.5 h-3.5 mr-auto text-emerald-500" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectTheme({
                              ...currentTheme,
                              ...tpl.theme,
                              id: tpl.theme.id || currentTheme.id,
                            });
                          }}
                          className="flex-1 py-2 px-3.5 rounded-xl text-xs font-bold text-white bg-gradient-to-b from-[#0A84FF] to-[#007AFF] hover:from-[#1b8eff] hover:to-[#0071e3] active:translate-y-px border border-blue-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_6px_rgba(0,122,255,0.3)] transition-all flex items-center justify-center gap-2"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isFa ? 'اعمال این قالب روی سایت' : 'Apply This Template'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onSelectTheme({
                            ...currentTheme,
                            ...tpl.theme,
                            id: tpl.theme.id || currentTheme.id,
                          });
                          setActiveTab('customizer');
                        }}
                        className={`p-2 rounded-xl border transition-all shadow-2xs active:translate-y-px ${
                          isDarkMode
                            ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                        title={isFa ? 'سفارشی‌سازی دقیق این قالب' : 'Customize in Studio'}
                      >
                        <Sliders className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="space-y-5">
          {/* Active Theme Bar */}
          <div className={`p-5 rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isDarkMode ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)] text-white' : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)] text-slate-800'
          }`}>
            <div className="flex items-center gap-3.5">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shadow-[#007AFF]/20"
                style={{ backgroundColor: currentTheme.primaryColor }}
              >
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <div className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  {isFa ? 'تم فعال فعلی روی وب‌سایت:' : 'Current Active Theme:'}
                </div>
                <div className="text-base font-bold flex items-center gap-2 mt-0.5">
                  <span>{currentTheme.nameFa}</span>
                  <span className="text-xs font-normal opacity-60 font-mono">({currentTheme.name})</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[#007AFF]">
                  <span className="px-2 py-0.5 rounded-full bg-[#007AFF]/10">پترن: {currentTheme.pattern || 'none'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#007AFF]/10">سبک: {currentTheme.layoutStyle || 'telegram-mac'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('customizer')}
                className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-colors flex items-center gap-2 ${
                  isDarkMode ? 'bg-[#242f3d] text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>{isFa ? 'شخصی‌سازی دقیق این تم' : 'Customize This Theme'}</span>
              </button>
              <button
                onClick={handleCopyCSS}
                className={`px-4 py-2 text-xs font-semibold rounded-2xl transition-colors flex items-center gap-2 ${
                  isDarkMode ? 'bg-[#242f3d] text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3.5 h-3.5 text-[#007AFF]" />}
                <span>{copiedCode ? (isFa ? 'کپی شد!' : 'Copied!') : (isFa ? 'کپی کدهای تم و پترن' : 'Copy CSS')}</span>
              </button>
            </div>
          </div>

          {/* Categories Filters & Search */}
          <div className="space-y-3">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder={isFa ? 'جستجو بر اساس نام قالب، پترن، رنگ...' : 'Search themes by name or pattern...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full text-xs pr-10 pl-3 py-2.5 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#007AFF]/30 transition-all ${
                  isDarkMode ? 'bg-[#242f3d] text-white placeholder-slate-400' : 'bg-white text-slate-800 placeholder-slate-400 shadow-2xs'
                }`}
              />
            </div>

            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
              {themeCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#007AFF] text-white shadow-xs'
                      : (isDarkMode ? 'bg-[#17212b] text-slate-400 hover:text-white' : 'bg-white text-slate-600 shadow-2xs hover:bg-slate-50')
                  }`}
                >
                  {cat.nameFa}
                </button>
              ))}
            </div>
          </div>

          {/* Themes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredThemes.map((theme) => {
              const isActive = currentTheme.id === theme.id;

              return (
                <div
                  key={theme.id}
                  className={`rounded-3xl transition-all overflow-hidden flex flex-col ${
                    isActive
                      ? 'ring-2 ring-[#007AFF] shadow-lg shadow-[#007AFF]/15'
                      : (isDarkMode ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-[#1f2b38]' : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)] hover:shadow-md')
                  }`}
                >
                  {/* Miniature Widget Preview with Live Vector Pattern */}
                  <div className={`p-3.5 border-b flex flex-col justify-between h-36 relative select-none overflow-hidden ${
                    isDarkMode ? 'bg-[#0e1621] border-slate-800/60' : 'bg-slate-100/70 border-slate-100'
                  }`}>
                    {/* Pattern Overlay in mini card */}
                    <ChatWallpaperPattern
                      pattern={theme.pattern || 'none'}
                      opacity={theme.patternOpacity || 0.1}
                      isDark={theme.bgMode === 'dark'}
                      color={theme.primaryColor}
                    />

                    {/* Mini Header */}
                    <div 
                      className="px-2.5 py-1.5 rounded-xl flex items-center justify-between text-white text-[10px] font-semibold shadow-xs relative z-10"
                      style={{ backgroundColor: theme.primaryColor, color: theme.textColor }}
                    >
                      <span className="truncate">{theme.nameFa}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                    </div>

                    {/* Mini message bubbles */}
                    <div className="space-y-1.5 my-auto relative z-10">
                      <div className="flex justify-start">
                        <span 
                          className={`text-[9px] px-2.5 py-1 max-w-[80%] rounded-xl shadow-2xs leading-tight ${
                            theme.bgMode === 'dark' ? 'bg-[#242f3d] text-slate-100' : 'bg-white text-slate-800'
                          }`}
                        >
                          {isFa ? 'سلام، سوالی دارید؟' : 'Hello, can we help?'}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        <span 
                          className="text-[9px] px-2.5 py-1 max-w-[80%] rounded-xl text-white shadow-2xs leading-tight flex items-center gap-1"
                          style={{ backgroundColor: theme.primaryColor, color: theme.textColor }}
                        >
                          <span>{isFa ? 'بله، تشکر' : 'Yes, thanks'}</span>
                          <CheckCheck className="w-2.5 h-2.5 opacity-80" />
                        </span>
                      </div>
                    </div>

                    {/* Mini Launcher in bottom corner */}
                    <div className="flex justify-end relative z-10">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] shadow-xs"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        <MessageSquare className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                  {/* Theme Info & Action */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-bold truncate">{theme.nameFa}</h4>
                        <span className="text-[10px] font-mono text-slate-400">{theme.primaryColor}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono">
                          {theme.pattern || 'none'}
                        </span>
                        <span className="truncate">{theme.layoutStyle || 'mac'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20 shadow-2xs"
                          style={{ backgroundColor: theme.primaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border border-white/20 shadow-2xs"
                          style={{ backgroundColor: theme.accentColor }}
                        />
                        <span className="text-[10px] text-slate-400 capitalize">{theme.bgMode}</span>
                      </div>

                      {isActive ? (
                        <div className="px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                          <span>{isFa ? 'فعال' : 'Active'}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onSelectTheme(theme)}
                          className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-gradient-to-b from-[#0A84FF] to-[#007AFF] hover:from-[#1b8eff] hover:to-[#0071e3] active:translate-y-px border border-blue-400/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_4px_rgba(0,122,255,0.25)] transition-all"
                        >
                          {isFa ? 'اعمال' : 'Apply'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'customizer' && (
        /* Customizer Studio Tab with Pattern & Architecture Controls */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className={`lg:col-span-2 rounded-3xl p-6 space-y-6 transition-all ${
            isDarkMode ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)]'
          }`}>
            
            <div className="border-b pb-4 border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">
                  {isFa ? 'شخصی‌سازی پترن، ساختار و تعاملات سمت کاربر' : 'Customizer Studio'}
                </h3>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isFa ? 'تنظیمات به صورت زنده بر روی ویجت چت سمت راست و گوشه صفحه اعمال می‌شوند' : 'Live tweaks update the widget simulator immediately'}
                </p>
              </div>
            </div>

            {/* 1. Background Vector Patterns */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-[#007AFF]" />
                  <span>{isFa ? 'پترن و تصویر پس‌زمینه گفتگو (Chat Wallpaper Pattern)' : 'Wallpaper Pattern'}</span>
                </h4>
                <span className="text-[11px] font-mono text-[#007AFF] font-bold">
                  {currentTheme.pattern || 'none'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {patternOptions.map((pat) => {
                  const isSelected = (currentTheme.pattern || 'none') === pat.id;
                  return (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => onUpdateCurrentTheme({ pattern: pat.id })}
                      className={`p-3 rounded-2xl text-right transition-all relative overflow-hidden flex flex-col justify-between h-20 ${
                        isSelected
                          ? 'ring-2 ring-[#007AFF] bg-[#007AFF]/10 shadow-xs'
                          : (isDarkMode ? 'bg-[#242f3d] hover:bg-[#2c3847]' : 'bg-slate-50 hover:bg-slate-100')
                      }`}
                    >
                      <div className="font-bold text-xs">{pat.nameFa}</div>
                      <div className={`text-[10px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {pat.descFa}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pattern Opacity Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold">{isFa ? 'شدت و وضوح پترن پس‌زمینه:' : 'Pattern Opacity:'}</span>
                  <span className="font-mono text-[#007AFF] font-bold">
                    {Math.round((currentTheme.patternOpacity || 0.08) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.02"
                  max="0.25"
                  step="0.01"
                  value={currentTheme.patternOpacity || 0.08}
                  onChange={(e) => onUpdateCurrentTheme({ patternOpacity: parseFloat(e.target.value) })}
                  className="w-full accent-[#007AFF] cursor-pointer"
                />
              </div>
            </div>

            {/* 2. Layout & Architectural Styles */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-[#007AFF]" />
                <span>{isFa ? 'سبک ساختار و معماری پنجره چت (Layout Engine)' : 'Layout Engine'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {layoutOptions.map((layout) => {
                  const isSelected = (currentTheme.layoutStyle || 'telegram-mac') === layout.id;
                  return (
                    <button
                      key={layout.id}
                      type="button"
                      onClick={() => onUpdateCurrentTheme({ layoutStyle: layout.id })}
                      className={`p-3 rounded-2xl text-right transition-all ${
                        isSelected
                          ? 'ring-2 ring-[#007AFF] bg-[#007AFF]/10 shadow-xs'
                          : (isDarkMode ? 'bg-[#242f3d] hover:bg-[#2c3847]' : 'bg-slate-50 hover:bg-slate-100')
                      }`}
                    >
                      <div className="font-bold text-xs">{layout.nameFa}</div>
                      <div className={`text-[11px] mt-0.5 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {layout.descFa}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Bubble Styles */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-[#007AFF]" />
                <span>{isFa ? 'استایل حباب‌های پیام (Message Bubbles)' : 'Bubble Physics'}</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {bubbleOptions.map((bs) => {
                  const isSelected = (currentTheme.bubbleStyle || 'telegram') === bs.id;
                  return (
                    <button
                      key={bs.id}
                      type="button"
                      onClick={() => onUpdateCurrentTheme({ bubbleStyle: bs.id })}
                      className={`p-3 rounded-2xl text-right transition-all ${
                        isSelected
                          ? 'ring-2 ring-[#007AFF] bg-[#007AFF]/10 shadow-xs'
                          : (isDarkMode ? 'bg-[#242f3d] hover:bg-[#2c3847]' : 'bg-slate-50 hover:bg-slate-100')
                      }`}
                    >
                      <div className="font-bold text-xs">{bs.nameFa}</div>
                      <div className={`text-[10px] mt-0.5 truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {bs.descFa}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Launcher Styles */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#007AFF]" />
                <span>{isFa ? 'سبک دکمه بازکننده چت (Launcher Button)' : 'Launcher Style'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {launcherOptions.map((lo) => {
                  const isSelected = (currentTheme.launcherStyle || 'pill-expanded') === lo.id;
                  return (
                    <button
                      key={lo.id}
                      type="button"
                      onClick={() => onUpdateCurrentTheme({ launcherStyle: lo.id })}
                      className={`p-3 rounded-2xl text-right transition-all ${
                        isSelected
                          ? 'ring-2 ring-[#007AFF] bg-[#007AFF]/10 shadow-xs'
                          : (isDarkMode ? 'bg-[#242f3d] hover:bg-[#2c3847]' : 'bg-slate-50 hover:bg-slate-100')
                      }`}
                    >
                      <div className="font-bold text-xs">{lo.nameFa}</div>
                      <div className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {lo.descFa}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Colors & Light/Dark */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold">{isFa ? 'پالت رنگ و حالت تیره/روشن' : 'Color Scheme'}</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs block mb-1.5 font-medium">{isFa ? 'رنگ اصلی (Primary):' : 'Primary:'}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.primaryColor}
                      onChange={(e) => onUpdateCurrentTheme({ primaryColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={currentTheme.primaryColor}
                      onChange={(e) => onUpdateCurrentTheme({ primaryColor: e.target.value })}
                      className={`w-full text-xs px-3 py-2 rounded-xl font-mono ${
                        isDarkMode ? 'bg-[#242f3d] text-white' : 'bg-slate-100 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs block mb-1.5 font-medium">{isFa ? 'رنگ حباب اپراتور (Accent):' : 'Accent:'}</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentTheme.accentColor}
                      onChange={(e) => onUpdateCurrentTheme({ accentColor: e.target.value })}
                      className="w-10 h-10 rounded-xl border cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={currentTheme.accentColor}
                      onChange={(e) => onUpdateCurrentTheme({ accentColor: e.target.value })}
                      className={`w-full text-xs px-3 py-2 rounded-xl font-mono ${
                        isDarkMode ? 'bg-[#242f3d] text-white' : 'bg-slate-100 text-slate-800'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs block mb-1.5 font-medium">{isFa ? 'حالت پنجره:' : 'Mode:'}</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateCurrentTheme({ bgMode: 'light' })}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        currentTheme.bgMode === 'light'
                          ? 'bg-[#007AFF] text-white'
                          : (isDarkMode ? 'bg-[#242f3d] text-slate-300' : 'bg-slate-100 text-slate-700')
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>{isFa ? 'روشن' : 'Light'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateCurrentTheme({ bgMode: 'dark' })}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        currentTheme.bgMode === 'dark'
                          ? 'bg-[#007AFF] text-white'
                          : (isDarkMode ? 'bg-[#242f3d] text-slate-300' : 'bg-slate-100 text-slate-700')
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>{isFa ? 'تیره' : 'Dark'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Live Preview Simulator Column */}
          <div className="space-y-4">
            <div className={`p-5 rounded-3xl transition-all ${
              isDarkMode ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)]'
            }`}>
              
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#007AFF]" />
                  <span>{isFa ? 'شبیه‌ساز پیش‌نمایش زنده' : 'Live Widget Simulator'}</span>
                </span>
                <span className="text-[10px] text-[#007AFF] font-bold font-mono">REAL-TIME</span>
              </div>

              {/* Realistic Box Container */}
              <div 
                className="w-full h-[460px] rounded-3xl shadow-xl flex flex-col overflow-hidden relative border transition-all"
                style={{
                  backgroundColor: currentTheme.bgMode === 'dark' ? '#17212b' : '#ffffff',
                  borderColor: currentTheme.bgMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                }}
              >
                {/* Pattern Overlay inside simulator */}
                <ChatWallpaperPattern
                  pattern={currentTheme.pattern || 'none'}
                  opacity={currentTheme.patternOpacity || 0.08}
                  isDark={currentTheme.bgMode === 'dark'}
                  color={currentTheme.primaryColor}
                />

                {/* Header */}
                <div 
                  className="p-3 text-white flex items-center justify-between shrink-0 relative z-10 shadow-xs"
                  style={{ 
                    backgroundColor: currentTheme.headerStyle === 'minimal' 
                      ? (currentTheme.bgMode === 'dark' ? '#1e2c3a' : '#f8fafc') 
                      : currentTheme.primaryColor,
                    color: currentTheme.headerStyle === 'minimal' 
                      ? (currentTheme.bgMode === 'dark' ? '#f4f4f5' : '#18181b') 
                      : currentTheme.textColor,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                      OC
                    </div>
                    <div>
                      <div className="text-xs font-bold">{isFa ? 'پشتیبانی آنلاین' : 'Live Support'}</div>
                      <div className="text-[10px] opacity-80">{isFa ? 'پاسخگویی زیر ۲ دقیقه' : 'Replies in under 2m'}</div>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-[#34C759]" />
                </div>

                {/* Body message preview */}
                <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs relative z-10">
                  <div className="text-center my-1">
                    <span className="text-[10px] text-slate-400 bg-black/5 dark:bg-white/5 px-2.5 py-0.5 rounded-full">
                      {isFa ? 'امروز ۱۰:۳۰' : 'Today 10:30'}
                    </span>
                  </div>

                  {/* Operator Bubble */}
                  <div className="flex justify-start">
                    <div 
                      className={`p-3 text-xs max-w-[85%] shadow-xs leading-relaxed ${
                        currentTheme.bgMode === 'dark' ? 'bg-[#242f3d] text-slate-100' : 'bg-white text-slate-800'
                      }`}
                      style={{
                        borderRadius: currentTheme.bubbleStyle === 'sharp-minimal' ? '6px' : currentTheme.bubbleStyle === 'modern-pill' ? '24px' : '16px',
                      }}
                    >
                      <p>{isFa ? 'درود! چطور می‌تونیم امروز به شما کمک کنیم؟' : 'Hello! How can we assist you today?'}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 font-mono text-[9px] opacity-60">
                        <span>۱۰:۳۰</span>
                        <CheckCheck className="w-3 h-3 text-[#007AFF]" />
                      </div>
                    </div>
                  </div>

                  {/* Quick Starter Prompts */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex flex-wrap gap-1">
                      {['پیگیری سفارش', 'مشاوره خرید', 'ساعات پاسخگویی'].map((pr, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-[#007AFF]/15 text-[#007AFF]"
                        >
                          {pr}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Visitor Bubble */}
                  <div className="flex justify-end">
                    <div 
                      className="p-3 text-xs max-w-[85%] shadow-xs leading-relaxed text-white"
                      style={{
                        backgroundColor: currentTheme.primaryColor,
                        borderRadius: currentTheme.bubbleStyle === 'sharp-minimal' ? '6px' : currentTheme.bubbleStyle === 'modern-pill' ? '24px' : '16px',
                      }}
                    >
                      <p>{isFa ? 'می‌خواستم درباره نصب مستقل روی سرور سوال بپرسم.' : 'I had a question about self-hosted install.'}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 font-mono text-[9px] opacity-80">
                        <span>۱۰:۳۲</span>
                        <CheckCheck className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input area */}
                <div className="p-2.5 border-t border-black/5 dark:border-white/5 flex items-center gap-1.5 relative z-10 bg-white dark:bg-[#17212b]">
                  <input
                    type="text"
                    disabled
                    placeholder={isFa ? 'پیام خود را بنویسید...' : 'Type a message...'}
                    className={`flex-1 text-xs p-2 rounded-xl ${
                      isDarkMode ? 'bg-[#242f3d] text-white' : 'bg-slate-100 text-slate-800'
                    }`}
                  />
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: currentTheme.primaryColor }}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Launcher preview */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">{isFa ? 'دکمه لانچر روی سایت:' : 'Launcher Preview:'}</span>
                <div 
                  className="px-4 py-2 flex items-center gap-2 text-white shadow-md text-xs font-semibold rounded-full"
                  style={{ backgroundColor: currentTheme.primaryColor }}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isFa ? 'چت آنلاین با ما' : 'Talk to Us'}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
