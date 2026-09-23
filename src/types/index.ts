export type WidgetRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
export type LauncherShape = 'circle' | 'pill' | 'square' | 'minimal';
export type LauncherIcon = 'chat' | 'message-square' | 'sparkles' | 'headset';
export type HeaderStyle = 'solid' | 'minimal' | 'split' | 'floating-glass' | 'card-banner';
export type BubbleStyle = 'rounded' | 'editorial' | 'flat' | 'bordered' | 'telegram' | 'ios' | 'modern-pill' | 'sharp-minimal' | 'floating-card';

export type WallpaperPattern = 
  | 'none' 
  | 'telegram-doodle' 
  | 'subtle-dots'
  | 'dots' 
  | 'geometric-mesh'
  | 'geometric-cubes' 
  | 'mesh-aura' 
  | 'circuit' 
  | 'blueprint' 
  | 'topography' 
  | 'stars'
  | 'stars-constellation' 
  | 'moroccan-arabesque';

export type ChatPattern = WallpaperPattern;

export type LayoutStyle = 
  | 'telegram-mac' 
  | 'ios-glass' 
  | 'neo-card' 
  | 'compact-dock' 
  | 'terminal-geek' 
  | 'luxury-concierge';

export type LauncherStyle = 
  | 'circle' 
  | 'pill-expanded' 
  | 'minimal-dock' 
  | 'glow-pulse';

export interface ThemeConfig {
  id: string;
  name: string;
  nameFa: string;
  category: string;
  categoryFa: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  bgMode: 'light' | 'dark';
  widgetRadius: WidgetRadius;
  launcherShape: LauncherShape;
  launcherIcon: LauncherIcon;
  headerStyle: HeaderStyle;
  bubbleStyle: BubbleStyle;
  badgeColor?: string;
  borderColor?: string;
  fontFamily?: string;

  // Rich Template & Pattern Extensions
  pattern: ChatPattern;
  patternOpacity?: number;
  layoutStyle: LayoutStyle;
  launcherStyle: LauncherStyle;
  wallpaperColor?: string;
  showQuickPrompts?: boolean;
  quickPrompts?: string[];
  soundTheme?: 'ios' | 'telegram' | 'chime' | 'pop' | 'mute';
  glassEffect?: boolean;
}

export type ConversationStatus = 'active' | 'pending' | 'closed' | 'unread' | 'blocked';

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: 'visitor' | 'operator' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    size: string;
    type: string;
    url?: string;
  };
  reaction?: string;
  read: boolean;
  isEdited?: boolean;
  editedAt?: string;
}

export interface Conversation {
  id: string;
  visitorId: string;
  visitorName: string;
  visitorEmail?: string;
  visitorPhone?: string;
  visitorIp: string;
  visitorLocation: string;
  visitorBrowser: string;
  visitorDevice: string;
  currentPage: string;
  departmentId: string;
  operatorId: string;
  status: ConversationStatus;
  unreadCount: number;
  lastMessageAt: string;
  messages: ChatMessage[];
  tags: string[];
  internalNotes: string[];
  isBlocked?: boolean;
  blockedReason?: string;
  feedback?: string;
  rating?: number | {
    stars: number;
    feedback?: string;
    createdAt: string;
  };
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'supervisor';
  roleFa?: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  departmentIds: string[];
  avatar?: string;
  activeChatsCount?: number;
  totalResolvedCount?: number;
  ratingAverage?: number;
  ratingAvg: number;
  shifts?: string;
}

export interface Department {
  id: string;
  name: string;
  nameFa: string;
  description?: string;
  descriptionFa?: string;
  workingHours?: string;
  color: string;
  isDefault?: boolean;
  activeOperatorsCount?: number;
}

export interface OfflineLead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  departmentId: string;
  message: string;
  createdAt: string;
  status: 'new' | 'reviewed' | 'resolved';
}

export interface LiveVisitor {
  id: string;
  name: string;
  ip: string;
  city: string;
  country?: string;
  location?: string;
  browser: string;
  device: string;
  currentPage?: string;
  currentUrl: string;
  pageTitle: string;
  referrer?: string;
  timeOnSiteMinutes?: number;
  durationSeconds?: number;
  status: 'browsing' | 'chatting' | 'idle';
  inChat?: boolean;
  conversationId?: string;
  isOnline?: boolean;
}

export type Visitor = LiveVisitor;

export interface CannedResponse {
  id: string;
  title: string;
  shortcut: string;
  text: string;
  departmentId?: string;
  category?: string;
}

export interface InstallConfig {
  siteUrl: string;
  databaseType?: 'mysql' | 'sqlite' | 'postgresql';
  dbType: 'mysql' | 'sqlite' | 'postgresql';
  dbHost?: string;
  dbName?: string;
  dbUser?: string;
  licenseKey?: string;
  isInstalled?: boolean;
  adminName?: string;
  adminEmail?: string;
  siteTitle?: string;
  version?: string;
}
