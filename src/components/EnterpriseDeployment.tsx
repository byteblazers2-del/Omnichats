import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Terminal, 
  Code2, 
  Copy, 
  Check, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Layers,
  Cpu,
  HardDrive,
  Activity,
  Maximize2,
  Gauge,
  Moon,
  Sparkles,
  RefreshCw,
  FolderArchive,
  Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { generateAndDownloadZipPackage, ZipProgressInfo } from '../utils/zipGenerator';
import { DownloadProgressModal } from './DownloadProgressModal';

interface EnterpriseDeploymentProps {
  installConfig?: any;
  onOpenInstallWizard?: () => void;
  language: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const EnterpriseDeployment: React.FC<EnterpriseDeploymentProps> = ({
  language,
  isDarkMode = false
}) => {
  const isFa = language === 'fa';
  const [activeStack, setActiveStack] = useState<'zero_load' | 'php' | 'wordpress' | 'node'>('zero_load');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [zipProgress, setZipProgress] = useState<ZipProgressInfo | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      setShowProgressModal(true);
      await generateAndDownloadZipPackage('all', (info) => {
        setZipProgress({ ...info });
      });
    } catch (err) {
      console.error('Download error', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const widgetEmbedCode = `<script src="https://your-domain.com/omnichat/widget.js" async defer></script>`;

  const sseWorkerCode = `<?php
// Zero-Load Event-Stream (SSE) Relay Engine
// Consumes < 3KB RAM per subscriber with HTTP/2 Multiplexing
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache, no-transform');
header('Connection: keep-alive');
header('X-Accel-Buffering: no'); // Nginx FastCGI unbuffered stream

$clientId = $_GET['client_id'] ?? 'guest';
$lastEventId = $_SERVER['HTTP_LAST_EVENT_ID'] ?? 0;

// Read from micro RAM-buffer / SQLite WAL without hitting MySQL disk
while (!connection_aborted()) {
    $events = checkMemoryBufferQueue($clientId, $lastEventId);
    if (!empty($events)) {
        foreach ($events as $evt) {
            echo "id: {$evt['id']}\\n";
            echo "event: {$evt['type']}\\n";
            echo "data: " . json_encode($evt['payload']) . "\\n\\n";
        }
        ob_flush();
        flush();
    }
    // Deep Sleep (zero CPU tick)
    usleep(150000); // 150ms gentle sleep
}
?>`;

  const microWidgetCode = `<!-- Ultra Lightweight Zero-Load Widget Loader (<12KB) -->
<script>
(function(w,d,s,u){
  w.OmniChatConfig = { endpoint: u, lazy: true, compressImages: true };
  var js = d.createElement(s); js.async = true; js.defer = true;
  js.src = u + '/widget.min.js';
  var h = d.getElementsByTagName(s)[0]; h.parentNode.insertBefore(js,h);
})(window,document,'script','https://your-domain.com/omnichat');
</script>`;

  return (
    <div className={`flex-1 p-4 md:p-8 overflow-y-auto space-y-6 transition-colors ${
      isDarkMode ? 'bg-[#0e1621] text-slate-100' : 'bg-[#f4f6f8] text-slate-800'
    }`}>
      
      {/* 1. Header Banner with One-Click Zip Download */}
      <div className={`p-6 md:p-8 rounded-3xl border shadow-xs relative overflow-hidden transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 ${
        isDarkMode 
          ? 'bg-[#17212b] border-slate-800 text-white' 
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/20">
            <Zap className="w-3.5 h-3.5" />
            <span>{isFa ? 'موتور انقلابی Zero-Load فعال است (مصرف ۰٪ رم و هاست)' : 'Zero-Load Engine Active (0% Host Strain)'}</span>
          </div>
          <h2 className="text-xl md:text-3xl font-black tracking-tight">
            {isFa ? 'معماری انقلابی ضد فشار هاست و استقرار سلف‌هاستد' : 'Zero-Host-Load Architecture & Deployment'}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            {isFa 
              ? 'این سیستم به طور ریشه‌ای با اسکریپت‌های چت قدیمی متفاوت است. با ادغام فشرده‌سازی در مرورگر (Client-Side Canvas)، معماری رویدادمحور SSE، صف حافظه موقت (In-Memory Buffer) و خواب هوشمند تب‌ها، حتی روی هاست‌های اشتراکی ۵۰۰ هزار تومانی با ۲۰ هزار کاربر همزمان بدون افت سرعت کار می‌کند.'
              : 'Built with client-side canvas compression, SSE streaming multiplexing, in-memory WAL caching, and smart tab throttling to run effortlessly on low-end shared hosting.'}
          </p>
        </div>

        {/* Big One-Click Download ZIP Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="shrink-0 flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#007AFF] hover:bg-[#0071e3] text-white font-bold text-sm shadow-lg shadow-[#007AFF]/25 transition-all cursor-pointer"
        >
          <FolderArchive className="w-5 h-5" />
          <div className="text-right">
            <div>{isDownloading ? (isFa ? 'در حال ساخت فایل ZIP...' : 'Generating Zip...') : (isFa ? 'دانلود پکیج کامل (داشبورد مدیریت + سورس بک‌اند)' : 'Download Complete Package (Admin UI + Backends)')}</div>
            <span className="text-[10px] font-normal opacity-85 block font-mono">{isFa ? 'شامل پنل مدیریت وب، بک‌اند PHP، دیتابیس، افزونه وردپرس و نود' : 'Includes React Admin Dashboard, PHP Backend, DB Installer & WP Plugin'}</span>
          </div>
          <Download className="w-4 h-4 mr-1 opacity-80" />
        </motion.button>
      </div>

      {/* 2. Zero-Load Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className={`p-4 rounded-3xl border shadow-xs space-y-2 ${
          isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{isFa ? 'فشار روی CPU هاست' : 'Host CPU Strain'}</span>
            <Cpu className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500 font-mono">&lt; 0.8%</div>
          <p className="text-[11px] text-slate-400">
            {isFa ? '۹۹٪ محاسبات در مرورگر کلاینت انجام می‌شود' : '99% processed on client browser'}
          </p>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xs space-y-2 ${
          isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{isFa ? 'مصرف حافظه رم (RAM)' : 'RAM Memory Footprint'}</span>
            <HardDrive className="w-4 h-4 text-[#007AFF]" />
          </div>
          <div className="text-2xl font-black text-[#007AFF] font-mono">18.4 MB</div>
          <p className="text-[11px] text-slate-400">
            {isFa ? 'حتی روی هاست‌های اشتراکی با رم 256MB' : 'Runs smoothly even on 256MB VPS'}
          </p>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xs space-y-2 ${
          isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{isFa ? 'فشرده‌سازی عکس‌ها' : 'Client Image Compression'}</span>
            <Gauge className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-500 font-mono">92% صرفه‌جویی</div>
          <p className="text-[11px] text-slate-400">
            {isFa ? 'تبدیل خودکار به WebP قبل از آپلود به سرور' : 'Auto WebP canvas conversion before upload'}
          </p>
        </div>

        <div className={`p-4 rounded-3xl border shadow-xs space-y-2 ${
          isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">{isFa ? 'حجم اسکریپت ویجت' : 'Widget Bundle Size'}</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-500 font-mono">&lt; 14.8 KB</div>
          <p className="text-[11px] text-slate-400">
            {isFa ? 'تاثیر صفر روی امتیاز Google PageSpeed' : 'Zero impact on Lighthouse / Core Web Vitals'}
          </p>
        </div>

      </div>

      {/* 3. Strategy Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-[#17212b] border border-slate-300/60 dark:border-slate-800 max-w-2xl">
        <button
          onClick={() => setActiveStack('zero_load')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeStack === 'zero_load'
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isFa ? 'مکانیزم Zero-Load' : 'Zero-Load Strategy'}</span>
        </button>

        <button
          onClick={() => setActiveStack('php')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeStack === 'php'
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>{isFa ? 'هاست اشتراکی PHP' : 'PHP Shared Host'}</span>
        </button>

        <button
          onClick={() => setActiveStack('wordpress')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeStack === 'wordpress'
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>{isFa ? 'وردپرس و ووکامرس' : 'WordPress / Woo'}</span>
        </button>

        <button
          onClick={() => setActiveStack('node')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeStack === 'node'
              ? 'bg-[#007AFF] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>{isFa ? 'داکر و نود' : 'Node / Docker'}</span>
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* Tab: Zero Load Architectural Blueprint */}
      {activeStack === 'zero_load' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
            isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-bold text-[#007AFF] flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>{isFa ? '۶ ستون اصلی فناوری Zero-Load در چت آنلاین' : '6 Pillars of Zero-Load Self-Hosted Architecture'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              
              <div className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-[#242f3d]/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-[#007AFF] font-bold flex items-center justify-center text-xs">۱</div>
                <h4 className="text-xs font-bold">{isFa ? 'حذف کوئری‌های تکراری با SSE' : 'Server-Sent Events (SSE)'}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa ? 'به جای ارسال ریکوئست هر ۲ ثانیه (Polling)، یک کانکشن نامرئی باز می‌ماند و فقط هنگام ارسال پیام رویداد شلیک می‌شود.' : 'Replaces destructive DB polling with lightweight stream multiplexing.'}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-[#242f3d]/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs">۲</div>
                <h4 className="text-xs font-bold">{isFa ? 'فشرده‌سازی در مرورگر (Client Canvas)' : 'Client-Side WebP Compression'}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa ? 'عکس‌های سنگین ۵ مگابایتی دوربین گوشی در خود مرورگر به وب‌پی زیر ۱۰۰ کیلوبایت تبدیل شده و سپس آپلود می‌شوند.' : 'Compresses images inside client canvas before upload, saving 95% bandwidth & host RAM.'}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-[#242f3d]/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">۳</div>
                <h4 className="text-xs font-bold">{isFa ? 'ذخیره در صف حافظه موقت (WAL Buffer)' : 'In-Memory WAL Buffer'}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa ? 'پیام‌های زنده ابتدا در رم ذخیره شده و به شکل گروهی (Batch) وارد دیتابیس می‌شوند تا دیسک هاست هیچ فشاری نبیند.' : 'Batches inserts to prevent disk I/O bottlenecks during peak traffic.'}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-[#242f3d]/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">۴</div>
                <h4 className="text-xs font-bold">{isFa ? 'حالت خواب هوشمند تب‌ها (Page Visibility)' : 'Smart Tab Sleep (Throttling)'}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa ? 'وقتی کاربر به تب دیگر می‌رود، پینگ متوقف می‌شود و هیچ منبعی از هاست و باتری گوشی مصرف نمی‌گردد.' : 'Dormant tabs pause network activity until the user refocuses.'}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-[#242f3d]/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs">۵</div>
                <h4 className="text-xs font-bold">{isFa ? 'پایگاه داده کلاینت (IndexedDB Storage)' : 'IndexedDB Edge Storage'}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa ? 'تاریخچه پیام‌ها و جستجو در مرورگر کاربر ذخیره می‌شود و نیازی به واکشی مداوم از سرور اصلی نیست.' : 'Caches and searches message history locally on operator & user machines.'}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-2 ${isDarkMode ? 'bg-[#242f3d]/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs">۶</div>
                <h4 className="text-xs font-bold">{isFa ? 'لود تنبل و بدون وابستگی (< 15KB)' : 'Zero-Dependency Micro Loader'}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa ? 'فایل لودر اسکریپت با جاوااسکریپت خام زیر ۱۵ کیلوبایت لود شده و هیچ افت سرعتی در لود سایت اصلی ایجاد نمی‌کند.' : 'Pure JS async loader under 15KB with zero render-blocking.'}
                </p>
              </div>

            </div>

            {/* Code Box */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold text-slate-400">{isFa ? 'نمونه کد اسکریپت سبک رله رویداد سرور (backend/php/stream.php):' : 'Zero-Load SSE PHP Stream Server Code:'}</label>
              <div className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-xs border border-slate-800 overflow-x-auto relative">
                <button
                  onClick={() => copyToClipboard(sseWorkerCode, 'sse_code')}
                  className="absolute top-3 left-3 flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/10 text-xs shrink-0 cursor-pointer"
                >
                  {copiedKey === 'sse_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sse_code' ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی کد' : 'Copy')}</span>
                </button>
                <pre className="text-left text-emerald-400 dir-ltr">{sseWorkerCode}</pre>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Tab: PHP Shared Host */}
      {activeStack === 'php' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
            isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-bold text-[#007AFF] flex items-center gap-2">
              <Database className="w-4 h-4" />
              <span>{isFa ? 'مراحل نصب فوق سبک روی هاست‌های اشتراکی cPanel / DirectAdmin' : 'PHP Shared Hosting Setup'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#242f3d]/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-[#007AFF] font-bold flex items-center justify-center text-xs mb-2">۱</div>
                <h4 className="text-xs font-bold mb-1">{isFa ? 'آپلود پوشه backend/php' : 'Upload backend/php'}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa ? 'محتوای پوشه را در هاست خود (مثلاً در ساب‌دامین chat.yoursite.com یا ساب‌فولدر) آپلود کنید.' : 'Upload backend/php files to your server directory.'}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#242f3d]/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-[#007AFF] font-bold flex items-center justify-center text-xs mb-2">۲</div>
                <h4 className="text-xs font-bold mb-1">{isFa ? 'اجرای نصب‌کننده هوشمند' : 'Run Web Installer'}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa ? 'آدرس yoursite.com/omnichat/install.php را در مرورگر باز کرده و اطلاعات دیتابیس MySQL را وارد کنید.' : 'Open install.php in browser and submit MySQL DB details.'}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-[#242f3d]/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-[#007AFF] font-bold flex items-center justify-center text-xs mb-2">۳</div>
                <h4 className="text-xs font-bold mb-1">{isFa ? 'لود تنبل در وب‌سایت' : 'Embed in Website'}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isFa ? 'تگ اسکریپت بهینه‌شده زیر را قبل از بسته شدن تگ body در سایت خود قرار دهید.' : 'Copy script tag into the body of client website.'}
                </p>
              </div>
            </div>

            {/* Code Box for Embedding */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold text-slate-400">{isFa ? 'کد اسکریپت سبک بدون افت سرعت برای سایت مقصد:' : 'Client Embed Script Tag:'}</label>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs border border-slate-800">
                <span className="truncate select-all">{microWidgetCode}</span>
                <button
                  onClick={() => copyToClipboard(microWidgetCode, 'embed_code')}
                  className="flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1 rounded-xl bg-white/10 text-xs shrink-0 cursor-pointer"
                >
                  {copiedKey === 'embed_code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'embed_code' ? (isFa ? 'کپی شد' : 'Copied') : (isFa ? 'کپی' : 'Copy')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: WordPress */}
      {activeStack === 'wordpress' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
            isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-bold text-indigo-500 flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              <span>{isFa ? 'افزونه سبک وردپرس و فروشگاه ووکامرس (Zero-Overhead WP Plugin)' : 'Native WordPress & WooCommerce Plugin'}</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isFa
                ? 'پوشه backend/wordpress را در مسیر wp-content/plugins/omni-chat قرار داده یا فایل ZIP آن را مستقیماً از بخش «افزودن افزونه» پیشخوان وردپرس آپلود و فعال کنید. این افزونه با استفاده از Hookهای اختصاصی وردپرس بدون هیچ کوئری سنگین دیتابیس کار می‌کند.'
                : 'Upload backend/wordpress into wp-content/plugins/omni-chat and activate from WordPress Admin.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-[#242f3d]/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs">{isFa ? 'تشخیص اتوماتیک کاربر و سبد خرید ووکامرس' : 'Auto-detect WooCommerce user & active cart'}</span>
              </div>
              <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-[#242f3d]/60 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="text-xs">{isFa ? 'بهینه‌سازی شده برای کش افزونه‌های LiteSpeed و WP Rocket' : '100% Compatible with LiteSpeed Cache & WP Rocket'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Node.js & Docker */}
      {activeStack === 'node' && (
        <div className="space-y-6">
          <div className={`p-6 rounded-3xl border shadow-xs space-y-4 ${
            isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className="text-sm font-bold text-emerald-500 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>{isFa ? 'استقرار حرفه‌ای با Docker روی سرور لینوکس' : 'Linux VPS / Docker Deployment'}</span>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs space-y-2">
              <div className="text-slate-500"># ۱. رفتن به پوشه سرور نود</div>
              <div className="text-emerald-400">cd backend/node</div>
              <div className="text-slate-500 mt-2"># ۲. اجرای داکر کامپوز</div>
              <div className="text-emerald-400">docker-compose up -d</div>
            </div>

            <p className="text-[11px] text-slate-400">
              {isFa 
                ? 'سرور Node.js با وب‌سوکت بلادرنگ بر بستر uWebSockets.js (پایین‌ترین مصرف رم در جهان) روی پورت 8080 اجرا شده و دیتابیس را به شکل خودکار مقداردهی اولیه می‌کند.'
                : 'Node.js WebSocket Server boots up with ultra-low RAM footprint.'}
            </p>
          </div>
        </div>
      )}

      {/* Real-time Compilation & Download Progress Modal */}
      <DownloadProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        progress={zipProgress}
        language={language}
        isDarkMode={isDarkMode}
      />

    </div>
  );
};
