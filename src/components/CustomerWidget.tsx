import React, { useState } from 'react';
import { 
  ThemeConfig, 
  Operator, 
  Department, 
  Conversation, 
  ChatMessage 
} from '../types';
import { 
  MessageSquare, 
  Sparkles, 
  Send, 
  Paperclip, 
  X, 
  CheckCircle2,
  Lock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { optimizeImageClientSide } from '../utils/imageOptimizer';

interface CustomerWidgetProps {
  theme: ThemeConfig;
  isOpen: boolean;
  onToggle: () => void;
  operators: Operator[];
  departments: Department[];
  activeConversation: Conversation | null;
  onSendMessageFromVisitor: (text: string, fileAttachment?: any) => void;
  onSubmitRating: (stars: number, feedback: string) => void;
  onSubmitOfflineLead: (data: { name: string; email: string; phone: string; deptId: string; message: string }) => void;
  isStaffOnline: boolean;
  language: 'fa' | 'en';
  onSelectTheme?: (theme: ThemeConfig) => void;
  onUpdateTheme?: (updates: Partial<ThemeConfig>) => void;
}

export const CustomerWidget: React.FC<CustomerWidgetProps> = ({
  theme,
  isOpen,
  onToggle,
  operators,
  departments,
  activeConversation,
  onSendMessageFromVisitor,
  onSubmitOfflineLead,
  isStaffOnline,
  language,
}) => {
  const isFa = language === 'fa';
  const [inputText, setInputText] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState(departments[0]?.id || 'dept_1');
  const [soundEnabled] = useState(true);
  const [isCompressing, setIsCompressing] = useState(false);
  
  // File / Image Attachment State with Zero-Load Compression Info
  const [visitorAttachment, setVisitorAttachment] = useState<{ 
    name: string; 
    size: string; 
    type: string; 
    url?: string;
    originalSize?: string;
    savedPercent?: number;
  } | null>(null);

  // Offline form state
  const [offlineName, setOfflineName] = useState('');
  const [offlineEmail, setOfflineEmail] = useState('');
  const [offlinePhone, setOfflinePhone] = useState('');
  const [offlineMsg, setOfflineMsg] = useState('');
  const [offlineSubmitted, setOfflineSubmitted] = useState(false);

  const onlineOps = operators.filter((o) => o.status === 'online');

  const playAudioChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio fallback
    }
  };

  const handleSend = () => {
    if ((!inputText.trim() && !visitorAttachment) || activeConversation?.isBlocked) return;
    onSendMessageFromVisitor(inputText.trim(), visitorAttachment || undefined);
    setInputText('');
    setVisitorAttachment(null);
    playAudioChime();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Zero-Load Client-Side Instant Compression before touching server
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const optimized = await optimizeImageClientSide(file);
        setVisitorAttachment(optimized);
      } catch (err) {
        console.error('Compression error', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleOfflineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineName.trim() || !offlineEmail.trim() || !offlineMsg.trim()) return;
    onSubmitOfflineLead({
      name: offlineName.trim(),
      email: offlineEmail.trim(),
      phone: offlinePhone.trim(),
      deptId: selectedDeptId,
      message: offlineMsg.trim(),
    });
    setOfflineSubmitted(true);
  };

  const isDark = theme.bgMode === 'dark';

  return (
    <div className="fixed bottom-0 sm:bottom-5 left-0 sm:left-5 right-0 sm:right-auto z-50 flex flex-col items-start select-none">
      
      {/* 1. Main Chat Window - 100% Fullscreen on mobile devices, responsive desktop modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`w-full sm:w-[390px] h-screen sm:h-[580px] sm:max-h-[85vh] sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl relative border ${
              isDark ? 'bg-[#17212b] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header (Solid, crisp, no blur) */}
            <div 
              className="p-4 flex items-center justify-between text-white shrink-0 shadow-xs"
              style={{ backgroundColor: theme.primaryColor || '#007AFF' }}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-sm">
                    {onlineOps[0]?.name ? onlineOps[0].name.substring(0, 1) : <Sparkles className="w-5 h-5" />}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                    isStaffOnline ? 'bg-[#34C759]' : 'bg-amber-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-tight">{theme.nameFa || 'پشتیبانی آنلاین'}</h3>
                  <span className="text-[10px] opacity-85">
                    {isStaffOnline ? (isFa ? 'پاسخگوی آنلاین آماده گفتگو' : 'Online agents ready') : (isFa ? 'ارسال پیام به کارشناسان' : 'Leave a message')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={onToggle}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                  aria-label="بستن ویجت"
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Blocked Alert if user banned */}
            {activeConversation?.isBlocked ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-rose-500">دسترسی گفتگو موقتاً محدود شده است</h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  امکان ارسال پیام جدید برای این نشست توسط واحد پشتیبانی مسدود گردیده است.
                </p>
              </div>
            ) : isStaffOnline ? (
              /* Online Chat Mode */
              <>
                {/* Messages List */}
                <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-slate-50 dark:bg-[#0e1621]">
                  {activeConversation && activeConversation.messages.length > 0 ? (
                    activeConversation.messages.map((msg) => {
                      const isVisitor = msg.sender === 'visitor';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isVisitor ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`p-3 rounded-2xl text-xs max-w-[80%] leading-relaxed ${
                              isVisitor
                                ? 'bg-[#007AFF] text-white rounded-br-none shadow-xs'
                                : (isDark ? 'bg-[#242f3d] text-white' : 'bg-white text-slate-800') + ' rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-xs'
                            }`}
                          >
                            <div className="break-words">{msg.text}</div>
                            {msg.isEdited && (
                              <span className="text-[9px] opacity-75 mr-1">(ویرایش شده)</span>
                            )}

                            {/* File or Image */}
                            {msg.fileAttachment && (
                              <div className="mt-2 pt-2 border-t border-white/20">
                                {msg.fileAttachment.type.startsWith('image/') && msg.fileAttachment.url ? (
                                  <img
                                    src={msg.fileAttachment.url}
                                    alt="Attachment"
                                    className="max-h-44 rounded-xl object-contain bg-black/20 my-1"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2 text-[11px] bg-black/10 p-2 rounded-xl">
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span className="font-mono truncate">{msg.fileAttachment.name}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className={`text-[9px] mt-1 font-mono text-left opacity-75`}>
                              {msg.timestamp}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-500 flex items-center justify-center mx-auto">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold">{isFa ? 'چطور می‌توانیم کمکتان کنیم؟' : 'How can we help?'}</h4>
                      <p className="text-[11px] text-slate-400">
                        {isFa ? 'پیام خود را ارسال کنید، کارشناسان ما آنلاین هستند.' : 'Send a message to start chatting.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Attached File Preview with Zero-Load Compression Savings */}
                {visitorAttachment && (
                  <div className="px-3.5 py-2 bg-blue-50 dark:bg-[#242f3d] border-t border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs text-[#007AFF] shrink-0">
                    <div className="flex items-center gap-2 truncate">
                      <Paperclip className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold truncate">{visitorAttachment.name}</span>
                      <span className="text-[10px] text-slate-400 shrink-0">({visitorAttachment.size})</span>
                      {visitorAttachment.savedPercent && visitorAttachment.savedPercent > 0 ? (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[9px] font-bold shrink-0">
                          <Zap className="w-2.5 h-2.5" />
                          <span>{visitorAttachment.savedPercent}% فشرده‌شده</span>
                        </span>
                      ) : null}
                    </div>
                    <button onClick={() => setVisitorAttachment(null)} className="p-1 text-rose-500 hover:text-rose-700 shrink-0 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Input Bar */}
                <div className={`p-2.5 border-t flex items-center gap-2 shrink-0 ${
                  isDark ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <label className="p-2 rounded-xl text-slate-400 hover:text-[#007AFF] cursor-pointer transition-colors" title="ارسال عکس یا فایل">
                    <Paperclip className="w-4 h-4" />
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isCompressing ? (isFa ? 'در حال بهینه‌سازی عکس در مرورگر...' : 'Optimizing image...') : (isFa ? 'پیام خود را بنویسید...' : 'Type a message...')}
                    disabled={isCompressing}
                    className={`flex-1 text-xs px-3.5 py-2.5 rounded-2xl outline-none border-none ${
                      isDark ? 'bg-[#242f3d] text-white' : 'bg-slate-100 text-slate-900'
                    }`}
                  />

                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleSend}
                    disabled={(!inputText.trim() && !visitorAttachment) || isCompressing}
                    className="p-2.5 rounded-2xl bg-[#007AFF] hover:bg-[#0071e3] disabled:opacity-40 text-white shadow-xs transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4 rtl:rotate-180" />
                  </motion.button>
                </div>
              </>
            ) : (
              /* Offline Lead Generation Form */
              <div className="flex-1 p-5 overflow-y-auto space-y-3">
                {offlineSubmitted ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold">{isFa ? 'پیام شما ثبت شد!' : 'Message Received!'}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isFa ? 'کارشناسان ما به محض شروع ساعات کاری از طریق ایمیل پاسخ شما را ارسال خواهند کرد.' : 'We will respond via email shortly.'}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleOfflineSubmit} className="space-y-3 text-xs">
                    <div className="text-center pb-1">
                      <h4 className="font-bold text-sm">{isFa ? 'کارشناسان هم‌اکنون آفلاین هستند' : 'Leave an Offline Message'}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{isFa ? 'پیام خود را بگذارید تا در اسرع وقت پاسخ دهیم.' : 'We will get back to you.'}</p>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-400">{isFa ? 'نام و نام خانوادگی:' : 'Name:'}</label>
                      <input
                        type="text"
                        required
                        value={offlineName}
                        onChange={(e) => setOfflineName(e.target.value)}
                        placeholder="مثلاً: رضا رضایی"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-[#007AFF]"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-400">{isFa ? 'ایمیل شما:' : 'Email:'}</label>
                      <input
                        type="email"
                        required
                        value={offlineEmail}
                        onChange={(e) => setOfflineEmail(e.target.value)}
                        placeholder="reza@gmail.com"
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-[#007AFF] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1 text-slate-400">{isFa ? 'متن پیام یا سوال شما:' : 'Message:'}</label>
                      <textarea
                        required
                        rows={3}
                        value={offlineMsg}
                        onChange={(e) => setOfflineMsg(e.target.value)}
                        placeholder="سوال خود را اینجا مطرح کنید..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-[#007AFF]"
                      />
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full py-2.5 bg-[#007AFF] hover:bg-[#0071e3] text-white font-bold rounded-xl shadow-xs transition-all"
                    >
                      {isFa ? 'ارسال پیام آفلاین' : 'Send Offline Inquiry'}
                    </motion.button>
                  </form>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Floating Launcher Button (Hidden when widget is open on mobile to keep 100% full screen) */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={onToggle}
          className="m-3 sm:m-0 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center relative cursor-pointer"
          style={{ backgroundColor: theme.primaryColor || '#007AFF' }}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-[#34C759] ring-2 ring-white" />
        </motion.button>
      )}

    </div>
  );
};
