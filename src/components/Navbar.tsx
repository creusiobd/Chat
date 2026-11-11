import React, { useState } from 'react';
import { 
  Layers, 
  MessageSquare, 
  BookOpen, 
  Package, 
  Users, 
  Smartphone, 
  Terminal, 
  Settings, 
  RefreshCw, 
  Menu,
  X,
  BarChart2,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openTicketsCount: number;
  onQuickSync: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: (theme?: 'dark' | 'light') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  openTicketsCount,
  onQuickSync,
  mobileOpen,
  setMobileOpen,
  theme = 'dark',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  const navItems = [
    { section: 'Operação em Tempo Real' },
    { id: 'chat', label: 'Simulador de Atendimento', icon: MessageSquare, badge: 'Live', badgeColor: isDark ? 'bg-indigo-500/30 text-white' : 'bg-indigo-100 text-indigo-700' },
    { id: 'analytics', label: 'Dashboard de Métricas', icon: BarChart2, iconColor: isDark ? 'text-indigo-400' : 'text-indigo-600' },
    { id: 'knowledge', label: 'Base de Conhecimento (RAG)', icon: BookOpen, info: '4 docs' },
    { id: 'erp', label: 'Hub de Pedidos (Redundância)', icon: Package, dot: 'bg-emerald-500' },
    { id: 'handoff', label: 'Central de Transbordo', icon: Users, badge: openTicketsCount, badgeColor: isDark ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold' : 'bg-amber-100 text-amber-800 border border-amber-300 font-bold' },
    { section: 'Conectores & Homologação' },
    { id: 'whatsapp', label: 'Gateway WhatsApp', icon: Smartphone, info: 'Meta API', iconColor: isDark ? 'text-emerald-400' : 'text-emerald-600' },
    { id: 'tests', label: 'Bateria de Testes (Stress)', icon: Terminal, info: 'TC-01..06', iconColor: isDark ? 'text-indigo-400' : 'text-indigo-600' },
    { id: 'settings', label: 'Configurações & Prompt', icon: Settings },
  ];

  return (
    <aside
      className={`w-full lg:w-72 border-r flex flex-col shrink-0 z-40 transition-all duration-300 ${
        isDark
          ? 'bg-slate-950 border-slate-800/80 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      } ${
        mobileOpen ? 'block fixed inset-y-0 left-0 max-w-xs z-50' : 'hidden lg:flex'
      }`}
    >
      {/* Top Brand Header */}
      <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 p-0.5 shadow-lg shadow-indigo-600/30 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
            <div className={`absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 ${isDark ? 'border-slate-950' : 'border-white'} animate-pulse`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-extrabold text-base tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>OmniFlow</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isDark ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>
                E2E
              </span>
            </div>
            <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Plataforma Autônoma de IA</p>
          </div>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`lg:hidden p-2 rounded-lg transition ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Live Status Widget */}
      <div className={`px-5 py-3 border-b flex items-center justify-between text-xs ${isDark ? 'bg-slate-900/60 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className={`text-[11px] font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Motor: <strong className={isDark ? 'text-white' : 'text-slate-900'}>Gemini 3.8 Flash</strong>
          </span>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}`}>
          99.8% Online
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item, idx) => {
          if (item.section) {
            return (
              <div key={idx} className={`px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {item.section}
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id!);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : isDark
                  ? 'font-medium text-slate-400 hover:text-white hover:bg-slate-900'
                  : 'font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.iconColor || (isDark ? 'text-slate-400' : 'text-slate-500')}`} />
              <span className="flex-1 text-left">{item.label}</span>

              {item.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.badgeColor || (isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700')}`}>
                  {item.badge}
                </span>
              )}

              {item.dot && <span className={`w-2 h-2 rounded-full ${item.dot}`} />}
              {item.info && <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.info}</span>}
            </button>
          );
        })}
      </nav>

      {/* User & Environment Footer */}
      <div className={`p-4 border-t flex items-center justify-between ${isDark ? 'bg-slate-950/80 border-slate-800/80' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
            OP
          </div>
          <div>
            <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Operador Admin</p>
            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tenant: [Matriz BR-01]</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          {/* Light / Dark Mode Switcher Toggle */}
          <button
            type="button"
            onClick={() => onToggleTheme && onToggleTheme()}
            className={`p-2 rounded-lg transition flex items-center justify-center cursor-pointer ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800' 
                : 'bg-white hover:bg-slate-200 text-indigo-600 border border-slate-300 shadow-sm'
            }`}
            title={isDark ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onQuickSync}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isDark 
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800' 
                : 'bg-white hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-300 shadow-sm'
            }`}
            title="Sincronizar Redundâncias"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

interface HeaderProps {
  activeTab: string;
  onResetContext: () => void;
  onToggleMobileMenu: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: (theme?: 'dark' | 'light') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onResetContext, onToggleMobileMenu, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  const getTabTitle = () => {
    switch (activeTab) {
      case 'chat':
        return { title: 'Simulador de Atendimento Omnicanal', sub: 'Ambiente de homologação em tempo real com Function Calling ativo' };
      case 'analytics':
        return { title: 'Dashboard de Estatísticas & Métricas da IA', sub: 'Estatísticas de uso, taxa de resolução autônoma, transbordo e tempo médio de resposta' };
      case 'knowledge':
        return { title: 'Base de Conhecimento (RAG Dinâmico)', sub: 'Gestão de documentos oficiais e políticas injetadas no contexto' };
      case 'erp':
        return { title: 'Hub de Pedidos & Redundância', sub: 'Sincronização em tempo real: Google Sheets (Primário) + SQLite (Contingência)' };
      case 'handoff':
        return { title: 'Central de Transbordo Humano', sub: 'Fila de tickets estruturados gerados via abrir_chamado_humano' };
      case 'whatsapp':
        return { title: 'Gateway WhatsApp (Meta Cloud API)', sub: 'Testador de Webhooks GET/POST e monitor de tráfego em tempo real' };
      case 'tests':
        return { title: 'Bateria de Testes de Estresse (TC-01 a TC-06)', sub: 'Verificação contínua de latência, integridade de guardrails e acionamento de ferramentas' };
      case 'settings':
        return { title: 'Configurações Globais & System Prompt', sub: 'Ajuste de hiperparâmetros, persona da marca e diretrizes de IA' };
      default:
        return { title: 'OmniFlow AI Platform', sub: 'Plataforma Autônoma E2E' };
    }
  };

  const meta = getTabTitle();

  return (
    <header className={`h-16 border-b backdrop-blur-md px-6 flex items-center justify-between shrink-0 w-full z-30 transition-colors duration-300 ${
      isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white/90'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className={`lg:hidden p-2 rounded-lg transition shrink-0 ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="truncate">
          <h2 className={`text-base font-bold tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{meta.title}</h2>
          <p className={`text-xs truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{meta.sub}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className={`hidden sm:flex items-center gap-2 border rounded-xl px-3 py-1.5 text-xs ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <span>Latência Média:</span>
          <span className="font-mono text-emerald-500 font-bold">540ms</span>
        </div>
        <button
          onClick={onResetContext}
          className={`text-xs px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
            isDark
              ? 'border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white'
              : 'border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-slate-900 bg-white'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Limpar Sessão</span>
        </button>
      </div>
    </header>
  );
};
