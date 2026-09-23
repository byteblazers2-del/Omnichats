import React, { useState } from 'react';
import { Department, Operator } from '../types';
import { 
  Building2, 
  Plus, 
  Users, 
  Clock, 
  Check, 
  Settings, 
  Trash2,
  Edit2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  X,
  Shuffle,
  HelpCircle,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DepartmentsViewProps {
  departments: Department[];
  operators?: Operator[];
  onAddDepartment?: (dept: any) => void;
  onUpdateDepartment?: (dept: any) => void;
  onDeleteDepartment?: (id: string) => void;
  onSetDefaultDepartment?: (id: string) => void;
  language: 'fa' | 'en';
  isDarkMode?: boolean;
}

const IOS_COLORS = [
  { name: 'iOS Blue', hex: '#007AFF' },
  { name: 'iOS Green', hex: '#34C759' },
  { name: 'iOS Indigo', hex: '#5856D6' },
  { name: 'iOS Orange', hex: '#FF9500' },
  { name: 'iOS Purple', hex: '#AF52DE' },
  { name: 'iOS Pink', hex: '#FF2D55' },
  { name: 'iOS Teal', hex: '#30B0C7' },
  { name: 'iOS Slate', hex: '#636366' },
];

export const DepartmentsView: React.FC<DepartmentsViewProps> = ({
  departments,
  operators = [],
  onAddDepartment,
  onUpdateDepartment,
  onDeleteDepartment,
  onSetDefaultDepartment,
  language,
  isDarkMode = false,
}) => {
  const isFa = language === 'fa';
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [nameFa, setNameFa] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workingHours, setWorkingHours] = useState(isFa ? 'شنبه تا چهارشنبه ۹ الی ۱۸' : 'Mon-Fri 9:00 - 18:00');
  const [selectedColor, setSelectedColor] = useState('#007AFF');
  const [isDefault, setIsDefault] = useState(false);
  const [selectedOpIds, setSelectedOpIds] = useState<string[]>(operators.slice(0, 2).map((o) => o.id));
  const [autoWelcomeMsg, setAutoWelcomeMsg] = useState(isFa ? 'سلام! به بخش پشتیبانی ما خوش آمدید. چگونه می‌توانیم کمکتان کنیم؟' : 'Hello! How can we assist you today?');

  const toggleOperator = (opId: string) => {
    setSelectedOpIds((prev) => 
      prev.includes(opId) ? prev.filter((id) => id !== opId) : [...prev, opId]
    );
  };

  const handleOpenAddModal = () => {
    setNameFa('');
    setName('');
    setDescription('');
    setSelectedColor('#007AFF');
    setIsDefault(false);
    setSelectedOpIds(operators.slice(0, 2).map((o) => o.id));
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameFa.trim()) return;

    onAddDepartment?.({
      name: name.trim() || nameFa.trim(),
      nameFa: nameFa.trim(),
      description: description.trim() || (isFa ? 'رسیدگی به درخواست‌های مرتبط با این دپارتمان' : 'Handling requests for this department'),
      color: selectedColor,
      isDefault: isDefault || departments.length === 0,
      workingHours,
    });

    setShowAddModal(false);
  };

  return (
    <div className={`flex-1 p-6 md:p-8 overflow-y-auto space-y-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0e1621] text-slate-100' : 'bg-[#f4f6f8] text-slate-800'
    }`}>
      
      {/* Header Section (macOS Window Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#007AFF] text-white flex items-center justify-center shadow-md shadow-[#007AFF]/25">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {isFa ? 'دپارتمان‌ها و کانال‌های هدایت گفتگو' : 'Departments & Smart Routing'}
              </h1>
              <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isFa 
                  ? 'دسته‌بندی هوشمند پیام‌های کاربران و هدایت خودکار به اپراتورهای متخصص (بدون نیاز به سرور واسط)'
                  : 'Organize incoming customer chats and route them dynamically to dedicated staff'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-[#007AFF] hover:bg-[#0071e3] text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-[#007AFF]/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isFa ? 'افزودن دپارتمان جدید' : 'Create Department'}</span>
        </motion.button>
      </div>

      {/* Departments Grid (Mac Telegram Floating Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept, index) => {
          // Operators belonging to this department
          const assignedOps = operators.filter(
            (o) => o.departmentIds.includes(dept.id) || o.departmentIds.includes(dept.name)
          );

          return (
            <motion.div
              key={dept.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, type: 'spring', stiffness: 350, damping: 25 }}
              className={`p-5 rounded-3xl transition-all relative overflow-hidden flex flex-col justify-between ${
                isDarkMode 
                  ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-[#1f2b38]' 
                  : 'bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_20px_rgba(15,23,42,0.08)]'
              }`}
            >
              {/* Top Accent Strip */}
              <div 
                className="absolute top-0 right-0 left-0 h-1.5 opacity-90"
                style={{ backgroundColor: dept.color }}
              />

              <div className="space-y-4">
                {/* Card Title Row */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 font-bold text-sm shadow-xs"
                      style={{ backgroundColor: dept.color }}
                    >
                      {dept.nameFa.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm truncate">{dept.nameFa}</h3>
                        {dept.isDefault && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#007AFF]/15 text-[#007AFF] shrink-0 font-mono">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className={`text-[11px] font-mono truncate dir-ltr text-right ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-400'
                      }`}>
                        #{dept.name}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {onDeleteDepartment && !dept.isDefault && departments.length > 1 && (
                    <button
                      onClick={() => onDeleteDepartment(dept.id)}
                      className={`p-1.5 rounded-xl transition-colors ${
                        isDarkMode ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title={isFa ? 'حذف دپارتمان' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Description */}
                <p className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {dept.description || (isFa ? 'بدون توضیح' : 'No description')}
                </p>

                {/* Schedule & Working Hours */}
                <div className={`flex items-center gap-2 text-xs p-3 rounded-2xl ${
                  isDarkMode ? 'bg-[#242f3d]/60 text-slate-300' : 'bg-slate-50 text-slate-600'
                }`}>
                  <Clock className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />
                  <span className="text-[11px] truncate">{dept.workingHours}</span>
                </div>
              </div>

              {/* Bottom Assigned Staff & Default Switcher */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2 space-x-reverse">
                    {(assignedOps.length > 0 ? assignedOps : operators.slice(0, 2)).map((op) => (
                      <img
                        key={op.id}
                        src={op.avatar}
                        alt={op.name}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-[#17212b]"
                        title={op.name}
                      />
                    ))}
                  </div>
                  <span className={`text-[11px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {assignedOps.length > 0 ? `${assignedOps.length} ${isFa ? 'اپراتور' : 'agents'}` : (isFa ? 'همه اپراتورها' : 'All agents')}
                  </span>
                </div>

                {onSetDefaultDepartment && !dept.isDefault && (
                  <button
                    onClick={() => onSetDefaultDepartment(dept.id)}
                    className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-colors ${
                      isDarkMode 
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {isFa ? 'انتخاب پیش‌فرض' : 'Set Default'}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Department macOS Modal Sheet (Smooth Spring Animation) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden text-right flex flex-col max-h-[90vh] ${
                isDarkMode ? 'bg-[#17212b] text-slate-100' : 'bg-white text-slate-800'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-5 flex items-center justify-between border-b ${
                isDarkMode ? 'border-slate-800/80 bg-[#1c2734]' : 'border-slate-100 bg-slate-50/70'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: selectedColor }}
                  >
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">{isFa ? 'ایجاد دپارتمان جدید' : 'New Department'}</h3>
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {isFa ? 'پیکربندی هوشمند دسته‌بندی و کانال پاسخگویی' : 'Configure support channel and routing'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAddModal(false)}
                  className={`p-1.5 rounded-xl transition-colors ${
                    isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* Department Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1.5">
                      {isFa ? 'نام دپارتمان (فارسی):' : 'Department Name:'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isFa ? 'مثال: پشتیبانی فنی سرور' : 'e.g. Technical Support'}
                      value={nameFa}
                      onChange={(e) => setNameFa(e.target.value)}
                      className={`w-full p-2.5 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#007AFF]/30 transition-all ${
                        isDarkMode ? 'bg-[#242f3d] text-white placeholder-slate-500' : 'bg-slate-100/90 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1.5">
                      {isFa ? 'شناسه انگلیسی (Slug):' : 'Slug Identifier:'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. tech-support"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full p-2.5 rounded-2xl font-mono dir-ltr text-left focus:outline-hidden focus:ring-2 focus:ring-[#007AFF]/30 transition-all ${
                        isDarkMode ? 'bg-[#242f3d] text-white placeholder-slate-500' : 'bg-slate-100/90 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="font-semibold block mb-1.5">
                    {isFa ? 'توضیحات و راهنمای مشتری:' : 'Channel Description:'}
                  </label>
                  <input
                    type="text"
                    placeholder={isFa ? 'پاسخگویی به سوالات قبل از خرید و مشاوره پلن‌ها' : 'Assisting customers with pre-sales inquiries'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`w-full p-2.5 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#007AFF]/30 transition-all ${
                      isDarkMode ? 'bg-[#242f3d] text-white placeholder-slate-500' : 'bg-slate-100/90 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* iOS Color Swatches */}
                <div>
                  <label className="font-semibold block mb-2">
                    {isFa ? 'رنگ شاخص دپارتمان (پالت اپل iOS):' : 'Department Theme Color:'}
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {IOS_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => setSelectedColor(c.hex)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          selectedColor === c.hex ? 'ring-3 ring-offset-2 ring-[#007AFF] scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {selectedColor === c.hex && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Working Hours */}
                <div>
                  <label className="font-semibold block mb-1.5">
                    {isFa ? 'ساعات کاری و پاسخگویی:' : 'Operating Hours:'}
                  </label>
                  <input
                    type="text"
                    value={workingHours}
                    onChange={(e) => setWorkingHours(e.target.value)}
                    className={`w-full p-2.5 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-[#007AFF]/30 transition-all ${
                      isDarkMode ? 'bg-[#242f3d] text-white' : 'bg-slate-100/90 text-slate-800'
                    }`}
                  />
                </div>

                {/* Assigned Operators Selector */}
                <div>
                  <label className="font-semibold block mb-2">
                    {isFa ? 'اپراتورهای عضو این دپارتمان:' : 'Assigned Staff Agents:'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {operators.map((op) => {
                      const isSelected = selectedOpIds.includes(op.id);
                      return (
                        <div
                          key={op.id}
                          onClick={() => toggleOperator(op.id)}
                          className={`p-2.5 rounded-2xl flex items-center gap-2 cursor-pointer transition-all ${
                            isSelected
                              ? (isDarkMode ? 'bg-[#007AFF]/25 ring-1 ring-[#007AFF]' : 'bg-[#007AFF]/10 ring-1 ring-[#007AFF]')
                              : (isDarkMode ? 'bg-[#242f3d]/60 hover:bg-[#242f3d]' : 'bg-slate-100/70 hover:bg-slate-100')
                          }`}
                        >
                          <img src={op.avatar} alt={op.name} className="w-7 h-7 rounded-full object-cover shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs truncate">{op.name}</div>
                            <div className={`text-[10px] truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{op.roleFa}</div>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#007AFF] shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Default Department Switch */}
                <div className={`p-3.5 rounded-2xl flex items-center justify-between ${
                  isDarkMode ? 'bg-[#242f3d]/50' : 'bg-slate-50'
                }`}>
                  <div>
                    <span className="font-bold block">{isFa ? 'دپارتمان پیش‌فرض مشتریان' : 'Default Department'}</span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {isFa ? 'در صورت انتخاب نکردن کاربر، پیام‌ها مستقیماً به اینجا می‌آیند.' : 'Fallback channel if customer does not choose'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 accent-[#007AFF] rounded-md cursor-pointer"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className={`px-4 py-2 rounded-2xl font-semibold transition-colors ${
                      isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {isFa ? 'انصراف' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#007AFF] hover:bg-[#0071e3] text-white font-bold rounded-2xl shadow-md shadow-[#007AFF]/25 transition-all"
                  >
                    {isFa ? 'ثبت و فعال‌سازی دپارتمان' : 'Save & Activate'}
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
