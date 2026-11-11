import React, { useState, useEffect } from 'react';
import { Sidebar, Header } from './components/Navbar';
import { ChatSimulator } from './components/ChatSimulator';
import { KnowledgeBaseEditor } from './components/KnowledgeBaseEditor';
import { HumanDesk } from './components/HumanDesk';
import { OrdersDBManager } from './components/OrdersDBManager';
import { BrandPromptSettings } from './components/BrandPromptSettings';
import { AuditSafetyLogs } from './components/AuditSafetyLogs';
import { TestRunner } from './components/TestRunner';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { Toast } from './components/Toast';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';

import { 
  INITIAL_COMPANY_NAME, 
  INITIAL_SYSTEM_PROMPT_TEMPLATE, 
  INITIAL_POLICIES, 
  INITIAL_ORDERS, 
  INITIAL_TICKETS 
} from './data/initialData';
import { PolicyDoc, Order, HumanTicket, AuditLogItem } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companyName, setCompanyName] = useState(INITIAL_COMPANY_NAME);
  const [systemPrompt, setSystemPrompt] = useState(INITIAL_SYSTEM_PROMPT_TEMPLATE);
  const [policies, setPolicies] = useState<PolicyDoc[]>(INITIAL_POLICIES);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [tickets, setTickets] = useState<HumanTicket[]>(INITIAL_TICKETS);
  
  // Global Theme State ('dark' | 'light')
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('omniflow_theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('omniflow_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleToggleTheme = (selectedTheme?: 'dark' | 'light') => {
    const nextTheme = selectedTheme || (theme === 'dark' ? 'light' : 'dark');
    setTheme(nextTheme);
    handleLogAudit(
      'policy_query',
      'Tema da Plataforma Alterado',
      `Interface alterada para o modo: ${nextTheme === 'dark' ? 'Escuro (Dark)' : 'Claro (Light)'}`,
      'info'
    );
    showToast('Aparência Atualizada', `Modo ${nextTheme === 'dark' ? 'Escuro' : 'Claro'} ativado com sucesso!`);
  };

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'log-start',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'policy_query',
      title: 'OmniFlow AI Platform Inicializado',
      details: 'Motor Gemini 3.8 Flash carregado com 4 Políticas RAG e 2 Ferramentas de Function Calling.',
      severity: 'info',
    },
  ]);

  const [notificationEmail, setNotificationEmail] = useState('creusiogasparkizua@gmail.com');
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [timeZone, setTimeZone] = useState('America/Sao_Paulo');

  // CSAT / Joinha Feedback state
  const [feedbackStats, setFeedbackStats] = useState({
    positive: 142,
    negative: 12,
  });

  const handleFeedback = (rating: 'up' | 'down') => {
    setFeedbackStats((prev) => ({
      ...prev,
      [rating === 'up' ? 'positive' : 'negative']: prev[rating === 'up' ? 'positive' : 'negative'] + 1,
    }));
    handleLogAudit(
      'policy_query',
      `Avaliação de Resposta (${rating === 'up' ? 'Positiva 👍' : 'Negativa 👎'})`,
      `Cliente avaliou a precisão da resposta da IA como ${rating === 'up' ? 'Útil / Correta' : 'Incorreta / Insatisfeita'}.`,
      rating === 'up' ? 'info' : 'warning'
    );
  };

  // Toast state
  const [toastState, setToastState] = useState<{
    show: boolean;
    title: string;
    message: string;
    type?: 'success' | 'error';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    setToastState({ show: true, title, message, type });
    setTimeout(() => {
      setToastState((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const handleLogAudit = (
    type: AuditLogItem['type'],
    title: string,
    details: string,
    severity: AuditLogItem['severity']
  ) => {
    let formattedTimestamp = '';
    try {
      formattedTimestamp = new Date().toLocaleTimeString('pt-BR', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (e) {
      formattedTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    const newLog: AuditLogItem = {
      id: `log-${Date.now()}-${Math.random()}`,
      timestamp: formattedTimestamp,
      type,
      title,
      details,
      severity,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleAddTicket = (newTicket: HumanTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleUpdateTicketStatus = (
    id: string,
    status: 'Aberto' | 'Em Atendimento' | 'Resolvido',
    resposta?: string
  ) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status, respostaOperador: resposta || t.respostaOperador } : t))
    );
  };

  const handleAddOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  const handleQuickSync = () => {
    showToast('Redundância Atualizada', 'Cache local verificado. Latência: 42ms.');
  };

  const handleResetContext = () => {
    showToast('Sessão Reiniciada', 'Buffer de memória do Gemini limpo com sucesso.');
  };

  const openTicketsCount = tickets.filter((t) => t.status === 'Aberto').length;

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Global Notification Toast */}
      <Toast
        show={toastState.show}
        title={toastState.title}
        message={toastState.message}
        type={toastState.type}
      />

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openTicketsCount={openTicketsCount}
        onQuickSync={handleQuickSync}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Right Content Section (Header + Full Screen Tab Area) */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden min-w-0 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
      }`}>
        <Header
          activeTab={activeTab}
          onResetContext={handleResetContext}
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full max-w-full min-w-0">
          {activeTab === 'chat' && (
            <ChatSimulator
              companyName={companyName}
              systemPrompt={systemPrompt}
              policies={policies}
              orders={orders}
              onAddTicket={handleAddTicket}
              onLogAudit={handleLogAudit}
              onShowToast={showToast}
              onFeedback={handleFeedback}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsDashboard 
              onShowToast={showToast} 
              openTicketsCount={openTicketsCount} 
              notificationEmail={notificationEmail} 
              feedbackStats={feedbackStats}
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'knowledge' && (
            <KnowledgeBaseEditor
              companyName={companyName}
              policies={policies}
              onUpdatePolicies={setPolicies}
              onLogAudit={handleLogAudit}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'erp' && (
            <OrdersDBManager
              orders={orders}
              onAddOrder={handleAddOrder}
              onLogAudit={handleLogAudit}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'handoff' && (
            <HumanDesk
              tickets={tickets}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onLogAudit={handleLogAudit}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'whatsapp' && <WhatsAppSimulator onShowToast={showToast} />}

          {activeTab === 'tests' && (
            <TestRunner
              companyName={companyName}
              systemPrompt={systemPrompt}
              policies={policies}
              orders={orders}
              onLogAudit={handleLogAudit}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'settings' && (
            <BrandPromptSettings
              companyName={companyName}
              setCompanyName={setCompanyName}
              systemPrompt={systemPrompt}
              setSystemPrompt={setSystemPrompt}
              notificationEmail={notificationEmail}
              setNotificationEmail={setNotificationEmail}
              emailAlertsEnabled={emailAlertsEnabled}
              setEmailAlertsEnabled={setEmailAlertsEnabled}
              timeZone={timeZone}
              setTimeZone={setTimeZone}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onLogAudit={handleLogAudit}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'audit' && (
            <AuditSafetyLogs logs={auditLogs} onClearLogs={() => setAuditLogs([])} />
          )}
        </main>
      </div>
    </div>
  );
}
