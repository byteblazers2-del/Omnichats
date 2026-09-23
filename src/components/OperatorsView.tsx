import React, { useState } from 'react';
import { Operator, Department } from '../types';
import { 
  UserCheck, 
  Plus, 
  Mail, 
  Clock, 
  Star, 
  Shield, 
  MessageSquare, 
  Key,
  CheckCircle2, 
  X, 
  Check, 
  Copy, 
  Sparkles,
  Link,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Trash2,
  Image as ImageIcon,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OperatorsViewProps {
  operators: Operator[];
  departments: Department[];
  onAddOperator?: (operator: any) => void;
  onUpdateOperator?: (updatedOp: any, updates?: any) => void;
  onDeleteOperator?: (operatorId: string) => void;
  onUpdateOperatorStatus?: (operatorId: string, status: 'online' | 'busy' | 'offline') => void;
  language: 'fa' | 'en';
  isDarkMode?: boolean;
}

export const OperatorsView: React.FC<OperatorsViewProps> = ({
  operators,
  departments,
  onAddOperator,
  onUpdateOperator,
  onDeleteOperator,
  onUpdateOperatorStatus,
  language,
  isDarkMode = false,
}) => {
  const isFa = language === 'fa';
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'supervisor' | 'agent'>('agent');
  const [selectedDepts, setSelectedDepts] = useState<string[]>(departments.length > 0 ? [departments[0].id] : []);
  const [shifts, setShifts] = useState(isFa ? 'شنبه تا چهارشنبه، ۰۸:۳۰ الی ۱۷:۰۰' : 'Mon-Fri, 8:30 - 17:00');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Generated Invite Link state
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('agent');
    setSelectedDepts(departments.length > 0 ? [departments[0].id] : []);
    setCurrentStep(1);
    setAvatarUrl('');
    setGeneratedLink(null);
    setCopiedLink(false);
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingOperator(null);
  };

  const handleCreateOperator = () => {
    if (!name.trim() || !email.trim()) return;

    onAddOperator?.({
      name: name.trim(),
      email: email.trim(),
      role,
      roleFa: role === 'admin' ? 'مدیر ارشد' : role === 'supervisor' ? 'سرپرست بخش' : 'کارشناس پاسخگو',
      departmentIds: selectedDepts,
      status: 'offline',
      avatar: avatarUrl.trim(),
      shifts,
    });

    const token = Math.random().toString(36).substring(2, 15);
    setGeneratedLink(`https://yoursite.com/chat/invite.php?token=${token}`);
    setCurrentStep(3);
  };

  const handleSaveEdit = () => {
    if (!editingOperator || !name.trim() || !email.trim()) return;
    if (onUpdateOperator) {
      onUpdateOperator(editingOperator.id, {
        name: name.trim(),
        email: email.trim(),
        role,
        roleFa: role === 'admin' ? 'مدیر ارشد' : role === 'supervisor' ? 'سرپرست بخش' : 'کارشناس پاسخگو',
        departmentIds: selectedDepts,
        avatar: avatarUrl.trim(),
        shifts,
      });
    }
    resetForm();
  };

  const openEditModal = (op: Operator) => {
    setEditingOperator(op);
    setName(op.name);
    setEmail(op.email);
    setRole(op.role);
    setSelectedDepts(op.departmentIds || []);
    setShifts(op.shifts || '۰۸:۳۰ الی ۱۷:۰۰');
    setAvatarUrl(op.avatar || '');
    setShowEditModal(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`flex-1 p-4 md:p-8 overflow-y-auto space-y-6 ${isDarkMode ? 'bg-[#0e1621] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-tight">
            {isFa ? 'مدیریت اپراتورها و همکاران' : 'Operator Staff Management'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isFa 
              ? 'ویرایش نام و فامیل (فارسی/انگلیسی)، آپلود یا حذف تصویر پروفایل، تعیین شیفت کاری و سطوح دسترسی.'
              : 'Edit operator names, upload/remove custom avatar photos, manage shift hours, and RBAC permissions.'}
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
            setCurrentStep(1);
          }}
          className="flex items-center justify-center gap-2 bg-[#007AFF] hover:bg-[#0071e3] text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-[#007AFF]/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isFa ? 'افزودن همکار جدید' : 'Add New Operator'}</span>
        </button>
      </div>

      {/* Operators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {operators.map((op) => (
          <div
            key={op.id}
            className={`p-5 rounded-3xl border shadow-xs flex flex-col justify-between transition-all ${
              isDarkMode ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-200/80'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {op.avatar ? (
                    <img
                      src={op.avatar}
                      alt={op.name}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500/20"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-base shadow-sm">
                      {op.name.trim().substring(0, 1)}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ${
                      isDarkMode ? 'ring-[#17212b]' : 'ring-white'
                    } ${
                      op.status === 'online' ? 'bg-[#34C759]' : op.status === 'busy' ? 'bg-[#FF9500]' : 'bg-slate-400'
                    }`}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold">{op.name}</h3>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{op.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(op)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-blue-500 transition-colors"
                  title="ویرایش اطلاعات"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                {operators.length > 1 && (
                  <button
                    onClick={() => onDeleteOperator?.(op.id)}
                    className="p-1.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                    title="حذف اپراتور"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3" />
                <span>{op.shifts || '۰۸:۳۰ الی ۱۷:۰۰'}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                op.role === 'admin'
                  ? 'bg-purple-500/15 text-purple-400'
                  : op.role === 'supervisor'
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}>
                {op.role === 'admin' ? (isFa ? 'مدیر ارشد' : 'Admin') : op.role === 'supervisor' ? (isFa ? 'سرپرست' : 'Supervisor') : (isFa ? 'کارشناس' : 'Agent')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Operator Modal */}
      <AnimatePresence>
        {showEditModal && editingOperator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border ${
                isDarkMode ? 'bg-[#17212b] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold">ویرایش مشخصات همکار / ادمین</h3>
                <button onClick={resetForm} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 py-3 text-xs">
                {/* Avatar Uploader */}
                <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-lg text-slate-500">
                      {name.substring(0, 1) || <User className="w-6 h-6" />}
                    </div>
                  )}
                  <div className="flex-1 space-y-1.5">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#007AFF] text-white rounded-xl text-[11px] font-bold shadow-xs hover:bg-[#0071e3]">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>انتخاب عکس از سیستم</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="block text-[10px] text-rose-500 hover:underline"
                      >
                        حذف عکس (استفاده از آواتار حروفی)
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-400">نام و نام خانوادگی (فارسی یا انگلیسی):</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-[#007AFF]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-400">ایمیل ورود:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-[#007AFF] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-400">شیفت کاری:</label>
                  <input
                    type="text"
                    value={shifts}
                    onChange={(e) => setShifts(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-[#007AFF]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-2 rounded-xl bg-[#007AFF] text-white text-xs font-bold shadow-md hover:bg-[#0071e3]"
                >
                  ذخیره تغییرات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Multi-Step Add Operator Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg rounded-3xl p-6 shadow-2xl border ${
                isDarkMode ? 'bg-[#17212b] border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold">
                    {isFa ? 'افزودن و ثبت‌نام همکار جدید' : 'Register New Enterprise Operator'}
                  </h3>
                  <p className="text-[11px] text-slate-400">مرحله {currentStep} از ۳</p>
                </div>
                <button onClick={resetForm} className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-2 my-4">
                <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 1 ? 'bg-[#007AFF]' : 'bg-slate-700'}`} />
                <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 2 ? 'bg-[#007AFF]' : 'bg-slate-700'}`} />
                <div className={`h-1.5 flex-1 rounded-full ${currentStep >= 3 ? 'bg-[#007AFF]' : 'bg-slate-700'}`} />
              </div>

              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-3 py-2 text-xs">
                  {/* Photo upload */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-blue-500" />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                        {name ? name.substring(0, 1) : <User className="w-5 h-5" />}
                      </div>
                    )}
                    <div className="flex-1">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#007AFF] text-white rounded-xl text-[11px] font-bold hover:bg-[#0071e3]">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>آپلود تصویر (اختیاری)</span>
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">نام و نام خانوادگی (فارسی / انگلیسی):</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="مثلاً: علی احمدی یا Ali Ahmadi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-[#007AFF]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">ایمیل ورود:</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ahmadi@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-[#007AFF] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-slate-400">رمز عبور:</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent outline-none focus:border-[#007AFF]"
                    />
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      disabled={!name.trim() || !email.trim()}
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center gap-1.5 bg-[#007AFF] hover:bg-[#0071e3] disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                    >
                      <span>مرحله بعد: سطح دسترسی</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Role Assignment */}
              {currentStep === 2 && (
                <div className="space-y-4 py-2 text-xs">
                  <div>
                    <label className="block font-semibold mb-1.5 text-slate-400">نقش سازمانی:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'agent', labelFa: 'کارشناس', descFa: 'فقط پاسخگویی چت' },
                        { id: 'supervisor', labelFa: 'سرپرست', descFa: 'نظارت بر گفتگوها' },
                        { id: 'admin', labelFa: 'مدیر کل', descFa: 'دسترسی کامل پنل' },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRole(r.id as any)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            role === r.id
                              ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                              : 'border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          <div className="font-bold">{r.labelFa}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{r.descFa}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 flex justify-between">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 text-slate-400 hover:text-white"
                    >
                      مرحله قبل
                    </button>
                    <button
                      onClick={handleCreateOperator}
                      className="bg-[#007AFF] hover:bg-[#0071e3] text-white font-bold px-5 py-2.5 rounded-xl shadow-md"
                    >
                      ثبت نهایی همکار
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Finished */}
              {currentStep === 3 && (
                <div className="text-center py-4 space-y-4 text-xs">
                  <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold">همکار جدید با موفقیت ثبت شد!</h4>
                  <p className="text-slate-400">حساب کاربری فعال است و می‌تواند به سامانه وارد شود.</p>
                  <button
                    onClick={resetForm}
                    className="w-full py-2.5 bg-[#007AFF] text-white font-bold rounded-xl shadow-md"
                  >
                    بستن
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
