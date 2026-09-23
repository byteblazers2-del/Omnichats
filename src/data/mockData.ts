import { Operator, Department, Visitor, Conversation, OfflineLead, CannedResponse, InstallConfig } from '../types';

export const initialOperators: Operator[] = [
  {
    id: 'op_1',
    name: 'مدیر ارشد سیستم',
    email: 'admin@company.com',
    role: 'admin',
    roleFa: 'مدیر ارشد',
    status: 'online',
    departmentIds: ['dept_1'],
    ratingAvg: 5.0,
    avatar: '', // Clean default without external photo placeholder
    shifts: 'شنبه تا چهارشنبه، ۰۸:۳۰ الی ۱۷:۰۰',
  }
];

export const initialDepartments: Department[] = [
  {
    id: 'dept_1',
    name: 'General & Sales',
    nameFa: 'پشتیبانی و فروش',
    description: 'دپارتمان اصلی و پیش‌فرض برای دریافت درخواست‌های مشتریان',
    descriptionFa: 'دپارتمان اصلی و پیش‌فرض برای دریافت درخواست‌های مشتریان',
    color: '#007AFF',
    activeOperatorsCount: 1,
    workingHours: '۰۸:۳۰ الی ۲۰:۰۰',
    isDefault: true,
  }
];

export const initialVisitors: Visitor[] = [];

export const initialConversations: Conversation[] = [];

export const initialOfflineLeads: OfflineLead[] = [];

export const initialCannedResponses: CannedResponse[] = [
  {
    id: 'cr_1',
    shortcut: '/salam',
    title: 'خوش‌آمدگویی رسمی',
    text: 'سلام و احترام! وقتتون بخیر، چطور می‌توانم شما را راهنمایی کنم؟',
  },
  {
    id: 'cr_2',
    shortcut: '/wait',
    title: 'بررسی اطلاعات',
    text: 'لطفاً چند لحظه تأمل بفرمایید تا درخواست شما را بررسی کنم.',
  },
  {
    id: 'cr_3',
    shortcut: '/bye',
    title: 'پایان گفتگو',
    text: 'از ارتباط شما سپاسگزاریم. چنانچه سوال دیگری بود در خدمت شما هستیم. روز خوبی داشته باشید!',
  }
];

export const initialInstallConfig: InstallConfig = {
  siteUrl: 'https://yoursite.com',
  dbType: 'mysql',
  dbHost: 'localhost',
  dbName: 'omnichat_db',
  dbUser: 'root',
  isInstalled: false,
  adminName: 'مدیر ارشد',
  adminEmail: 'admin@company.com',
  siteTitle: 'سامانه گفتگوی آنلاین OmniChat',
  version: '3.0.0'
};
