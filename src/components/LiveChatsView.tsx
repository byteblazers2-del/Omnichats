import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Operator, Department, CannedResponse, ChatMessage } from '../types';
import { 
  Search, 
  Send, 
  Paperclip, 
  ChevronRight,
  ChevronLeft,
  User, 
  Clock, 
  CheckCheck, 
  X,
  MessageSquare,
  Trash2,
  Ban,
  Edit2,
  Check,
  Lock,
  ArrowRight,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { optimizeImageClientSide } from '../utils/imageOptimizer';

interface LiveChatsViewProps {
  conversations: Conversation[];
  selectedConvId: string | null;
  onSelectConversation: (id: string) => void;
  onSendMessage: (convId: string, text: string, isInternalNote?: boolean, fileAttachment?: any) => void;
  onEditMessage: (convId: string, messageId: string, newText: string) => void;
  onDeleteMessage: (convId: string, messageId: string) => void;
  onDeleteConversation: (convId: string) => void;
  onToggleBlockVisitor: (convId: string, reason?: string) => void;
  onCloseConversation: (convId: string) => void;
  onTransferConversation: (convId: string, targetOperatorId: string, targetDeptId: string) => void;
  onAddNote: (convId: string, note: string) => void;
  onAddTag: (convId: string, tag: string) => void;
  onRemoveTag: (convId: string, tag: string) => void;
  operators: Operator[];
  departments: Department[];
  cannedResponses: CannedResponse[];
  currentOperator: Operator;
  language: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const LiveChatsView: React.FC<LiveChatsViewProps> = ({
  conversations,
  selectedConvId,
  onSelectConversation,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onDeleteConversation,
  onToggleBlockVisitor,
  language,
  isDarkMode = false,
}) => {
  const isFa = language === 'fa';
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'blocked'>('all');
  const [isCompressing, setIsCompressing] = useState(false);
  
  // Mobile specific: true if user is viewing chat screen on mobile
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Message Edit State
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageText, setEditingMessageText] = useState('');

  // File Upload with Zero-Load Compression Info
  const [attachedFile, setAttachedFile] = useState<{ 
    name: string; 
    size: string; 
    type: string; 
    url?: string;
    originalSize?: string;
    savedPercent?: number;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredConversations = conversations.filter((c) => {
    if (filterTab === 'blocked' && !c.isBlocked) return false;
    if (filterTab === 'unread' && c.unreadCount === 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.visitorName.toLowerCase().includes(q);
      const matchEmail = c.visitorEmail?.toLowerCase().includes(q);
      const matchIp = c.visitorIp.includes(q);
      const matchMsg = c.messages.some((m) => m.text.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchIp && !matchMsg) return false;
    }
    return true;
  });

  const selectedConv = conversations.find((c) => c.id === selectedConvId) || filteredConversations[0] || null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv?.messages]);

  const handleSelectConv = (id: string) => {
    onSelectConversation(id);
    setIsMobileChatOpen(true);
  };

  const handleBackToList = () => {
    setIsMobileChatOpen(false);
  };

  const handleSend = () => {
    if ((!inputText.trim() && !attachedFile) || !selectedConv) return;
    onSendMessage(selectedConv.id, inputText.trim(), false, attachedFile || undefined);
    setInputText('');
    setAttachedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const optimized = await optimizeImageClientSide(file);
        setAttachedFile(optimized);
      } catch (err) {
        console.error('Operator upload compression err', err);
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleStartEdit = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setEditingMessageText(msg.text);
  };

  const handleSaveEdit = (convId: string) => {
    if (!editingMessageId || !editingMessageText.trim()) return;
    onEditMessage(convId, editingMessageId, editingMessageText.trim());
    setEditingMessageId(null);
    setEditingMessageText('');
  };

  return (
    <div className={`flex-1 flex overflow-hidden p-0 md:p-4 gap-0 md:gap-4 transition-colors ${
      isDarkMode ? 'bg-[#0e1621] text-slate-100' : 'bg-[#f4f6f8] text-slate-800'
    }`}>
      
      {/* 1. Left Conversation List (Telegram Mobile Master List) */}
      <div className={`w-full md:w-80 lg:w-96 flex-col overflow-hidden shrink-0 md:border md:rounded-3xl shadow-xs transition-all ${
        isMobileChatOpen ? 'hidden md:flex' : 'flex'
      } ${
        isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* Search Header */}
        <div className="p-3.5 space-y-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className={`relative flex items-center rounded-2xl px-3 py-2 border transition-all ${
            isDarkMode 
              ? 'bg-[#242f3d] border-slate-700 focus-within:border-[#007AFF] text-white' 
              : 'bg-slate-100 border-slate-200 focus-within:border-[#007AFF] text-slate-800'
          }`}>
            <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFa ? 'جستجو در گفتگوها و کاربران...' : 'Search conversations...'}
              className="bg-transparent border-none outline-none text-xs w-full placeholder-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#242f3d] p-1 rounded-2xl text-[11px] font-semibold">
            <button
              onClick={() => setFilterTab('all')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-white dark:bg-[#17212b] shadow-xs text-[#007AFF] font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {isFa ? 'همه' : 'All'} ({conversations.length})
            </button>
            <button
              onClick={() => setFilterTab('unread')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterTab === 'unread'
                  ? 'bg-white dark:bg-[#17212b] shadow-xs text-[#007AFF] font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {isFa ? 'خوانده‌نشده' : 'Unread'}
            </button>
            <button
              onClick={() => setFilterTab('blocked')}
              className={`flex-1 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterTab === 'blocked'
                  ? 'bg-rose-500 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-rose-500'
              }`}
            >
              {isFa ? 'مسدود' : 'Blocked'}
            </button>
          </div>
        </div>

        {/* Conversation List Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              const lastMsg = conv.messages[conv.messages.length - 1];
              return (
                <motion.div
                  key={conv.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectConv(conv.id)}
                  className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected
                      ? (isDarkMode ? 'bg-[#242f3d]' : 'bg-blue-50')
                      : (isDarkMode ? 'hover:bg-[#242f3d]/50' : 'hover:bg-slate-50')
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#007AFF] to-[#0A84FF] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      {conv.visitorName.substring(0, 1)}
                    </div>
                    {conv.isBlocked ? (
                      <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-rose-500 text-white">
                        <Ban className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#34C759] ring-2 ring-white dark:ring-[#17212b]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate flex items-center gap-1.5">
                        {conv.visitorName}
                        {conv.isBlocked && (
                          <span className="text-[9px] bg-rose-500/20 text-rose-500 px-1 rounded font-normal">مسدود</span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{conv.lastMessageAt}</span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-[11px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {lastMsg ? lastMsg.text : 'گفتگو آغاز شد'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#007AFF] text-white text-[10px] font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold">{isFa ? 'صندوق پیام‌ها' : 'Chat Archive'}</h4>
              <p className="text-[11px] text-slate-400">
                {isFa ? 'هیچ گفتگویی در این دسته وجود ندارد.' : 'No conversations found in this filter.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Chat Detail Canvas (Native Mobile Slide-in & Desktop Pane) */}
      <AnimatePresence mode="wait">
        {(selectedConv && (isMobileChatOpen || window.innerWidth >= 768)) ? (
          <motion.div
            key={selectedConv.id}
            initial={{ opacity: 0, x: isFa ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isFa ? 20 : -20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className={`flex-1 flex flex-col overflow-hidden md:border md:rounded-3xl shadow-xs transition-all ${
              !isMobileChatOpen ? 'hidden md:flex' : 'flex'
            } ${
              isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Native Telegram Header with Back Button */}
            <div className="p-3 sm:p-4 border-b flex items-center justify-between border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                
                {/* Telegram Native Mobile Back Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={handleBackToList}
                  className="md:hidden flex items-center gap-1 p-2 -mr-1 rounded-xl text-[#007AFF] hover:bg-blue-50 dark:hover:bg-[#242f3d] transition-colors cursor-pointer"
                  aria-label="بازگشت به لیست گفتگوها"
                >
                  {isFa ? <ChevronRight className="w-5 h-5 stroke-[2.5]" /> : <ChevronLeft className="w-5 h-5 stroke-[2.5]" />}
                  <span className="text-xs font-bold">{isFa ? 'گفتگوها' : 'Chats'}</span>
                </motion.button>

                {/* Visitor Info Avatar */}
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#007AFF] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {selectedConv.visitorName.substring(0, 1)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#34C759] ring-2 ring-white dark:ring-[#17212b]" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold truncate flex items-center gap-1.5">
                    {selectedConv.visitorName}
                    {selectedConv.isBlocked && (
                      <span className="text-[9px] bg-rose-500/20 text-rose-500 px-1.5 py-0.5 rounded font-bold">مسدود</span>
                    )}
                  </h3>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    IP: {selectedConv.visitorIp} • {selectedConv.visitorLocation}
                  </div>
                </div>
              </div>

              {/* Moderation Controls */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => onToggleBlockVisitor(selectedConv.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    selectedConv.isBlocked
                      ? 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25'
                      : 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25'
                  }`}
                  title={selectedConv.isBlocked ? 'رفع مسدودیت کاربر' : 'مسدود سازی کاربر'}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{selectedConv.isBlocked ? 'رفع مسدودی' : 'مسدود کردن'}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    if (window.confirm('آیا از حذف کامل تاریخچه این گفتگو اطمینان دارید؟')) {
                      onDeleteConversation(selectedConv.id);
                      setIsMobileChatOpen(false);
                    }
                  }}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer"
                  title="حذف کامل تاریخچه چت"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Blocked Alert Banner */}
            {selectedConv.isBlocked && (
              <div className="p-2.5 bg-rose-500/15 text-rose-400 text-xs text-center border-b border-rose-500/20 flex items-center justify-center gap-2 shrink-0">
                <Lock className="w-3.5 h-3.5" />
                <span>این کاربر مسدود شده است و امکان ارسال پیام جدید ندارد.</span>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[#f8fafc] dark:bg-[#101721]">
              {selectedConv.messages.map((m) => {
                const isMe = m.sender === 'operator';
                const isEditing = editingMessageId === m.id;

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col group ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="relative max-w-[85%] sm:max-w-[75%]">
                      {/* Message Bubble */}
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed transition-all ${
                        isMe
                          ? 'bg-[#007AFF] text-white rounded-br-xs shadow-xs'
                          : 'bg-white dark:bg-[#242f3d] text-slate-800 dark:text-white rounded-bl-xs border border-slate-200 dark:border-slate-700 shadow-xs'
                      }`}>
                        {/* Editing Mode */}
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingMessageText}
                              onChange={(e) => setEditingMessageText(e.target.value)}
                              className="w-full text-slate-900 bg-white p-2 rounded-lg text-xs outline-none"
                              autoFocus
                            />
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => setEditingMessageId(null)}
                                className="px-2 py-1 text-[10px] bg-white/20 rounded cursor-pointer"
                              >
                                لغو
                              </button>
                              <button
                                onClick={() => handleSaveEdit(selectedConv.id)}
                                className="px-2 py-1 text-[10px] bg-emerald-600 text-white rounded font-bold cursor-pointer"
                              >
                                ذخیره
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="break-words">{m.text}</div>
                            {m.isEdited && (
                              <span className="text-[9px] opacity-75 mr-1 font-sans">(ویرایش شده)</span>
                            )}
                          </>
                        )}

                        {/* File / Image Attachment */}
                        {m.fileAttachment && (
                          <div className="mt-2 pt-2 border-t border-white/20">
                            {m.fileAttachment.type.startsWith('image/') && m.fileAttachment.url ? (
                              <img
                                src={m.fileAttachment.url}
                                alt="Attachment"
                                className="max-h-52 rounded-xl object-contain bg-black/20 my-1"
                              />
                            ) : (
                              <div className="flex items-center gap-2 text-[11px] bg-black/10 p-2 rounded-xl">
                                <Paperclip className="w-3.5 h-3.5" />
                                <span className="font-mono truncate">{m.fileAttachment.name}</span>
                                <span className="text-[9px] opacity-70">({m.fileAttachment.size})</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className={`text-[9px] mt-1 font-mono text-left flex items-center justify-end gap-1 ${
                          isMe ? 'text-blue-100' : 'text-slate-400'
                        }`}>
                          <span>{m.timestamp}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-white" />}
                        </div>
                      </div>

                      {/* Message Actions (Edit / Delete) */}
                      <div className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${
                        isMe ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'
                      }`}>
                        {isMe && (
                          <button
                            onClick={() => handleStartEdit(m)}
                            className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#007AFF] cursor-pointer"
                            title="ویرایش پیام"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteMessage(selectedConv.id, m.id)}
                          className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500 cursor-pointer"
                          title="حذف پیام"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Attached File Preview with Zero-Load Compression Savings */}
            {attachedFile && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-[#242f3d] border-t border-blue-100 dark:border-slate-800 flex items-center justify-between text-xs text-[#007AFF] shrink-0">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip className="w-4 h-4 shrink-0" />
                  <span className="font-bold truncate">{attachedFile.name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">({attachedFile.size})</span>
                  {attachedFile.savedPercent && attachedFile.savedPercent > 0 ? (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 text-[9px] font-bold shrink-0">
                      <Zap className="w-2.5 h-2.5" />
                      <span>{attachedFile.savedPercent}% فشرده‌شده</span>
                    </span>
                  ) : null}
                </div>
                <button onClick={() => setAttachedFile(null)} className="p-1 text-rose-500 hover:text-rose-700 shrink-0 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Message Composer */}
            <div className="p-2.5 sm:p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 shrink-0 bg-white dark:bg-[#17212b]">
              <label className="p-2.5 rounded-2xl bg-slate-100 dark:bg-[#242f3d] text-slate-400 hover:text-[#007AFF] cursor-pointer transition-colors" title="پیوست تصویر یا فایل">
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
                className="flex-1 bg-slate-100 dark:bg-[#242f3d] border-none outline-none text-xs px-3.5 py-2.5 rounded-2xl"
              />
              
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleSend}
                disabled={(!inputText.trim() && !attachedFile) || isCompressing}
                className="p-2.5 rounded-2xl bg-[#007AFF] hover:bg-[#0071e3] disabled:opacity-40 text-white shadow-xs transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 rtl:rotate-180" />
              </motion.button>
            </div>

          </motion.div>
        ) : (
          <div className="hidden md:flex flex-1 rounded-3xl shadow-xs flex-col items-center justify-center p-8 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#17212b]">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-[#242f3d] text-[#007AFF] flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold mb-1">
              {isFa ? 'یک گفتگو را جهت مشاهده انتخاب کنید' : 'Select a conversation to start chatting'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {isFa ? 'پیام‌های ورودی کاربران به صورت بلادرنگ در این بخش نمایش داده می‌شوند.' : 'Real-time incoming visitor chats will appear here.'}
            </p>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
