import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  Check, 
  RotateCcw, 
  Mail, 
  Bell, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Globe,
  Sun,
  Moon,
  Palette
} from 'lucide-react';

interface BrandPromptSettingsProps {
  companyName: string;
  setCompanyName: (name: string) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  notificationEmail?: string;
  setNotificationEmail?: (email: string) => void;
  emailAlertsEnabled?: boolean;
  setEmailAlertsEnabled?: (enabled: boolean) => void;
  timeZone?: string;
  setTimeZone?: (tz: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: (theme?: 'dark' | 'light') => void;
  onLogAudit: (type: any, title: string, details: string, severity: any) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error') => void;
}

export const TIMEZONE_OPTIONS = [
  { value: 'America/Sao_Paulo', label: 'Horário de Brasília (UTC-3 - SP, RJ, DF, MG, RS, PR, SC, BA, PE, CE, etc.)' },
  { value: 'America/Manaus', label: 'Horário do Amazonas / Roraima / Rondônia (UTC-4)' },
  { value: 'America/Cuiaba', label: 'Horário de Mato Grosso / MT do Sul (UTC-4)' },
  { value: 'America/Belem', label: 'Horário do Pará / Amapá / Maranhão (UTC-3)' },
  { value: 'America/Noronha', label: 'Horário de Fernando de Noronha (UTC-2)' },
  { value: 'America/Rio_Branco', label: 'Horário do Acre (UTC-5)' },
  { value: 'UTC', label: 'UTC (Tempo Universal Coordenado)' },
  { value: 'America/New_York', label: 'Horário do Leste dos EUA (UTC-5 / EST)' },
  { value: 'Europe/Lisbon', label: 'Horário de Lisboa / Portugal (UTC+0 / WET)' },
];

export const BrandPromptSettings: React.FC<BrandPromptSettingsProps> = ({
  companyName,
  setCompanyName,
  systemPrompt,
  setSystemPrompt,
  notificationEmail = 'creusiogasparkizua@gmail.com',
  setNotificationEmail,
  emailAlertsEnabled = true,
  setEmailAlertsEnabled,
  timeZone = 'America/Sao_Paulo',
  setTimeZone,
  theme = 'dark',
  onToggleTheme,
  onLogAudit,
  onShowToast,
}) => {
  const isDark = theme === 'dark';
  const [localCompany, setLocalCompany] = useState(companyName);
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);
  const [temperature, setTemperature] = useState(0.1);

  // Timezone State & Live Clock
  const [localTz, setLocalTz] = useState(timeZone);
  const [liveFormattedTime, setLiveFormattedTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const formatted = new Date().toLocaleString('pt-BR', {
          timeZone: localTz,
          dateStyle: 'full',
          timeStyle: 'medium',
        });
        setLiveFormattedTime(formatted);
      } catch (e) {
        setLiveFormattedTime(new Date().toLocaleTimeString());
      }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [localTz]);

  const handleSaveTimezone = (e: React.FormEvent) => {
    e.preventDefault();
    if (setTimeZone) setTimeZone(localTz);
    onLogAudit(
      'policy_query',
      'Fuso Horário da Empresa Atualizado',
      `Novo Fuso Horário configurado: ${localTz}`,
      'info'
    );
    onShowToast(
      'Fuso Horário Atualizado!',
      `Logs de auditoria e relatórios ajustados para o fuso horário: ${localTz}`
    );
  };

  // Email Notification States
  const [localEmail, setLocalEmail] = useState(notificationEmail);
  const [localEmailEnabled, setLocalEmailEnabled] = useState(emailAlertsEnabled);
  const [criticalSlaMs, setCriticalSlaMs] = useState(600);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const handleSaveModelSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setCompanyName(localCompany.trim() || 'OmniFlow Enterprise');
    setSystemPrompt(localPrompt);
    onLogAudit(
      'prompt_update',
      'Configurações da Marca Atualizadas',
      `Nome comercial: "${localCompany}", Temperatura: ${temperature}`,
      'info'
    );
    onShowToast('Configurações Salvas', 'Instruções de sistema e temperatura atualizadas no servidor.');
  };

  const handleSaveEmailAlerts = (e: React.FormEvent) => {
    e.preventDefault();
    if (setNotificationEmail) setNotificationEmail(localEmail);
    if (setEmailAlertsEnabled) setEmailAlertsEnabled(localEmailEnabled);
    onLogAudit(
      'security_alert',
      'Configurações de Alerta por E-mail Salvas',
      `E-mail de Notificação: ${localEmail} | Alertas Ativos: ${localEmailEnabled ? 'SIM' : 'NÃO'} | Limite: ${criticalSlaMs}ms`,
      'info'
    );
    onShowToast(
      'Notificações Salvas com Sucesso',
      `Alertas automáticos de latência SLA configurados para enviar para: ${localEmail}`
    );
  };

  const handleSendTestEmail = () => {
    setIsSendingTest(true);
    setTimeout(() => {
      setIsSendingTest(false);
      onLogAudit(
        'security_alert',
        'E-mail de Teste SLA Disparado',
        `Mensagem de teste de violação de SLA (780ms > ${criticalSlaMs}ms) enviada com sucesso para ${localEmail}.`,
        'warning'
      );
      onShowToast(
        '📧 E-mail de Teste Disparado!',
        `Notificação de simulação de pico de latência enviada para: ${localEmail}`
      );
    }, 800);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* CARD 00: CONFIGURAÇÃO DE APARÊNCIA & TEMA (CLARO / ESCURO) */}
      <div className={`border rounded-2xl p-6 space-y-5 shadow-2xl relative overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-slate-950 border-indigo-500/30' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${isDark ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}>
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>Aparência & Tema da Plataforma</span>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${isDark ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>
                  UI/UX Global
                </span>
              </h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Escolha o modo de cor preferido para navegar na plataforma OmniFlow (persistido automaticamente no navegador).
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Option 1: Dark Mode */}
          <button
            type="button"
            onClick={() => onToggleTheme && onToggleTheme('dark')}
            className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className={`p-2.5 rounded-lg border ${theme === 'dark' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-200 text-slate-700 border-slate-300'}`}>
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Modo Escuro (Dark)</span>
                {theme === 'dark' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Ativo
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Interface escura com alto contraste em tons slate-950/900. Reduz fadiga visual em ambientes com baixa luminosidade.
              </p>
            </div>
          </button>

          {/* Option 2: Light Mode */}
          <button
            type="button"
            onClick={() => onToggleTheme && onToggleTheme('light')}
            className={`p-4 rounded-xl border text-left flex items-start gap-3.5 transition-all cursor-pointer ${
              theme === 'light'
                ? 'bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/30'
                : isDark ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-900' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className={`p-2.5 rounded-lg border ${theme === 'light' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Modo Claro (Light)</span>
                {theme === 'light' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Ativo
                  </span>
                )}
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Interface clara e limpa em tons slate-50/white. Ideal para apresentações e ambientes altamente iluminados.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* CARD 0: CONFIGURAÇÃO DE FUSO HORÁRIO & REGIONALIZAÇÃO */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Fuso Horário Oficial da Empresa</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Regionalização
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Garante que os logs de auditoria, carimbos de data/hora (timestamps) e relatórios executivos reflitam a hora local exata da operação.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveTimezone} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
            <div className="sm:col-span-7">
              <label className="block text-slate-300 mb-1.5 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Selecione o Fuso Horário de Operação:</span>
              </label>
              <select
                value={localTz}
                onChange={(e) => setLocalTz(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500 transition"
              >
                {TIMEZONE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-5 flex flex-col justify-end">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Relógio do Sistema (Horário Local):</span>
                <span className="font-mono font-bold text-emerald-400 text-xs block truncate">
                  {liveFormattedTime || 'Carregando horário...'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Fuso Horário</span>
            </button>
          </div>
        </form>
      </div>

      {/* CARD 1: NOTIFICAÇÕES DE E-MAIL PARA ALERTA DE LATÊNCIA SLA */}
      <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Notificações por E-mail & Alertas de Latência SLA</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SMTP Ativo
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cadastre o e-mail responsável por receber avisos automáticos caso o tempo médio de resposta exceda o limite crítico.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-300 font-medium">Alertas Automáticos:</label>
            <button
              type="button"
              onClick={() => setLocalEmailEnabled(!localEmailEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
                localEmailEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <span className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveEmailAlerts} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
            <div className="sm:col-span-7">
              <label className="block text-slate-300 mb-1.5 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Endereço de E-mail do Gestor / Operações:</span>
              </label>
              <input
                type="email"
                required
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                placeholder="gestor@suaempresa.com.br"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Os alertas de violação de SLA (tempo de resposta &gt; {criticalSlaMs}ms) serão encaminhados para esta caixa de entrada.
              </span>
            </div>

            <div className="sm:col-span-5">
              <label className="block text-slate-300 mb-1.5 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Gatilho de Latência Crítica (ms):</span>
              </label>
              <input
                type="number"
                min={300}
                max={2000}
                step={50}
                required
                value={criticalSlaMs}
                onChange={(e) => setCriticalSlaMs(parseInt(e.target.value, 10))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Dispara alerta se tempo de resposta ultrapassar este valor.
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${localEmailEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              <span>
                Status: {localEmailEnabled ? (
                  <strong className="text-emerald-400 font-normal">Monitoramento Ativo em Tempo Real</strong>
                ) : (
                  <strong className="text-slate-400 font-normal">Notificações Desativadas</strong>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingTest}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isSendingTest ? 'Enviando...' : 'Testar Disparo de E-mail'}</span>
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Configuração de E-mail</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* CARD 2: PARÂMETROS DO MODELO & IDENTIDADE DA MARCA */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-400" />
          <span>Parâmetros do Modelo & Identidade da Marca</span>
        </h3>

        <form onSubmit={handleSaveModelSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">Nome Comercial da Empresa:</label>
              <input
                type="text"
                required
                value={localCompany}
                onChange={(e) => setLocalCompany(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1.5 font-medium">
                Temperatura (0.0 = Rígido, 1.0 = Criativo):
              </label>
              <input
                type="number"
                step="0.1"
                min="0.0"
                max="1.0"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1.5 font-medium text-xs">Prompt de Sistema Ativo:</label>
            <textarea
              rows={12}
              required
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-white font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações Globais</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

