import React, { useState } from 'react';
import { OfflineLead, Department } from '../types';
import { 
  Mail, 
  Search, 
  CheckCircle, 
  Clock, 
  Phone, 
  Building2, 
  Send, 
  Filter,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OfflineLeadsViewProps {
  leads: OfflineLead[];
  departments: Department[];
  onUpdateLeadStatus?: (leadId: string, status: 'new' | 'reviewed' | 'resolved') => void;
  onUpdateStatus?: (leadId: string, status: any) => void;
  onDeleteLead?: (leadId: string) => void;
  onConvertLeadToChat?: (lead: any) => void;
  language: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const OfflineLeadsView: React.FC<OfflineLeadsViewProps> = ({
  leads,
  departments,
  onUpdateLeadStatus,
  language,
  isDarkMode = false,
}) => {
  const isFa = language === 'fa';
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'resolved'>('all');
  const [selectedLead, setSelectedLead] = useState<OfflineLead | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const filteredLeads = leads.filter((l) => {
    if (filter !== 'all' && l.status !== filter) return false;
    return true;
  });

  const handleSendEmailReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedLead) return;

    if (onUpdateLeadStatus) {
      onUpdateLeadStatus(selectedLead.id, 'resolved');
    }
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setSelectedLead(null);
      setReplyText('');
    }, 1500);
  };

  return (
    <div className={`flex-1 p-6 md:p-8 overflow-y-auto space-y-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0e1621] text-slate-100' : 'bg-[#f4f6f8] text-slate-800'
    }`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FF9500] text-white flex items-center justify-center shadow-md shadow-[#FF9500]/25">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {isFa ? 'صندوق پیام‌های آفلاین و لیدها' : 'Offline Messages & Leads'}
              </h1>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isFa 
                  ? 'پیام‌های ارسال شده در ساعات غیرکاری به همراه مشخصات تماس و دپارتمان انتخابی'
                  : 'Inquiries submitted outside operating hours with contact details and selected team'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className={`p-1 rounded-2xl flex items-center gap-1 ${
          isDarkMode ? 'bg-[#17212b]' : 'bg-white shadow-2xs'
        }`}>
          {(['all', 'new', 'reviewed', 'resolved'] as const).map((st) => {
            const labels = {
              all: isFa ? 'همه' : 'All',
              new: isFa ? 'جدید' : 'New',
              reviewed: isFa ? 'بررسی شده' : 'Reviewed',
              resolved: isFa ? 'پاسخ داده شد' : 'Resolved',
            };
            return (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === st
                    ? 'bg-[#007AFF] text-white shadow-xs'
                    : (isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
                }`}
              >
                {labels[st]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead, index) => {
          const dept = departments.find((d) => d.id === lead.departmentId);
          return (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, type: 'spring', stiffness: 350, damping: 25 }}
              className={`p-5 rounded-3xl transition-all relative overflow-hidden flex flex-col justify-between ${
                isDarkMode 
                  ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-[#1f2b38]' 
                  : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)]'
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm">{lead.name}</h3>
                    <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                      {lead.createdAt}
                    </span>
                  </div>

                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                    lead.status === 'new'
                      ? 'bg-[#FF9500]/15 text-[#FF9500]'
                      : lead.status === 'reviewed'
                      ? 'bg-[#007AFF]/15 text-[#007AFF]'
                      : 'bg-[#34C759]/15 text-[#34C759]'
                  }`}>
                    {lead.status === 'new' ? (isFa ? 'جدید' : 'New') : lead.status === 'reviewed' ? (isFa ? 'در دست بررسی' : 'Reviewed') : (isFa ? 'پاسخ داده شده' : 'Resolved')}
                  </span>
                </div>

                {/* Contact info */}
                <div className={`space-y-1.5 text-xs p-3 rounded-2xl ${
                  isDarkMode ? 'bg-[#242f3d]/60 text-slate-300' : 'bg-slate-50 text-slate-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">{isFa ? 'ایمیل:' : 'Email:'}</span>
                    <span className="font-mono text-[11px] truncate dir-ltr text-right">{lead.email}</span>
                  </div>
                  {lead.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{isFa ? 'شماره تماس:' : 'Phone:'}</span>
                      <span className="font-mono text-[11px]">{lead.phone}</span>
                    </div>
                  )}
                  {dept && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{isFa ? 'دپارتمان:' : 'Dept:'}</span>
                      <span className="font-semibold text-[#007AFF]">{dept.nameFa}</span>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <p className={`text-xs leading-relaxed p-3 rounded-2xl ${
                  isDarkMode ? 'bg-[#242f3d]/40 text-slate-200' : 'bg-slate-100/70 text-slate-700'
                }`}>
                  {lead.message}
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => setSelectedLead(lead)}
                  className="w-full py-2 bg-[#007AFF] hover:bg-[#0071e3] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5 rotate-180" />
                  <span>{isFa ? 'ارسال پاسخ ایمیلی' : 'Reply via Email'}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Reply Modal Sheet */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden text-right p-6 space-y-4 ${
                isDarkMode ? 'bg-[#17212b] text-white' : 'bg-white text-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">
                  {isFa ? `پاسخ به ${selectedLead.name}` : `Reply to ${selectedLead.name}`}
                </h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className={`p-3 rounded-2xl text-xs space-y-1 ${
                isDarkMode ? 'bg-[#242f3d] text-slate-300' : 'bg-slate-50 text-slate-600'
              }`}>
                <div className="font-semibold">{isFa ? 'متن پیام کاربر:' : 'Visitor message:'}</div>
                <p>{selectedLead.message}</p>
              </div>

              <form onSubmit={handleSendEmailReply} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold block mb-1.5">{isFa ? 'متن پاسخ شما:' : 'Your Response:'}</label>
                  <textarea
                    rows={4}
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isFa ? 'سلام جناب... با تشکر از پیام شما، در خصوص سوال مطرح شده...' : 'Hello, thank you for contacting us...'}
                    className={`w-full p-3 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#007AFF]/30 resize-none ${
                      isDarkMode ? 'bg-[#242f3d] text-white' : 'bg-slate-100 text-slate-800'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLead(null)}
                    className={`px-4 py-2 rounded-2xl font-semibold ${
                      isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isFa ? 'انصراف' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#007AFF] hover:bg-[#0071e3] text-white font-bold rounded-2xl shadow-md shadow-[#007AFF]/25 transition-all"
                  >
                    {sentSuccess ? (isFa ? '✓ ارسال شد!' : '✓ Sent!') : (isFa ? 'ارسال ایمیل مستقیم' : 'Send Email')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
