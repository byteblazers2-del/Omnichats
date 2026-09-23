import React from 'react';
import { 
  FolderArchive, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileCode2, 
  FileText, 
  Layers, 
  HardDrive, 
  Download, 
  X,
  Sparkles,
  Zap,
  ArrowDownToLine,
  Check
} from 'lucide-react';
import { ZipProgressInfo, formatBytes } from '../utils/zipGenerator';
import { motion, AnimatePresence } from 'motion/react';

interface DownloadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: ZipProgressInfo | null;
  language: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  isOpen,
  onClose,
  progress,
  language,
  isDarkMode = true,
}) => {
  const isFa = language === 'fa';

  if (!isOpen || !progress) return null;

  const isComplete = progress.stage === 'completed';
  const isError = progress.stage === 'error';
  const isProcessing = !isComplete && !isError;

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'frontend':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono">React / UI</span>;
      case 'backend':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">PHP / MySQL</span>;
      case 'wordpress':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono">WordPress</span>;
      case 'config':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono">Installer</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-400 font-mono">Docs</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          isDarkMode 
            ? 'bg-[#121b26] border-slate-700/60 text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDarkMode ? 'border-slate-800/80 bg-[#17212b]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              isComplete
                ? 'bg-emerald-500/20 text-emerald-400'
                : isError
                ? 'bg-red-500/20 text-red-400'
                : 'bg-[#007AFF]/20 text-[#007AFF]'
            }`}>
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : isError ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <FolderArchive className="w-5 h-5 animate-pulse text-[#007AFF]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">
                  {isFa ? 'مرکز تولید و دانلود پکیج کامپایل‌شده پروژه' : 'Project Compilation & ZIP Package Hub'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#007AFF]/20 text-[#007AFF] font-bold font-mono">
                  v3.5.0 Standalone
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isFa 
                  ? 'گزارش لحظه‌ای و زنده حجم و وضعیت فایل‌های کامپایل‌شده' 
                  : 'Live real-time monitoring of compilation and byte compression'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              isDarkMode ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* 1. Big Live Progress Bar & Percentage */}
          <div className={`p-5 rounded-2xl border ${
            isDarkMode ? 'bg-[#0e1621] border-slate-800' : 'bg-slate-50 border-slate-200'
          } space-y-3`}>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-[#007AFF]" />}
                {isComplete && <Sparkles className="w-4 h-4 text-emerald-400" />}
                <span className="font-bold text-sm">
                  {isFa ? progress.stageTitleFa : progress.stageTitleEn}
                </span>
              </div>
              <span className="font-mono font-black text-lg text-[#007AFF]">
                {progress.percent}%
              </span>
            </div>

            {/* Smooth Animated Progress Track */}
            <div className="w-full h-3 rounded-full bg-slate-700/30 overflow-hidden relative">
              <motion.div
                className={`h-full rounded-full ${
                  isComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : isError
                    ? 'bg-red-500'
                    : 'bg-gradient-to-r from-[#007AFF] to-[#00C7BE]'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ ease: 'easeOut', duration: 0.3 }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span className="truncate max-w-[70%] font-mono text-[11px]">
                {isFa ? progress.stageDescriptionFa : progress.stageDescriptionEn}
              </span>
              <span className="font-mono text-[11px] font-semibold text-slate-300">
                {isProcessing ? (isFa ? 'در حال پردازش زنده...' : 'Processing live...') : isComplete ? (isFa ? 'تکمیل شد' : 'Complete') : ''}
              </span>
            </div>
          </div>

          {/* 2. Live File Size & Byte Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <div className={`p-3.5 rounded-2xl border ${
              isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#007AFF]" />
                <span>{isFa ? 'حجم کل سورس‌ها' : 'Uncompressed Size'}</span>
              </div>
              <div className="text-base font-black font-mono text-white">
                {progress.humanRawSize || '0 KB'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {progress.totalRawBytes.toLocaleString()} Bytes
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border ${
              isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isFa ? 'حجم فشرده زیپ' : 'Final ZIP Size'}</span>
              </div>
              <div className="text-base font-black font-mono text-emerald-400">
                {progress.humanZipSize || (isComplete ? progress.humanRawSize : (isFa ? 'در حال محاسبه...' : 'Calculating...'))}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {progress.finalZipSize ? `${progress.finalZipSize.toLocaleString()} Bytes` : (isFa ? 'الگوریتم Deflate L6' : 'Deflate Level 6')}
              </div>
            </div>

            <div className={`p-3.5 rounded-2xl border col-span-2 sm:col-span-1 ${
              isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="text-[11px] text-slate-400 font-medium mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>{isFa ? 'تعداد فایل‌ها' : 'Compiled Files'}</span>
              </div>
              <div className="text-base font-black font-mono text-purple-400">
                {progress.filesList.length || 8} {isFa ? 'فایل' : 'files'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {isFa ? '۱۰۰٪ کامپایل‌شده و مستقل' : '100% Zero-Dependency'}
              </div>
            </div>

          </div>

          {/* 3. Detailed Files Manifest Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-bold">{isFa ? 'محتویات و فایل‌های در حال بسته‌بندی:' : 'Files in this archive:'}</span>
              <span className="font-mono text-[11px]">{progress.currentFile ? `جاری: ${progress.currentFile}` : ''}</span>
            </div>

            <div className={`rounded-2xl border overflow-hidden divide-y ${
              isDarkMode ? 'bg-[#0e1621] border-slate-800 divide-slate-800/60' : 'bg-slate-50 border-slate-200 divide-slate-200'
            }`}>
              {progress.filesList.length > 0 ? (
                progress.filesList.map((file, idx) => (
                  <div key={idx} className="p-2.5 px-3.5 flex items-center justify-between text-xs hover:bg-white/5 transition">
                    <div className="flex items-center gap-2.5 truncate max-w-[65%]">
                      {file.name.endsWith('.js') || file.name.endsWith('.php') ? (
                        <FileCode2 className="w-4 h-4 text-[#007AFF] shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      <span className="font-mono font-medium truncate text-slate-200" dir="ltr">
                        {file.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getCategoryBadge(file.category)}
                      <span className="font-mono text-[11px] font-semibold text-slate-400">
                        {file.humanSize}
                      </span>
                      {isComplete ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  {isFa ? 'در حال آماده‌سازی فایل‌ها...' : 'Gathering file manifest...'}
                </div>
              )}
            </div>
          </div>

          {/* 4. Complete Notice */}
          {isComplete && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-400">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <div>
                <div className="font-bold">{isFa ? 'فایل زیپ با موفقیت در سیستم شما ذخیره شد!' : 'ZIP Package successfully created & downloaded!'}</div>
                <div className="text-[11px] text-emerald-300/80 mt-0.5">
                  {isFa 
                    ? 'فایل در پوشه Downloads شما قرار گرفت. کافیست آن را در هاست آپلود و install.php را اجرا کنید.' 
                    : 'The file is in your Downloads folder. Upload it to your host and run install.php.'}
                </div>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {isError && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-xs text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
              <div>
                <div className="font-bold">{isFa ? 'خطا در تولید فایل فشرده' : 'Error Creating ZIP'}</div>
                <div className="text-[11px] text-red-300/80 mt-0.5">{progress.error}</div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between gap-3 ${
          isDarkMode ? 'border-slate-800/80 bg-[#17212b]' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="text-xs text-slate-400">
            {isComplete ? (
              <span className="text-emerald-400 font-semibold font-mono flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> omnichat-commercial-standalone-product-v3.5.zip
              </span>
            ) : (
              <span>{isFa ? 'لطفاً تا پایان دانلود پنجره را نبندید' : 'Please keep this dialog open during packaging'}</span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
              isComplete
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {isComplete ? (isFa ? 'متوجه شدم و بستن' : 'Done & Close') : (isFa ? 'بستن پنجره' : 'Dismiss')}
          </button>
        </div>

      </motion.div>
    </div>
  );
};
