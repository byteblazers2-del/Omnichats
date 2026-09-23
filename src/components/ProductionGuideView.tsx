import React, { useState } from 'react';
import { 
  Server, 
  ShieldCheck, 
  Database, 
  DollarSign, 
  FileCheck2, 
  ShoppingBag,
  Sparkles,
  Lock,
  PackageCheck,
  CheckCircle2,
  HardDrive,
  Globe2,
  Cpu,
  WifiOff,
  Zap,
  KeyRound
} from 'lucide-react';

interface ProductionGuideViewProps {
  language: 'fa' | 'en';
  onNavigateToInstall?: () => void;
  onNavigateToThemes?: () => void;
  isDarkMode?: boolean;
}

export const ProductionGuideView: React.FC<ProductionGuideViewProps> = ({
  language,
  onNavigateToInstall,
  onNavigateToThemes,
  isDarkMode = false,
}) => {
  const isFa = language === 'fa';
  const [activeSection, setActiveSection] = useState<'sovereign' | 'architecture' | 'wordpress' | 'pricing' | 'checklist'>('sovereign');

  return (
    <div className={`flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-8 text-right select-text transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0e1621] text-slate-100' : 'bg-[#f4f6f8] text-slate-800'
    }`}>
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Top Header Card */}
        <div className={`rounded-3xl p-6 md:p-8 space-y-5 transition-all ${
          isDarkMode ? 'bg-[#17212b] shadow-[0_4px_20px_rgba(0,0,0,0.2)]' : 'bg-white shadow-[0_2px_16px_rgba(15,23,42,0.04)]'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2.5 ${
                isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
              }`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{isFa ? 'طراحی ۱۰۰٪ مستقل و بدون وابستگی به سرور سازنده' : '100% Zero-Phone-Home Autonomous Architecture'}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                {isFa ? 'نقشه راه فنی، معماری مستقل و استراتژی فروش omni chat' : 'Commercial Blueprint & Sovereign Architecture'}
              </h1>
              <p className={`text-xs md:text-sm mt-2 leading-relaxed max-w-3xl ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {isFa 
                  ? 'این نرم‌افزار به صورت ۱۰۰٪ خودکفا طراحی شده است؛ به این معنی که بدون هیچ‌گونه وابستگی به سرور شما یا دامنه‌های بیرونی، روی هاست شخصی خریدار کار می‌کند و در صورت قطعی اینترنت بین‌الملل یا از دسترس خارج شدن سرور فروشنده، برای همیشه فعال می‌ماند.'
                  : 'Zero external phone-home dependencies. Everything runs securely on the buyer\'s own shared hosting server forever.'}
              </p>
            </div>

            {/* Quick Action */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onNavigateToInstall}
                className="px-4 py-2.5 rounded-2xl bg-[#007AFF] hover:bg-[#0071e3] text-white text-xs font-bold shadow-md shadow-[#007AFF]/25 transition-all flex items-center gap-2"
              >
                <PackageCheck className="w-4 h-4" />
                <span>{isFa ? 'ویزارد نصب محلی' : 'Install Wizard'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 pt-4 overflow-x-auto text-xs">
            {[
              { id: 'sovereign', label: isFa ? '۱. استقلال کامل از سرور سازنده' : '1. Zero-Dependency Core', icon: HardDrive, highlight: true },
              { id: 'architecture', label: isFa ? '۲. سازگاری با هاست‌های اشتراکی' : '2. Shared Host Compatibility', icon: Server },
              { id: 'wordpress', label: isFa ? '۳. همگام‌سازی ووکامرس و وردپرس' : '3. WooCommerce Integration', icon: ShoppingBag },
              { id: 'pricing', label: isFa ? '۴. استراتژی قیمت‌گذاری و سود' : '4. Pricing & Revenue', icon: DollarSign },
              { id: 'checklist', label: isFa ? '۵. چک‌لیست قبل از عرضه' : '5. Release Checklist', icon: FileCheck2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-[#007AFF] text-white shadow-md shadow-[#007AFF]/25' 
                      : tab.highlight
                      ? (isDarkMode ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70')
                      : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 1: Zero-Dependency Sovereign Core (The user's primary business requirement) */}
        {activeSection === 'sovereign' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_16px_rgba(15,23,42,0.04)] space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                  <WifiOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {isFa ? 'تضمین عدم وابستگی به سرور شما یا دامنه‌های ثالث (Zero Phone-Home)' : '100% Autonomous Sovereign Architecture'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {isFa ? 'چرا خریدار بدون ترس از قطعی یا لغو اشتراک، عاشق این محصول می‌شود؟' : 'Why buyers trust self-hosted over cloud SaaS'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* 1. Offline Cryptographic Verification */}
                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <KeyRound className="w-4 h-4 text-indigo-600" />
                    <span>{isFa ? 'اعتبارسنجی آفلاین کلید لایسنس (Cryptographic)' : 'Offline Asymmetric Key Verification'}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    {isFa
                      ? 'به جای اینکه نرم‌افزار در هر درخواست، با سرور شما تماس بگیرد (که اگر سرور شما داون شود یا ۵ سال دیگر تعطیل شود، سایت مشتری مختل شود)، صحت کلید فعال‌سازی با امضای دیجیتال نامتقارن (Ed25519) در کسری از میلی‌ثانیه داخل خود هاست خریدار بررسی می‌شود.'
                      : 'License validity is verified locally using cryptographic public-key signatures without pinging external licensing servers.'}
                  </p>
                </div>

                {/* 2. Zero Telemetry & Phone-Home */}
                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isFa ? 'صفر درصد ارسال داده یا تلمتری به بیرون' : 'Zero Telemetry & Absolute Privacy'}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    {isFa
                      ? 'تمام اطلاعات پیام‌ها، مشخصات مشتریان، شماره تماس‌ها و آی‌پی‌ها منحصراً در پایگاه داده خود خریدار (MySQL یا SQLite) ذخیره می‌شود و حتی یک بیت داده به هیچ سرور خارجی منتقل نمی‌شود.'
                      : 'All messages, chats, and lead phones reside 100% locally on the buyer\'s own database.'}
                  </p>
                </div>

                {/* 3. Local Real-Time Stream Engine */}
                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span>{isFa ? 'موتور لایو استریم کاملاً محلی (PHP SSE)' : 'Local Stream Engine (No Pusher/Socket.io Cloud)'}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    {isFa
                      ? 'ارسال و دریافت پیام‌های زنده از طریق استریم اختصاصی بر روی همان هاست خریدار (/livechat/stream.php) انجام می‌گیرد؛ بنابراین نیازی به اشتراک ابری گران‌قیمت یا سرویس‌های خارجی نیست.'
                      : 'Real-time live chat streams directly through buyer\'s domain via native PHP Server-Sent Events.'}
                  </p>
                </div>

                {/* 4. Bundled Assets & Fonts */}
                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                    <Globe2 className="w-4 h-4 text-indigo-600" />
                    <span>{isFa ? 'فونت‌ها و اسکریپت‌های پکیج‌شده در فایل فشرده' : '100% Bundled Local Assets'}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    {isFa
                      ? 'فونت محبوب وزیرمتن، آیکون‌ها و کدهای کلاینت همگی در بسته فایل فشرده همراه افزونه قرار داده شده‌اند و به هیچ CDN خارجی وابسته نیستند؛ در نتیجه حتی در شرایط فیلترینگ یا قطعی اینترنت بین‌الملل، برنامه با سرعت بالا لود می‌شود.'
                      : 'All fonts and assets are embedded locally. Works flawlessly in intranet or restricted networks.'}
                  </p>
                </div>

              </div>

              {/* Technical Comparison Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-950 space-y-2">
                <div className="font-bold text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>{isFa ? 'ارزش تجاری فوق‌العاده این معماری در مارکت ژاکت و راست‌چین:' : 'Key Value Proposition in Marketplaces:'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-900/80">
                  {isFa 
                    ? 'بزرگ‌ترین دغدغه خریداران اسکریپت و افزونه در ایران، ترس از کارافتادن محصول در صورت مسدود شدن دامنه توسعه‌دهنده یا تحریم‌هاست. وقتی شما در توضیحات محصول اعلام می‌کنید: «۱۰۰٪ سلف‌هاستد، بدون نیاز به سرور مرکزی، و با حفظ کامل حریم خصوصی داده‌ها»، محصول شما نسبت به رقبای ابری (کریسپ، گفتینو، رایچت) مزیت رقابتی بی‌نظیری پیدا می‌کند.'
                    : 'Promoting true zero-dependency lifetime sovereignty gives you an unbeatable edge over SaaS monthly subscriptions.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Shared Hosting Architecture */}
        {activeSection === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_16px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {isFa ? 'معماری فنی هماهنگ با هاست‌های اشتراکی ایران (cPanel / DirectAdmin)' : 'Lightweight Shared Host Architecture'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {isFa ? 'بدون نیاز به سرور مجازی، پورت اختصاصی یا دسترسی Root' : 'Zero root access required. Runs on plain PHP 8.1+ & MySQL.'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2">
                  <span className="font-bold text-slate-900 block">{isFa ? 'موتور SSE کم‌مصرف' : 'Native PHP SSE'}</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isFa 
                      ? 'بر روی پورت‌های ۸۰ و ۴۴۳ بدون نیاز به باز کردن پورت فایروال کار می‌کند و مصرف رم آن زیر ۲۰ مگابایت است.'
                      : 'Runs smoothly on ports 80/443 without firewall hurdles.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2">
                  <span className="font-bold text-slate-900 block">{isFa ? 'پایگاه داده بهینه' : 'Indexed MySQL Tables'}</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isFa 
                      ? 'جداول با ایندکس‌های کامپوزیت برای مکالمات، به طوری که حتی با ۱۰۰ هزار پیام، سرعت پاسخگویی زیر ۱۰ میلی‌ثانیه بماند.'
                      : 'Composite indexes keep chat queries sub-10ms.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2">
                  <span className="font-bold text-slate-900 block">{isFa ? 'قرنطینه کامل در فرانت' : 'Shadow DOM Isolation'}</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isFa 
                      ? 'ویجت در Shadow DOM رندر می‌شود تا قالب‌های شلوغ وردپرس (مثل وودمارت یا انفولد) استایل آن را به‌هم نریزند.'
                      : 'Shadow DOM protects widget styling against messy theme CSS.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: WordPress & WooCommerce */}
        {activeSection === 'wordpress' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_16px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {isFa ? 'اتصال هوشمند به ووکامرس (برگ برنده فروش در ژاکت)' : 'WooCommerce & WordPress Deep Integration'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {isFa ? 'امکاناتی که فروشگاه‌های آنلاین عاشقش می‌شوند' : 'Features online store owners willingly pay for'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2">
                  <span className="font-bold text-slate-900 block">{isFa ? 'مشاهده زنده سبد خرید' : 'Live Cart Inspector'}</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isFa 
                      ? 'اپراتور دقیقاً می‌بیند مشتری چه کالاهایی در سبد دارد و در همان لحظه می‌تواند کد تخفیف اختصاصی بفرستد.'
                      : 'Agents can see products currently in visitor cart and recommend coupons.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2">
                  <span className="font-bold text-slate-900 block">{isFa ? 'اتصال خودکار بدون لاگین' : 'Zero-Friction Auth'}</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isFa 
                      ? 'اگر کاربر در وردپرس وارد شده باشد، نام، ایمیل، شماره موبایل و مجموع خریدهای قبلی خودکار در پنل اپراتور ظاهر می‌شود.'
                      : 'Automatically populates customer name and past spend from WP sessions.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2">
                  <span className="font-bold text-slate-900 block">{isFa ? 'سامانه پیامک ایران' : 'Iranian SMS Hook'}</span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isFa 
                      ? 'ارسال پیامک با پترن خدماتی کاوه‌نگار، فراز اس‌ام‌اس یا نجوا هنگام دریافت پیام جدید در ساعات تعطیلی فروشگاه.'
                      : 'Instant SMS notifications to store owners when new leads arrive.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Pricing */}
        {activeSection === 'pricing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_16px_rgba(15,23,42,0.04)] space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {isFa ? 'مدل قیمت‌گذاری و درآمد پایدار در مارکت‌های ژاکت و راست‌چین' : 'Marketplace Pricing Model'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {isFa ? 'استراتژی فتح بازار با قیمت‌گذاری طلایی' : 'Pricing points designed for maximum conversion'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2">
                  <span className="font-bold text-slate-900 block">{isFa ? 'پلن پایه (تک‌دامنه)' : 'Single Site License'}</span>
                  <div className="text-lg font-bold text-indigo-600 font-mono">۵۹۰,۰۰۰ تومان</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isFa ? 'مناسب برای ۸۵٪ خریداران عادی و فروشگاه‌های تازه‌تاسیس.' : 'Best for small shops.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-indigo-50/70 text-indigo-950 space-y-2">
                  <span className="font-bold text-indigo-900 block">{isFa ? 'پلن فریلنسر (۵ دامنه)' : 'Developer License (5 Sites)'}</span>
                  <div className="text-lg font-bold text-indigo-700 font-mono">۱,۲۹۰,۰۰۰ تومان</div>
                  <p className="text-[11px] text-indigo-800/80 leading-relaxed">
                    {isFa ? 'محبوب برای طراحان سایت و وب‌مسترها که برای مشتریان خود سایت می‌زنند.' : 'Best for agencies and freelancers.'}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/80 space-y-2">
                  <span className="font-bold text-slate-900 block">{isFa ? 'پشتیبانی VIP سالیانه' : 'Annual VIP Support'}</span>
                  <div className="text-lg font-bold text-emerald-600 font-mono">۲۹۰,۰۰۰ تومان</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isFa ? 'تمدید آپدیت‌ها و پشتیبانی اختصاصی تیکتی در سال‌های بعد.' : 'Recurring maintenance revenue.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Launch Checklist */}
        {activeSection === 'checklist' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_2px_16px_rgba(15,23,42,0.04)] space-y-5">
              <h3 className="text-base font-bold text-slate-800">
                {isFa ? 'چک‌لیست آماده‌سازی قبل از ارسال فایل به تایید ژاکت' : 'Pre-Launch Verification Checklist'}
              </h3>
              
              <div className="space-y-3 text-xs">
                {[
                  isFa ? 'تست نصب با PHP 8.1 و PHP 8.2 و PHP 8.3 روی cPanel واقعی' : 'Verified PHP 8.1 - 8.3 support',
                  isFa ? 'قرارگیری تمامی فونت‌های وزیرمتن و آیکون‌ها درون بسته دانلودی (عدم ارجاع به لینک‌های فیلتر شده)' : 'All assets bundled locally',
                  isFa ? 'تست عدم تداخل Shadow DOM با قالب‌های وودمارت (Woodmart) و فلت‌سام (Flatsome)' : 'Zero CSS collision with popular themes',
                  isFa ? 'تهیه راهنمای ویدئویی ۵ دقیقه‌ای از نحوه آپلود و فعال‌سازی در هاست' : 'Quick 5-minute video tutorial included',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3.5 bg-slate-50/80 rounded-2xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
