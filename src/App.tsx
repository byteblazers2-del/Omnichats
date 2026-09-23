import React, { useState, useEffect } from 'react';
import { 
  initialOperators, 
  initialDepartments, 
  initialVisitors, 
  initialConversations, 
  initialOfflineLeads, 
  initialCannedResponses,
  initialInstallConfig 
} from './data/mockData';
import { mockThemes } from './data/mockThemes';
import { 
  Operator, 
  Department, 
  Visitor, 
  Conversation, 
  OfflineLead, 
  CannedResponse, 
  ThemeConfig, 
  InstallConfig,
  ChatMessage
} from './types';
import { ApiClient } from './utils/apiClient';

// Core Dashboard Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LiveChatsView } from './components/LiveChatsView';
import { LiveVisitorsView } from './components/LiveVisitorsView';
import { ThemesStudioView } from './components/ThemesStudioView';
import { OperatorsView } from './components/OperatorsView';
import { DepartmentsView } from './components/DepartmentsView';
import { OfflineLeadsView } from './components/OfflineLeadsView';
import { AnalyticsView } from './components/AnalyticsView';
import { EmbedSettingsView } from './components/EmbedSettingsView';
import { EnterpriseDeployment } from './components/EnterpriseDeployment';
import { CustomerWidget } from './components/CustomerWidget';
import { InstallWizardModal } from './components/InstallWizardModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Global App States
  const [language, setLanguage] = useState<'fa' | 'en'>('fa');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [activeTab, setActiveTab] = useState<
    'chats' | 'visitors' | 'themes' | 'operators' | 'departments' | 'offline-leads' | 'analytics' | 'embed' | 'commercial-guide'
  >('chats');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Entities & Data State (MySQL via REST API as primary source)
  const [operators, setOperators] = useState<Operator[]>(() => {
    const saved = ApiClient.getSavedOperator();
    return saved ? [saved] : initialOperators;
  });

  const [currentOperator, setCurrentOperator] = useState<Operator>(() => {
    const saved = ApiClient.getSavedOperator();
    return saved || initialOperators[0];
  });

  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [offlineLeads, setOfflineLeads] = useState<OfflineLead[]>(initialOfflineLeads);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>(initialCannedResponses);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(mockThemes[0]);
  const [installConfig, setInstallConfig] = useState<InstallConfig>(initialInstallConfig);

  // Modals & Authentication
  const [showInstallWizard, setShowInstallWizard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // Load Primary Data from MySQL Backend on Mount & Interval
  const fetchBackendData = async () => {
    try {
      const [convs, ops, depts, leads] = await Promise.allSettled([
        ApiClient.getConversations(),
        ApiClient.getOperators(),
        ApiClient.getDepartments(),
        ApiClient.getLeads(),
      ]);

      if (convs.status === 'fulfilled' && convs.value && convs.value.length > 0) {
        setConversations(convs.value);
        if (!activeConversationId) {
          setActiveConversationId(convs.value[0].id);
        }
      }

      if (ops.status === 'fulfilled' && ops.value && ops.value.length > 0) {
        setOperators(ops.value);
      }

      if (depts.status === 'fulfilled' && depts.value && depts.value.length > 0) {
        setDepartments(depts.value);
      }

      if (leads.status === 'fulfilled' && leads.value) {
        setOfflineLeads(leads.value);
      }
    } catch (e) {
      console.warn('Backend sync in offline/demo fallback mode', e);
    }
  };

  useEffect(() => {
    fetchBackendData();
    const interval = setInterval(fetchBackendData, 5000);
    return () => clearInterval(interval);
  }, [activeConversationId]);

  // Active conversation object
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || (conversations.length > 0 ? conversations[0] : null);

  // Send message from Operator (Admin Console)
  const handleSendMessageFromOperator = async (convId: string, text: string, isInternalNote?: boolean, fileAttachment?: any) => {
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    if (isInternalNote) {
      handleAddNote(convId, text);
      return;
    }

    const optimisticMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      sender: 'operator',
      senderName: currentOperator.name,
      text,
      timestamp: timeStr,
      read: true,
      fileAttachment,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            lastMessageAt: timeStr,
            messages: [...c.messages, optimisticMsg],
          };
        }
        return c;
      })
    );

    try {
      await ApiClient.sendMessage({
        conversationId: convId,
        text,
        sender: 'operator',
        fileAttachment
      });
    } catch (err) {
      console.warn('Operator message sync error:', err);
    }
  };

  // Edit Message
  const handleEditMessage = async (convId: string, messageId: string, newText: string) => {
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, text: newText, isEdited: true, editedAt: timeStr } : m
            ),
          };
        }
        return c;
      })
    );

    try {
      await ApiClient.editMessage(messageId, newText);
    } catch (err) {
      console.warn('Edit message sync error:', err);
    }
  };

  // Delete Message
  const handleDeleteMessage = async (convId: string, messageId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            messages: c.messages.filter((m) => m.id !== messageId),
          };
        }
        return c;
      })
    );

    try {
      await ApiClient.deleteMessage(messageId);
    } catch (err) {
      console.warn('Delete message sync error:', err);
    }
  };

  // Delete Conversation Completely
  const handleDeleteConversation = async (convId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== convId));
    if (activeConversationId === convId) {
      const remaining = conversations.filter((c) => c.id !== convId);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }

    try {
      await ApiClient.deleteConversation(convId);
    } catch (err) {
      console.warn('Delete conversation sync error:', err);
    }
  };

  // Block / Unblock Visitor
  const handleToggleBlockVisitor = async (convId: string, reason?: string) => {
    const targetConv = conversations.find((c) => c.id === convId);
    if (!targetConv) return;
    const newBlockState = !targetConv.isBlocked;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            isBlocked: newBlockState,
            blockedReason: newBlockState ? (reason || 'مسدود شده توسط مدیر پشتیبانی') : undefined,
          };
        }
        return c;
      })
    );

    try {
      await ApiClient.toggleBlock(convId, newBlockState, reason);
    } catch (err) {
      console.warn('Toggle block sync error:', err);
    }
  };

  // Add Internal Note
  const handleAddNote = async (convId: string, noteText: string) => {
    const targetConv = conversations.find((c) => c.id === convId);
    const updatedNotes = [...(targetConv?.internalNotes || []), `${currentOperator.name}: ${noteText}`];

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return { ...c, internalNotes: updatedNotes };
        }
        return c;
      })
    );

    try {
      await ApiClient.updateConversationMeta(convId, { internal_notes: updatedNotes });
    } catch (err) {
      console.warn('Update note sync error:', err);
    }
  };

  // Add Tag
  const handleAddTag = async (convId: string, tag: string) => {
    const targetConv = conversations.find((c) => c.id === convId);
    if (!targetConv || targetConv.tags.includes(tag)) return;
    const updatedTags = [...targetConv.tags, tag];

    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, tags: updatedTags } : c))
    );

    try {
      await ApiClient.updateConversationMeta(convId, { tags: updatedTags });
    } catch (err) {
      console.warn('Update tag sync error:', err);
    }
  };

  // Remove Tag
  const handleRemoveTag = async (convId: string, tag: string) => {
    const targetConv = conversations.find((c) => c.id === convId);
    if (!targetConv) return;
    const updatedTags = targetConv.tags.filter((t) => t !== tag);

    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, tags: updatedTags } : c))
    );

    try {
      await ApiClient.updateConversationMeta(convId, { tags: updatedTags });
    } catch (err) {
      console.warn('Remove tag sync error:', err);
    }
  };

  // Close Conversation
  const handleCloseConversation = (convId: string) => {
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            status: c.status === 'closed' ? 'active' : 'closed',
            messages: [
              ...c.messages,
              {
                id: `msg-sys-${Date.now()}`,
                conversationId: convId,
                sender: 'system',
                senderName: 'سیستم',
                text: c.status === 'closed' ? 'گفتگو مجدداً بازگشایی شد.' : 'این گفتگو توسط اپراتور بسته شد.',
                timestamp: timeStr,
                read: true,
              },
            ],
          };
        }
        return c;
      })
    );
  };

  // Transfer Conversation
  const handleTransferConversation = async (convId: string, targetOperatorId: string, targetDeptId: string) => {
    const targetDept = departments.find((d) => d.id === targetDeptId);
    const targetOp = operators.find((o) => o.id === targetOperatorId);
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            departmentId: targetDeptId,
            operatorId: targetOperatorId,
            messages: [
              ...c.messages,
              {
                id: `msg-sys-${Date.now()}`,
                conversationId: convId,
                sender: 'system',
                senderName: 'سیستم',
                text: `گفتگو به دپارتمان «${targetDept?.nameFa || targetDeptId}» و کارشناس «${targetOp?.name || targetOperatorId}» ارجاع شد.`,
                timestamp: timeStr,
                read: true,
              },
            ],
          };
        }
        return c;
      })
    );

    try {
      await ApiClient.updateConversationMeta(convId, {
        department_id: targetDeptId,
        operator_id: targetOperatorId
      });
    } catch (err) {
      console.warn('Transfer sync error:', err);
    }
  };

  // Send message from Visitor (Customer Widget)
  const handleSendMessageFromVisitor = async (text: string, fileAttachment?: any) => {
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    let targetConvId = activeConversation?.id;

    if (!targetConvId) {
      targetConvId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: targetConvId,
        visitorId: `vis-${Date.now()}`,
        visitorName: 'کاربر مهمان وب‌سایت',
        visitorIp: '188.253.12.98',
        visitorLocation: 'تهران، ایران',
        visitorBrowser: 'Chrome 122 / Windows 11',
        visitorDevice: 'Desktop PC',
        currentPage: '/pricing',
        departmentId: departments[0]?.id || 'dept_1',
        operatorId: currentOperator.id,
        status: 'active',
        unreadCount: 1,
        lastMessageAt: timeStr,
        messages: [
          {
            id: `msg-${Date.now()}`,
            conversationId: targetConvId,
            sender: 'visitor',
            senderName: 'کاربر مهمان وب‌سایت',
            text,
            timestamp: timeStr,
            read: false,
            fileAttachment,
          },
        ],
        tags: ['بازدیدکننده جدید'],
        internalNotes: [],
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(targetConvId);
    } else {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: targetConvId,
        sender: 'visitor',
        senderName: activeConversation?.visitorName || 'کاربر مهمان وب‌سایت',
        text,
        timestamp: timeStr,
        read: false,
        fileAttachment,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === targetConvId) {
            return {
              ...c,
              lastMessageAt: timeStr,
              unreadCount: c.unreadCount + 1,
              messages: [...c.messages, newMsg],
            };
          }
          return c;
        })
      );
    }

    try {
      await ApiClient.sendMessage({
        conversationId: targetConvId,
        text,
        sender: 'visitor',
        fileAttachment
      });
    } catch (err) {
      console.warn('Visitor message sync error:', err);
    }
  };

  // Submit Offline Lead
  const handleSubmitOfflineLead = async (data: {
    name: string;
    email: string;
    phone: string;
    deptId: string;
    message: string;
  }) => {
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    const newLead: OfflineLead = {
      id: `lead-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      departmentId: data.deptId,
      message: data.message,
      createdAt: timeStr,
      status: 'new',
    };

    setOfflineLeads((prev) => [newLead, ...prev]);

    try {
      await ApiClient.submitOfflineLead(data);
    } catch (err) {
      console.warn('Offline lead sync error:', err);
    }
  };

  // Submit Rating
  const handleSubmitRating = (stars: number, feedback: string) => {
    if (!activeConversation) return;
    const timeStr = new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeConversation.id) {
          return {
            ...c,
            rating: { stars, feedback, createdAt: timeStr },
          };
        }
        return c;
      })
    );
  };

  // Operator Status & Management
  const handleOperatorStatusChange = async (status: 'online' | 'busy' | 'offline') => {
    setCurrentOperator((prev) => ({ ...prev, status }));
    setOperators((prev) => prev.map((o) => (o.id === currentOperator.id ? { ...o, status } : o)));

    try {
      await ApiClient.updateMyStatus(status);
    } catch (err) {
      console.warn('Status change sync error:', err);
    }
  };

  // Operators CRUD
  const handleAddOperator = async (newOpData: Omit<Operator, 'id' | 'ratingAvg'> & { password?: string }) => {
    const tempId = `op-${Date.now()}`;
    const newOp: Operator = {
      ...newOpData,
      id: tempId,
      ratingAvg: 5.0,
      activeChatsCount: 0,
      totalResolvedCount: 0,
    };
    setOperators((prev) => [...prev, newOp]);

    try {
      const realId = await ApiClient.saveOperator(newOpData);
      if (realId) {
        setOperators((prev) => prev.map((o) => (o.id === tempId ? { ...o, id: realId } : o)));
      }
    } catch (err) {
      console.warn('Save operator error:', err);
    }
  };

  const handleUpdateOperator = async (updatedOp: Operator & { password?: string }) => {
    setOperators((prev) => prev.map((o) => (o.id === updatedOp.id ? updatedOp : o)));
    if (currentOperator.id === updatedOp.id) {
      setCurrentOperator(updatedOp);
    }

    try {
      await ApiClient.saveOperator(updatedOp);
    } catch (err) {
      console.warn('Update operator error:', err);
    }
  };

  const handleDeleteOperator = async (opId: string) => {
    setOperators((prev) => prev.filter((o) => o.id !== opId));
    try {
      await ApiClient.deleteOperator(opId);
    } catch (err) {
      console.warn('Delete operator error:', err);
    }
  };

  // Departments CRUD
  const handleAddDepartment = async (newDeptData: Omit<Department, 'id'>) => {
    const tempId = `dept-${Date.now()}`;
    const newDept: Department = { ...newDeptData, id: tempId };
    setDepartments((prev) => [...prev, newDept]);

    try {
      const realId = await ApiClient.saveDepartment(newDeptData);
      if (realId) {
        setDepartments((prev) => prev.map((d) => (d.id === tempId ? { ...d, id: realId } : d)));
      }
    } catch (err) {
      console.warn('Save department error:', err);
    }
  };

  const handleUpdateDepartment = async (updatedDept: Department) => {
    setDepartments((prev) => prev.map((d) => (d.id === updatedDept.id ? updatedDept : d)));
    try {
      await ApiClient.saveDepartment(updatedDept);
    } catch (err) {
      console.warn('Update department error:', err);
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== deptId));
    try {
      await ApiClient.deleteDepartment(deptId);
    } catch (err) {
      console.warn('Delete department error:', err);
    }
  };

  // Offline Leads Actions
  const handleUpdateLeadStatus = (leadId: string, status: 'new' | 'reviewed' | 'resolved') => {
    setOfflineLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
  };

  const handleDeleteLead = async (leadId: string) => {
    setOfflineLeads((prev) => prev.filter((l) => l.id !== leadId));
    try {
      await ApiClient.deleteLead(leadId);
    } catch (err) {
      console.warn('Delete lead error:', err);
    }
  };

  // Select Theme
  const handleSelectTheme = (theme: ThemeConfig) => {
    setCurrentTheme(theme);
  };

  // Update Theme
  const handleUpdateTheme = (updates: Partial<ThemeConfig>) => {
    setCurrentTheme((prev) => ({ ...prev, ...updates }));
  };

  // Save Install Config
  const handleSaveInstallConfig = (config: Partial<InstallConfig>) => {
    setInstallConfig((prev) => ({ ...prev, ...config }));
    setShowInstallWizard(false);
  };

  const unreadChatsCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const onlineVisitorsCount = visitors.filter((v) => v.status !== 'idle').length || 1;
  const newOfflineLeadsCount = offlineLeads.filter((l) => l.status === 'new').length;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isDarkMode ? 'bg-[#0e1621] text-white' : 'bg-slate-50 text-slate-900'
    }`} dir={language === 'fa' ? 'rtl' : 'ltr'}>
      {/* Top Main Navigation Header */}
      <Header
        currentOperator={currentOperator}
        onStatusChange={handleOperatorStatusChange}
        onlineVisitorsCount={onlineVisitorsCount}
        activeChatsCount={conversations.length}
        isWidgetOpen={isWidgetOpen}
        onToggleWidget={() => setIsWidgetOpen(!isWidgetOpen)}
        onOpenInstaller={() => setShowInstallWizard(true)}
        activeTab={activeTab}
        onNavigateTab={(tab: any) => setActiveTab(tab)}
        language={language}
        onToggleLanguage={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Modern iOS / Telegram Pro Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab: any) => setActiveTab(tab)}
          unreadChatsCount={unreadChatsCount}
          onlineVisitorsCount={onlineVisitorsCount}
          offlineLeadsCount={newOfflineLeadsCount}
          language={language}
          currentOperator={currentOperator}
          onOpenInstallWizard={() => setShowInstallWizard(true)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Main Workspace Tab Router */}
        <main className={`flex-1 flex flex-col overflow-hidden transition-colors ${
          isDarkMode ? 'bg-[#0e1621]' : 'bg-white'
        }`}>
          {activeTab === 'chats' && (
            <LiveChatsView
              conversations={conversations}
              selectedConvId={activeConversationId}
              onSelectConversation={(id) => {
                setActiveConversationId(id);
                ApiClient.markRead(id).catch(() => {});
              }}
              onSendMessage={handleSendMessageFromOperator}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onDeleteConversation={handleDeleteConversation}
              onToggleBlockVisitor={handleToggleBlockVisitor}
              onCloseConversation={handleCloseConversation}
              onTransferConversation={handleTransferConversation}
              onAddNote={handleAddNote}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              operators={operators}
              departments={departments}
              cannedResponses={cannedResponses}
              currentOperator={currentOperator}
              language={language}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'visitors' && (
            <LiveVisitorsView
              visitors={visitors}
              onStartChatWithVisitor={(visitor) => {
                const newConvId = `conv-${Date.now()}`;
                const newConv: Conversation = {
                  id: newConvId,
                  visitorId: visitor.id,
                  visitorName: visitor.name,
                  visitorIp: visitor.ip,
                  visitorLocation: visitor.city || 'تهران',
                  visitorBrowser: visitor.browser,
                  visitorDevice: visitor.device,
                  currentPage: visitor.currentPage || '/',
                  departmentId: departments[0]?.id || 'dept_1',
                  operatorId: currentOperator.id,
                  status: 'active',
                  unreadCount: 0,
                  lastMessageAt: 'الان',
                  messages: [
                    {
                      id: `msg-${Date.now()}`,
                      conversationId: newConvId,
                      sender: 'operator',
                      senderName: currentOperator.name,
                      text: `سلام! وقتتون بخیر. چطور می‌تونم در زمینه ${visitor.currentPage || 'سایت'} راهنماییتون کنم؟`,
                      timestamp: 'الان',
                      read: true,
                    },
                  ],
                  tags: ['چت شروع شده توسط اپراتور'],
                  internalNotes: [],
                };
                setConversations([newConv, ...conversations]);
                setActiveConversationId(newConvId);
                setActiveTab('chats');
              }}
              language={language}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'themes' && (
            <ThemesStudioView
              currentTheme={currentTheme}
              onSelectTheme={handleSelectTheme}
              onUpdateTheme={handleUpdateTheme}
              language={language}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'operators' && (
            <OperatorsView
              operators={operators}
              departments={departments}
              onAddOperator={handleAddOperator}
              onUpdateOperator={(op: any) => handleUpdateOperator(op)}
              onDeleteOperator={handleDeleteOperator}
              language={language}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentsView
              departments={departments}
              onAddDepartment={handleAddDepartment}
              onUpdateDepartment={(dept: any) => handleUpdateDepartment(dept)}
              onDeleteDepartment={handleDeleteDepartment}
              language={language}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'offline-leads' && (
            <OfflineLeadsView
              leads={offlineLeads}
              departments={departments}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onDeleteLead={handleDeleteLead}
              onConvertLeadToChat={(lead: OfflineLead) => {
                const newConvId = `conv-${Date.now()}`;
                const newConv: Conversation = {
                  id: newConvId,
                  visitorId: `vis-${Date.now()}`,
                  visitorName: lead.name,
                  visitorEmail: lead.email,
                  visitorPhone: lead.phone,
                  visitorIp: '188.253.12.98',
                  visitorLocation: 'تهران، ایران',
                  visitorBrowser: 'Chrome 122',
                  visitorDevice: 'Mobile / Web',
                  currentPage: '/contact',
                  departmentId: lead.departmentId,
                  operatorId: currentOperator.id,
                  status: 'active',
                  unreadCount: 0,
                  lastMessageAt: 'الان',
                  messages: [
                    {
                      id: `msg-lead-${Date.now()}`,
                      conversationId: newConvId,
                      sender: 'visitor',
                      senderName: lead.name,
                      text: lead.message,
                      timestamp: lead.createdAt,
                      read: true,
                    },
                  ],
                  tags: ['تبدیل شده از پیام آفلاین'],
                  internalNotes: [`تلفن تماس: ${lead.phone || 'ثبت نشده'}`],
                };
                setConversations([newConv, ...conversations]);
                setActiveConversationId(newConvId);
                setActiveTab('chats');
              }}
              language={language}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              operators={operators}
              language={language}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'embed' && (
            <EmbedSettingsView
              installConfig={installConfig}
              language={language}
              isDarkMode={isDarkMode}
            />
          )}

          {activeTab === 'commercial-guide' && (
            <EnterpriseDeployment
              onOpenInstallWizard={() => setShowInstallWizard(true)}
              language={language}
              isDarkMode={isDarkMode}
            />
          )}
        </main>
      </div>

      {/* Floating Customer Chat Widget Preview */}
      <CustomerWidget
        theme={currentTheme}
        isOpen={isWidgetOpen}
        onToggle={() => setIsWidgetOpen(!isWidgetOpen)}
        operators={operators}
        departments={departments}
        activeConversation={activeConversation}
        onSendMessageFromVisitor={handleSendMessageFromVisitor}
        onSubmitRating={handleSubmitRating}
        onSubmitOfflineLead={handleSubmitOfflineLead}
        isStaffOnline={operators.some((o) => o.status === 'online')}
        language={language}
        onSelectTheme={handleSelectTheme}
        onUpdateTheme={handleUpdateTheme}
      />

      {/* One-Click Automated Install Wizard Modal */}
      {showInstallWizard && (
        <InstallWizardModal
          isOpen={showInstallWizard}
          onClose={() => setShowInstallWizard(false)}
          onSaveConfig={handleSaveInstallConfig}
          currentConfig={installConfig}
          language={language}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onSuccess={(op) => {
            setCurrentOperator(op);
            fetchBackendData();
          }}
          onClose={() => setShowAuthModal(false)}
          language={language}
        />
      )}
    </div>
  );
}
