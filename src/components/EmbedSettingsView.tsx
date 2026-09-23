import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  HardDrive,
  Cpu,
  Database,
  Lock,
  Zap,
  MessageSquare,
  FolderArchive
} from 'lucide-react';
import { InstallConfig } from '../types';
import { motion } from 'motion/react';
import { generateAndDownloadZipPackage, ZipProgressInfo } from '../utils/zipGenerator';
import { DownloadProgressModal } from './DownloadProgressModal';

interface EmbedSettingsViewProps {
  installConfig: InstallConfig;
  theme?: any;
  language: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const EmbedSettingsView: React.FC<EmbedSettingsViewProps> = ({
  installConfig,
  language,
  isDarkMode = false,
}) => {
  const isFa = language === 'fa';
  const [copiedScript, setCopiedScript] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [zipProgress, setZipProgress] = useState<ZipProgressInfo | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  const embedScript = `<!-- omni chat Self-Hosted Live Widget (Zero External Dependencies) -->
<script 
  async 
  src="${installConfig.siteUrl}/omnichat/widget.js" 
  data-app="omni-chat"
  data-site-key="${installConfig.licenseKey}"
  data-theme="ios-blue"
  data-auto-open="false">
</script>`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(embedScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
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

  return (
    <div className={`flex-1 p-6 md:p-8 overflow-y-auto space-y-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0e1621] text-slate-100' : 'bg-[#f4f6f8] text-slate-800'
    }`}>
      
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-[#007AFF] text-white flex items-center justify-center shadow-md shadow-[#007AFF]/25">
          <Code2 className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {isFa ? 'کد اسکریپت و افزونه مستقل وردپرس' : 'Embed Code & WordPress Plugin'}
          </h1>
          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {isFa 
              ? 'اتصال پنجره گفتگوی آنلاین به هر نوع وب‌سایت با معماری کاملاً مستقل بدون نیاز به سرور مرکزی'
              : 'Integrate the live chat widget into WordPress, WooCommerce, or any custom CMS with zero external server dependencies.'}
          </p>
        </div>
      </div>

      {/* Embed Code Card */}
      <div className={`p-6 rounded-3xl transition-all ${
        isDarkMode ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm">{isFa ? 'کد جاوا اسکریپت جاگذاری ابزارک' : 'JavaScript Embed Snippet'}</h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isFa ? 'این تکه کد را دقیقاً قبل از بسته شدن تگ </body> در قالب وب‌سایت خود قرار دهید:' : 'Paste this snippet right before the </body> tag of your website:'}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyScript}
            className="px-4 py-2 bg-[#007AFF] hover:bg-[#0071e3] text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-[#007AFF]/25 transition-all cursor-pointer"
          >
            {copiedScript ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedScript ? (isFa ? 'کپی شد!' : 'Copied!') : (isFa ? 'کپی کردن اسکریپت' : 'Copy Snippet')}</span>
          </motion.button>
        </div>

        {/* Code Snippet Box */}
        <div className="p-4 bg-[#0a0f18] text-blue-200 font-mono text-xs rounded-2xl overflow-x-auto dir-ltr text-left border border-white/5">
          <pre>{embedScript}</pre>
        </div>
      </div>

      {/* WordPress & Complete Package Download Card */}
      <div className={`p-6 rounded-3xl transition-all ${
        isDarkMode ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)]'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">{isFa ? 'پکیج کامل و مستقل محصول (شامل افزونه وردپرس، داشبورد و بک‌اند)' : 'Complete Standalone Package (WordPress Plugin + Admin Dashboard + PHP Core)'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#34C759]/15 text-[#34C759]">v3.5.0 PRO</span>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {isFa ? 'نصب با یک کلیک در بخش «افزودن افزونه» پیشخوان وردپرس یا آپلود در هاست شخصی' : 'One-click upload for WordPress admin or standalone hosting'}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="px-5 py-2.5 bg-[#34C759] hover:bg-emerald-600 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-[#34C759]/25 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloading ? (isFa ? 'در حال آماده‌سازی...' : 'Preparing...') : (isFa ? 'دانلود پکیج کامل (ZIP)' : 'Download Complete ZIP')}</span>
          </motion.button>
        </div>
      </div>

      {/* Live Download Progress Modal */}
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
