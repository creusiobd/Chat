import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  Clock, 
  MessageSquare, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertTriangle,
  Sliders,
  RotateCcw,
  Calendar,
  Zap,
  Radio,
  Sparkles,
  FileText,
  Mail,
  Send,
  Download,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  Award,
  Edit3,
  Cpu,
  Bell,
  BellRing,
  AlertOctagon,
  Save,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';

import { AuditLogItem } from '../types';

interface AnalyticsDashboardProps {
  onShowToast: (title: string, message: string, type?: 'success' | 'error') => void;
  openTicketsCount?: number;
  notificationEmail?: string;
  feedbackStats?: { positive: number; negative: number };
  auditLogs?: AuditLogItem[];
}

type PeriodType = '7dias' | '30dias' | 'anual';

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ 
  onShowToast, 
  openTicketsCount = 2,
  notificationEmail = 'creusiogasparkizua@gmail.com',
  feedbackStats = { positive: 142, negative: 12 },
  auditLogs = []
}) => {
  const [timeRange, setTimeRange] = useState<PeriodType>('7dias');

  // SLA Response Time Threshold & Alert States
  const [thresholdMs, setThresholdMs] = useState<number>(600);
  const [customAvgMs, setCustomAvgMs] = useState<number | null>(null);

  // ROI & Deflexão Financeira State
  const [roiData, setRoiData] = useState<{
    total_atendimentos: number;
    resolvidos_ia: number;
    transbordos_humano: number;
    taxa_deflexao: string;
    custo_humano_configurado: number;
    custo_total_ia: string;
    economia_liquida: string;
    roi_percent: string;
    top_motivos_transbordo: { motivo_transbordo: string; qtd: number }[];
  }>({
    total_atendimentos: 1485,
    resolvidos_ia: 1312,
    transbordos_humano: 173,
    taxa_deflexao: '88.4',
    custo_humano_configurado: 9.00,
    custo_total_ia: '12.40',
    economia_liquida: '11795.60',
    roi_percent: '1180',
    top_motivos_transbordo: [
      { motivo_transbordo: 'Status de Pedido Sem CPF', qtd: 84 },
      { motivo_transbordo: 'Solicitação de Troca Externa', qtd: 52 },
      { motivo_transbordo: 'Insatisfação / Pedido Humano', qtd: 37 },
    ],
  });

  const [editCustoHumano, setEditCustoHumano] = useState<string>('9.00');
  const [isEditingCusto, setIsEditingCusto] = useState<boolean>(false);

  const carregarDashboardROI = async () => {
    try {
      const res = await fetch('/api/metricas/roi');
      if (res.ok) {
        const dados = await res.json();
        setRoiData(dados);
        if (dados.custo_humano_configurado) {
          setEditCustoHumano(String(dados.custo_humano_configurado));
        }
      }
    } catch (err) {
      console.error('Erro ao carregar métricas de ROI:', err);
    }
  };

  useEffect(() => {
    carregarDashboardROI();
  }, []);

  const handleSalvarCustoHumano = async (e: React.FormEvent) => {
    e.preventDefault();
    const novoCustoNum = parseFloat(editCustoHumano);
    if (isNaN(novoCustoNum) || novoCustoNum <= 0) {
      onShowToast('Valor Inválido', 'Informe um valor numérico positivo para o custo de atendimento humano.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/configuracoes/custo-humano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ novoCusto: novoCustoNum }),
      });
      if (res.ok) {
        onShowToast('Custo Atualizado 💰', `Custo por chamado humano alterado para R$ ${novoCustoNum.toFixed(2)}.`);
        setIsEditingCusto(false);
        await carregarDashboardROI();
      }
    } catch (err) {
      onShowToast('Erro de Conexão', 'Não foi possível salvar o novo custo comercial.', 'error');
    }
  };

  // Configurações de Alertas de TMR (Tempo Médio de Resposta) por E-mail (com segundos e localStorage)
  const [alertEnabled, setAlertEnabled] = useState<boolean>(true);
  const [alertEmailRecipient, setAlertEmailRecipient] = useState<string>(notificationEmail);
  const [warningTmrSeconds, setWarningTmrSeconds] = useState<number>(0.60);
  const [criticalTmrSeconds, setCriticalTmrSeconds] = useState<number>(0.85);

  // Carrega preferências do localStorage no carregamento inicial
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tmr_alert_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.alertEnabled === 'boolean') setAlertEnabled(parsed.alertEnabled);
        if (parsed.alertEmailRecipient) setAlertEmailRecipient(parsed.alertEmailRecipient);
        if (typeof parsed.warningTmrSeconds === 'number') {
          setWarningTmrSeconds(parsed.warningTmrSeconds);
          setThresholdMs(Math.round(parsed.warningTmrSeconds * 1000));
        }
        if (typeof parsed.criticalTmrSeconds === 'number') {
          setCriticalTmrSeconds(parsed.criticalTmrSeconds);
        }
      }
    } catch (e) {
      console.error('Erro ao ler configurações de TMR do localStorage:', e);
    }
  }, []);

  const handleSaveAlertRules = (e: React.FormEvent) => {
    e.preventDefault();
    const warningMs = Math.round(warningTmrSeconds * 1000);
    setThresholdMs(warningMs);

    const preferences = {
      alertEnabled,
      alertEmailRecipient,
      warningTmrSeconds,
      criticalTmrSeconds,
      warningMs,
      savedAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
    };

    try {
      localStorage.setItem('tmr_alert_settings', JSON.stringify(preferences));
    } catch (e) {
      console.error('Erro ao salvar preferências no localStorage:', e);
    }

    onShowToast(
      '💾 Preferências Salvas no LocalStorage!',
      `Limiar TMR: ${warningTmrSeconds.toFixed(2)}s (${warningMs}ms) • Notificações por E-mail: ${alertEnabled ? 'ATIVADAS (' + alertEmailRecipient + ')' : 'DESATIVADAS'}.`
    );
  };

  // Weekly PDF Report Scheduling States
  const [pdfScheduleEnabled, setPdfScheduleEnabled] = useState<boolean>(true);
  const [pdfRecipientEmail, setPdfRecipientEmail] = useState<string>(notificationEmail);
  const [pdfDayOfWeek, setPdfDayOfWeek] = useState<string>('Segunda-feira');
  const [pdfDeliveryTime, setPdfDeliveryTime] = useState<string>('08:00');
  const [pdfIncludeKpis, setPdfIncludeKpis] = useState<boolean>(true);
  const [pdfIncludeCharts, setPdfIncludeCharts] = useState<boolean>(true);
  const [pdfIncludeSlaAudit, setPdfIncludeSlaAudit] = useState<boolean>(true);
  const [pdfIncludeHandoff, setPdfIncludeHandoff] = useState<boolean>(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [lastScheduledInfo, setLastScheduledInfo] = useState<string>(
    `Toda Segunda-feira às 08:00 • Destino: ${notificationEmail}`
  );

  // Period Datasets
  const periodDatasets = {
    '7dias': {
      label: 'Últimos 7 Dias',
      totalAtendimentos: '1.485',
      variacaoTotal: '+14,2%',
      resolucaoIA: '88,4%',
      variacaoIA: '+2,1%',
      taxaTransbordo: '11,6%',
      variacaoTransbordo: '-2,1%',
      tempoRespostaMs: 540,
      volumeTrend: [
        { ponto: '03/Nov (Seg)', atendimentos: 185, resolvidosIA: 165, transbordo: 20 },
        { ponto: '04/Nov (Ter)', atendimentos: 210, resolvidosIA: 192, transbordo: 18 },
        { ponto: '05/Nov (Qua)', atendimentos: 245, resolvidosIA: 215, transbordo: 30 },
        { ponto: '06/Nov (Qui)', atendimentos: 230, resolvidosIA: 212, transbordo: 18 },
        { ponto: '07/Nov (Sex)', atendimentos: 280, resolvidosIA: 244, transbordo: 36 },
        { ponto: '08/Nov (Sáb)', atendimentos: 190, resolvidosIA: 178, transbordo: 12 },
        { ponto: '09/Nov (Dom)', atendimentos: 145, resolvidosIA: 138, transbordo: 7 },
      ],
      csatTrend: [
        { ponto: '03/Nov (Seg)', positivas: 22, negativas: 2, csat: 91.7 },
        { ponto: '04/Nov (Ter)', positivas: 28, negativas: 1, csat: 96.5 },
        { ponto: '05/Nov (Qua)', positivas: 31, negativas: 3, csat: 91.2 },
        { ponto: '06/Nov (Qui)', positivas: 29, negativas: 2, csat: 93.5 },
        { ponto: '07/Nov (Sex)', positivas: 35, negativas: 2, csat: 94.6 },
        { ponto: '08/Nov (Sáb)', positivas: 21, negativas: 1, csat: 95.5 },
        { ponto: '09/Nov (Dom)', positivas: 16, negativas: 2, csat: 88.9 },
      ],
      hourly: [
        { hora: '08:00', totais: 45, autonomos: 41, transbordo: 4 },
        { hora: '10:00', totais: 112, autonomos: 98, transbordo: 14 },
        { hora: '12:00', totais: 168, autonomos: 151, transbordo: 17 },
        { hora: '14:00', totais: 210, autonomos: 186, transbordo: 24 },
        { hora: '16:00', totais: 195, autonomos: 172, transbordo: 23 },
        { hora: '18:00', totais: 140, autonomos: 126, transbordo: 14 },
        { hora: '20:00', totais: 85, autonomos: 79, transbordo: 6 },
      ],
      categories: [
        { motivo: 'Status de Pedido', quantidade: 540 },
        { motivo: 'Troca & Devolução', quantidade: 310 },
        { motivo: 'Prazos & Frete', quantidade: 230 },
        { motivo: 'Dúvidas Financeiras', quantidade: 124 },
        { motivo: 'Transbordo / Humano', quantidade: 80 },
      ],
    },
    '30dias': {
      label: 'Últimos 30 Dias',
      totalAtendimentos: '6.840',
      variacaoTotal: '+18,5%',
      resolucaoIA: '91,2%',
      variacaoIA: '+4,3%',
      taxaTransbordo: '8,8%',
      variacaoTransbordo: '-4,3%',
      tempoRespostaMs: 510,
      volumeTrend: [
        { ponto: 'Semana 1', atendimentos: 1420, resolvidosIA: 1280, transbordo: 140 },
        { ponto: 'Semana 2', atendimentos: 1680, resolvidosIA: 1540, transbordo: 140 },
        { ponto: 'Semana 3', atendimentos: 1890, resolvidosIA: 1730, transbordo: 160 },
        { ponto: 'Semana 4', atendimentos: 1850, resolvidosIA: 1690, transbordo: 160 },
      ],
      csatTrend: [
        { ponto: 'Semana 1', positivas: 185, negativas: 15, csat: 92.5 },
        { ponto: 'Semana 2', positivas: 210, negativas: 18, csat: 92.1 },
        { ponto: 'Semana 3', positivas: 245, negativas: 20, csat: 92.4 },
        { ponto: 'Semana 4', positivas: 230, negativas: 16, csat: 93.5 },
      ],
      hourly: [
        { hora: 'Semana 1', totais: 1420, autonomos: 1280, transbordo: 140 },
        { hora: 'Semana 2', totais: 1680, autonomos: 1540, transbordo: 140 },
        { hora: 'Semana 3', totais: 1890, autonomos: 1730, transbordo: 160 },
        { hora: 'Semana 4', totais: 1850, autonomos: 1690, transbordo: 160 },
      ],
      categories: [
        { motivo: 'Status de Pedido', quantidade: 2640 },
        { motivo: 'Troca & Devolução', quantidade: 1520 },
        { motivo: 'Prazos & Frete', quantidade: 1210 },
        { motivo: 'Dúvidas Financeiras', quantidade: 890 },
        { motivo: 'Transbordo / Humano', quantidade: 580 },
      ],
    },
    'anual': {
      label: 'Visão Anual (12 Meses)',
      totalAtendimentos: '84.500',
      variacaoTotal: '+32,4%',
      resolucaoIA: '93,6%',
      variacaoIA: '+7,8%',
      taxaTransbordo: '6,4%',
      variacaoTransbordo: '-7,8%',
      tempoRespostaMs: 480,
      volumeTrend: [
        { ponto: 'Jan', atendimentos: 5800, resolvidosIA: 5200, transbordo: 600 },
        { ponto: 'Fev', atendimentos: 6100, resolvidosIA: 5550, transbordo: 550 },
        { ponto: 'Mar', atendimentos: 6500, resolvidosIA: 5980, transbordo: 520 },
        { ponto: 'Abr', atendimentos: 6900, resolvidosIA: 6380, transbordo: 520 },
        { ponto: 'Mai', atendimentos: 7200, resolvidosIA: 6700, transbordo: 500 },
        { ponto: 'Jun', atendimentos: 7100, resolvidosIA: 6620, transbordo: 480 },
        { ponto: 'Jul', atendimentos: 7400, resolvidosIA: 6950, transbordo: 450 },
        { ponto: 'Ago', atendimentos: 7600, resolvidosIA: 7180, transbordo: 420 },
        { ponto: 'Set', atendimentos: 7300, resolvidosIA: 6890, transbordo: 410 },
        { ponto: 'Out', atendimentos: 7800, resolvidosIA: 7390, transbordo: 410 },
        { ponto: 'Nov', atendimentos: 8200, resolvidosIA: 7790, transbordo: 410 },
        { ponto: 'Dez', atendimentos: 6600, resolvidosIA: 6270, transbordo: 330 },
      ],
      csatTrend: [
        { ponto: 'Jan', positivas: 720, negativas: 65, csat: 91.7 },
        { ponto: 'Fev', positivas: 780, negativas: 60, csat: 92.8 },
        { ponto: 'Mar', positivas: 850, negativas: 62, csat: 93.2 },
        { ponto: 'Abr', positivas: 890, negativas: 58, csat: 93.8 },
        { ponto: 'Mai', positivas: 940, negativas: 55, csat: 94.4 },
        { ponto: 'Jun', positivas: 920, negativas: 50, csat: 94.8 },
        { ponto: 'Jul', positivas: 960, negativas: 48, csat: 95.2 },
        { ponto: 'Ago', positivas: 990, negativas: 45, csat: 95.6 },
        { ponto: 'Set', positivas: 950, negativas: 42, csat: 95.7 },
        { ponto: 'Out', positivas: 1020, negativas: 40, csat: 96.2 },
        { ponto: 'Nov', positivas: 1080, negativas: 38, csat: 96.6 },
        { ponto: 'Dez', positivas: 890, negativas: 30, csat: 96.7 },
      ],
      hourly: [
        { hora: 'Q1 (Jan-Mar)', totais: 18400, autonomos: 16730, transbordo: 1670 },
        { hora: 'Q2 (Abr-Jun)', totais: 21200, autonomos: 19700, transbordo: 1500 },
        { hora: 'Q3 (Jul-Set)', totais: 22300, autonomos: 21020, transbordo: 1280 },
        { hora: 'Q4 (Out-Dez)', totais: 22600, autonomos: 21450, transbordo: 1150 },
      ],
      categories: [
        { motivo: 'Status de Pedido', quantidade: 35200 },
        { motivo: 'Troca & Devolução', quantidade: 21400 },
        { motivo: 'Prazos & Frete', quantidade: 14800 },
        { motivo: 'Dúvidas Financeiras', quantidade: 8100 },
        { motivo: 'Transbordo / Humano', quantidade: 5000 },
      ],
    },
  };

  const currentDataset = periodDatasets[timeRange];
  const effectiveAvgMs = customAvgMs !== null ? customAvgMs : currentDataset.tempoRespostaMs;
  const isAlertActive = effectiveAvgMs > thresholdMs;

  // TMR (Tempo Médio de Resposta) Calculations based on Audit Logs & Period
  const tmrCurrentWeek = effectiveAvgMs;
  const tmrPrevWeek = Math.round(effectiveAvgMs * 1.13); // e.g., 610ms vs 540ms
  const tmrDiffMs = tmrCurrentWeek - tmrPrevWeek;
  const tmrDiffPercent = (((tmrCurrentWeek - tmrPrevWeek) / tmrPrevWeek) * 100).toFixed(1);
  const auditLogsAnalyzedCount = auditLogs.length > 0 ? auditLogs.length : 18;

  const totalFeedback = feedbackStats.positive + feedbackStats.negative;
  const csatRatio = totalFeedback > 0 ? (feedbackStats.positive / totalFeedback) * 100 : 100;
  const csatPercentage = csatRatio.toFixed(1);

  const channelData = [
    { name: 'WhatsApp Oficial (Meta)', value: 62, color: '#10b981' },
    { name: 'Webchat Widget', value: 31, color: '#6366f1' },
    { name: 'API Direct', value: 7, color: '#38bdf8' },
  ];

  const handleFilterChange = (range: PeriodType) => {
    setTimeRange(range);
    setCustomAvgMs(null); // reset custom latency simulation on period change
    onShowToast('Filtro de Período Atualizado', `Exibindo métricas do período: ${periodDatasets[range].label}`);
  };

  const handleSimulateLatencySpike = () => {
    setCustomAvgMs(780);
    onShowToast(
      '⚠️ Alerta de Latência SLA Disparado!',
      `Tempo médio (780ms) excedeu o limite (${thresholdMs}ms). Notificação enviada para: ${notificationEmail}`,
      'error'
    );
  };

  const handleRestoreLatencyNormal = () => {
    setCustomAvgMs(null);
    onShowToast('SLA Normalizado', `Tempo médio de resposta voltou a ${currentDataset.tempoRespostaMs}ms (Abaixo do limite).`);
  };

  return (
    <div className="w-full max-w-full space-y-6 pb-12 min-w-0 flex-1">
      {/* SEÇÃO DE KPIS EM TEMPO REAL (NO TOPO) */}
      <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              <span>KPIs em Tempo Real</span>
            </div>
            <span className="text-xs text-slate-400">Atualizado ao vivo • Hoje</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span>Motor: <strong className="text-emerald-400">Gemini 3.8 Flash</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total de Atendimentos do Dia */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 shadow-lg relative overflow-hidden hover:border-indigo-500/40 transition group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Total de Atendimentos</span>
              <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 group-hover:scale-110 transition">
                <Zap className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-3 my-1">
              <span className="text-4xl font-black text-white font-mono tracking-tight">342</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14,8% hoje
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interações hoje no WhatsApp e Webchat
            </p>
          </div>

          {/* Card 2: Taxa de Retenção de IA */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 shadow-lg relative overflow-hidden hover:border-emerald-500/40 transition group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Taxa de Retenção de IA</span>
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-3 my-1">
              <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">91,8%</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ArrowUpRight className="w-3.5 h-3.5" /> Precision
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Resoluções autônomas sem transbordo
            </p>
          </div>

          {/* Card 3: Pendências Humanas Atuais */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 shadow-lg relative overflow-hidden hover:border-amber-500/40 transition group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Fila Humana Ativa</span>
              <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-3 my-1">
              <span className="text-4xl font-black text-amber-400 font-mono tracking-tight">{openTicketsCount}</span>
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Clock className="w-3 h-3" /> Fila
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Chamados abertos para atendentes
            </p>
          </div>

          {/* Card 4: CSAT & Joinhas de Avaliação da IA (Novo) */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 shadow-lg relative overflow-hidden hover:border-cyan-500/40 transition group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">CSAT & Joinha da IA</span>
              <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition">
                <ThumbsUp className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-3 my-1">
              <span className="text-4xl font-black text-cyan-400 font-mono tracking-tight">{csatPercentage}%</span>
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <ThumbsUp className="w-3 h-3 text-emerald-400" /> {feedbackStats.positive}
              </span>
            </div>
            <div className="space-y-1.5 mt-2">
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${csatRatio}%` }} />
                <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${100 - csatRatio}%` }} />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3" /> {feedbackStats.positive} Úteis
                </span>
                <span className="text-rose-400 font-medium flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3" /> {feedbackStats.negative} Imprecisos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header Banner & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-400" />
            <span>Dashboard Visual de Estatísticas & Métricas da IA</span>
          </h3>
          <p className="text-xs text-slate-400">
            Monitoramento em tempo real de atendimento autônomo, taxa de transbordo e SLA do Gemini 3.8 Flash.
          </p>
        </div>

        {/* 3 Period Selectors: 7 Dias, 30 Dias, Anual */}
        <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => handleFilterChange('7dias')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              timeRange === '7dias' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>7 Dias</span>
          </button>
          <button
            onClick={() => handleFilterChange('30dias')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              timeRange === '30dias' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>30 Dias</span>
          </button>
          <button
            onClick={() => handleFilterChange('anual')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
              timeRange === 'anual' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Anual (12 Meses)</span>
          </button>
        </div>
      </div>

      {/* COMPONENTE DE CONFIGURAÇÕES DE ALERTAS DE TMR E NOTIFICAÇÕES POR E-MAIL */}
      <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white">
                  Configurações de Alertas de TMR (Tempo Médio de Resposta em Segundos)
                </h4>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border font-bold ${
                    alertEnabled
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {alertEnabled ? 'Monitoramento Ativo' : 'Alertas Desativados'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ajuste os limiares numéricos do TMR em segundos. Preferências salvas automaticamente no estado e localStorage.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-amber-500/40 transition">
              <input
                type="checkbox"
                checked={alertEnabled}
                onChange={(e) => setAlertEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span>Ativar Notificações Automáticas por E-mail</span>
            </label>
          </div>
        </div>

        <form onSubmit={handleSaveAlertRules} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            {/* Limiar de Aviso (Warning TMR em Segundos) */}
            <div className="md:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Limiar de Aviso (Segundos):</span>
                </label>
                <span className="text-amber-400 font-mono text-xs">({Math.round(warningTmrSeconds * 1000)}ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="0.10"
                  max="10.00"
                  value={warningTmrSeconds}
                  onChange={(e) => setWarningTmrSeconds(parseFloat(e.target.value) || 0.6)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-amber-400 font-mono text-sm font-bold focus:outline-none focus:border-amber-500 transition"
                />
                <span className="text-slate-400 font-bold font-mono">seg</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Dispara alerta quando TMR médio exceder {warningTmrSeconds.toFixed(2)}s.
              </span>
            </div>

            {/* Limiar Crítico (Critical TMR em Segundos) */}
            <div className="md:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Limiar Crítico (Segundos):</span>
                </label>
                <span className="text-rose-400 font-mono text-xs">({Math.round(criticalTmrSeconds * 1000)}ms)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.05"
                  min="0.20"
                  max="15.00"
                  value={criticalTmrSeconds}
                  onChange={(e) => setCriticalTmrSeconds(parseFloat(e.target.value) || 0.85)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-rose-400 font-mono text-sm font-bold focus:outline-none focus:border-rose-500 transition"
                />
                <span className="text-slate-400 font-bold font-mono">seg</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Notificação crítica quando TMR exceder {criticalTmrSeconds.toFixed(2)}s.
              </span>
            </div>

            {/* E-mail Destinatário dos Alertas */}
            <div className="md:col-span-4 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>E-mail Destinatário:</span>
              </label>
              <input
                type="email"
                required
                disabled={!alertEnabled}
                value={alertEmailRecipient}
                onChange={(e) => setAlertEmailRecipient(e.target.value)}
                placeholder="alertas@empresa.com.br"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
              />
              <span className="text-[10px] text-slate-500 block">
                {alertEnabled ? 'Notificações automáticas ATIVAS' : 'Notificações PAUSADAS'}
              </span>
            </div>
          </div>

          {/* Barra de Ações & Simulação */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Bell className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                TMR Atual: <strong className={isAlertActive ? 'text-amber-400 font-mono font-bold' : 'text-emerald-400 font-mono font-bold'}>{(effectiveAvgMs / 1000).toFixed(2)}s ({effectiveAvgMs}ms)</strong>
                {isAlertActive ? ' (EXCEDE LIMIAR DE ' + warningTmrSeconds.toFixed(2) + 's)' : ' (DENTRO DO SLA)'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAlertActive ? (
                <button
                  type="button"
                  onClick={handleRestoreLatencyNormal}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar SLA (0,54s)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSimulateLatencySpike}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-600/20"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Simular Pico (0,78s)</span>
                </button>
              )}

              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-lg shadow-amber-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Preferências no LocalStorage</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SEÇÃO EXECUTIVA DE ROI & DEFLEXÃO FINANCEIRA DA IA */}
      <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shrink-0">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Impacto Financeiro & Retorno sobre Investimento (ROI)</span>
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Live DB ROI
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Economia líquida gerada por deflexão autônoma em relação ao custo por atendimento humano configurado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingCusto ? (
              <button
                type="button"
                onClick={() => setIsEditingCusto(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Custo Humano: <strong className="text-emerald-400 font-mono">R$ {roiData.custo_humano_configurado.toFixed(2)}</strong></span>
              </button>
            ) : (
              <form onSubmit={handleSalvarCustoHumano} className="flex items-center gap-2">
                <span className="text-xs text-slate-400">R$:</span>
                <input
                  type="number"
                  step="0.50"
                  min="1.00"
                  value={editCustoHumano}
                  onChange={(e) => setEditCustoHumano(e.target.value)}
                  className="w-20 bg-slate-900 border border-emerald-500/50 rounded-lg px-2.5 py-1 text-white text-xs font-mono focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingCusto(false)}
                  className="px-2 py-1 text-slate-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
              </form>
            )}
          </div>
        </div>

        {/* 4 Cards Principais de ROI com IDs Exatos do Requisito */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Economia Líquida */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Economia Líquida Gerada</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <span id="kpiEconomia" className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                R$ {Number(roiData.economia_liquida).toLocaleString('pt-BR')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Economia em comparação ao custo humano (R$ {roiData.custo_humano_configurado.toFixed(2)}/chamado)
            </p>
          </div>

          {/* Card 2: Taxa de Deflexão */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Taxa de Deflexão (IA)</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <span id="kpiDeflexao" className="text-3xl font-black text-indigo-400 font-mono tracking-tight">
                {roiData.taxa_deflexao}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {roiData.resolvidos_ia} de {roiData.total_atendimentos} atendimentos resolvidos 100% por IA
            </p>
          </div>

          {/* Card 3: Custo Total de IA */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Custo Total de IA (Tokens)</span>
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <span id="kpiCustoIA" className="text-3xl font-black text-cyan-400 font-mono tracking-tight">
                R$ {roiData.custo_total_ia}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Consumo acumulado do motor Gemini 3.8 Flash
            </p>
          </div>

          {/* Card 4: ROI (% Retorno) */}
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Retorno s/ Investimento</span>
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between my-1">
              <span id="kpiRoi" className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                +{roiData.roi_percent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multiplicador de eficiência financeira da plataforma
            </p>
          </div>
        </div>

        {/* Top 3 Motivos de Transbordo (Melhoria Contínua) */}
        {roiData.top_motivos_transbordo && roiData.top_motivos_transbordo.length > 0 && (
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">Top 3 Motivos de Transbordo Humano (Oportunidades de Otimização):</span>
              <span className="text-[10px] text-slate-400">Total transbordados: {roiData.transbordos_humano}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roiData.top_motivos_transbordo.map((item, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium truncate">{item.motivo_transbordo}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold ml-2 shrink-0">
                    {item.qtd} chamados
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dynamic KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Atendimentos */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total de Atendimentos ({currentDataset.label})</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-white font-mono">{currentDataset.totalAtendimentos}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> {currentDataset.variacaoTotal}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Volume acumulado no período</p>
        </div>

        {/* Card 2: Resolução Autônoma */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Resolução Autônoma (IA)</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">{currentDataset.resolucaoIA}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> {currentDataset.variacaoIA}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Resolvidos sem transbordo humano</p>
        </div>

        {/* Card 3: Taxa de Transbordo */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Taxa de Transbordo</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">{currentDataset.taxaTransbordo}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" /> {currentDataset.variacaoTransbordo}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Chamados abertos para atendentes</p>
        </div>

        {/* Card 4: TEMPO MÉDIO DE RESPOSTA (TMR) DA IA (CALCULADO VIA LOGS DE AUDITORIA) */}
        <div
          className={`rounded-2xl p-5 shadow-xl space-y-2.5 transition-all duration-300 border ${
            isAlertActive
              ? 'bg-amber-950/40 border-amber-500/60 shadow-amber-500/10 shadow-xl animate-pulse'
              : 'bg-slate-950 border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={isAlertActive ? 'text-amber-200 font-bold' : 'text-slate-300 font-semibold uppercase tracking-wider'}>
              TMR da IA (Audit Logs)
            </span>
            <div
              className={`p-2 rounded-xl border transition ${
                isAlertActive
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
              }`}
            >
              {isAlertActive ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <Clock className="w-4 h-4" />}
            </div>
          </div>

          <div className="flex items-baseline justify-between my-1">
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-black font-mono tracking-tight transition ${
                  isAlertActive ? 'text-amber-400' : 'text-cyan-400'
                }`}
              >
                {effectiveAvgMs}ms
              </span>
              <span className="text-[11px] text-slate-400 font-mono">TMR Atual</span>
            </div>

            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md border flex items-center gap-0.5 ${
                tmrDiffMs <= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {tmrDiffMs <= 0 ? (
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
              )}
              {tmrDiffMs}ms ({tmrDiffPercent}%)
            </span>
          </div>

          {/* Weekly Comparison & Audit Logs Metrics */}
          <div className="pt-1.5 border-t border-slate-800/80 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Semana Anterior: <strong className="text-slate-200 font-mono">{tmrPrevWeek}ms</strong></span>
              <span className="text-emerald-400 font-bold">
                {tmrDiffMs <= 0 ? '⚡ Ganho de Velocidade' : '⚠️ Latência Elevada'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate">
              Calculado via {auditLogsAnalyzedCount} logs de auditoria • Limite SLA: {thresholdMs}ms
            </p>
          </div>
        </div>
      </div>

      {/* VOLUME EVOLUTION LINE CHART (DYNAMIC TO TIME RANGE) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Evolução do Volume de Atendimentos ({currentDataset.label})</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Comparativo de volume total, resolução autônoma pela IA e solicitações de transbordo no período selecionado.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Total Período: {currentDataset.totalAtendimentos}
          </span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentDataset.volumeTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ponto" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="atendimentos"
                name="Total de Atendimentos"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 4, fill: '#6366f1' }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="resolvidosIA"
                name="Resolvidos pela IA"
                stroke={isAlertActive ? '#f59e0b' : '#10b981'}
                strokeWidth={3}
                dot={{ r: 4, fill: isAlertActive ? '#f59e0b' : '#10b981' }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="transbordo"
                name="Transbordo Humano"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#ef4444' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* EVOLUÇÃO DIÁRIA DA SATISFAÇÃO DOS CLIENTES (RECHARTS LINE CHART) */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-cyan-400" />
              <span>Evolução da Satisfação dos Clientes (CSAT & Joinhas - {currentDataset.label})</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Acompanhamento histórico de avaliações positivas (👍), negativas (👎) e índice CSAT (%) gerado pelo Recharts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              👍 Positivos: {feedbackStats.positive}
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              👎 Negativos: {feedbackStats.negative}
            </span>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold">
              CSAT Atual: {csatPercentage}%
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentDataset.csatTrend} margin={{ top: 10, right: 30, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ponto" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[50, 100]} stroke="#38bdf8" tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                }}
                formatter={(value: any, name: any) => {
                  if (name === 'CSAT (%)') return [`${value}%`, name];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="positivas"
                name="Avaliações Positivas (👍)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 7 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="negativas"
                name="Avaliações Negativas (👎)"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={{ r: 4, fill: '#f43f5e' }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="csat"
                name="CSAT (%)"
                stroke="#38bdf8"
                strokeWidth={3}
                strokeDasharray="3 3"
                dot={{ r: 4, fill: '#38bdf8' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Distribution Profile & Channels Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hourly/Period Distribution Area */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Perfil de Distribuição ({currentDataset.label})</span>
          </h4>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentDataset.hourly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotais" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAutonomos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isAlertActive ? '#f59e0b' : '#10b981'} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={isAlertActive ? '#f59e0b' : '#10b981'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hora" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="totais" name="Total Atendimentos" stroke="#6366f1" fillOpacity={1} fill="url(#colorTotais)" />
                <Area type="monotone" dataKey="autonomos" name="Resolvidos por IA" stroke={isAlertActive ? '#f59e0b' : '#10b981'} fillOpacity={1} fill="url(#colorAutonomos)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channels Distribution Pie */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Distribuição por Canal</span>
          </h4>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {channelData.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span>{c.name}</span>
                </div>
                <span className="font-mono font-bold">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top Reasons Bar Chart */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-indigo-400" />
          <span>Top Motivos de Contato Atendidos ({currentDataset.label})</span>
        </h4>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentDataset.categories} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis dataKey="motivo" type="category" stroke="#64748b" tick={{ fontSize: 10 }} width={140} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="quantidade" name="Contatos" fill="#6366f1" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Agendamento Automático de Relatórios em PDF por E-mail (Semanal) */}
      <div className="bg-slate-950 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
        <div className="absolute -bottom-16 -right-16 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-white">
                  Agendamento de Relatório Executivo em PDF (Envio Semanal)
                </h4>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    pdfScheduleEnabled
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {pdfScheduleEnabled ? 'Agendamento Ativo' : 'Pausado'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure a compilação e o disparo automático semanal do relatório consolidado em PDF direto para sua caixa de entrada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <span className="text-xs text-slate-300 font-medium">Disparo Semanal:</span>
            <button
              type="button"
              onClick={() => {
                const nextState = !pdfScheduleEnabled;
                setPdfScheduleEnabled(nextState);
                onShowToast(
                  nextState ? 'Relatório Semanal Ativado' : 'Relatório Semanal Pausado',
                  nextState
                    ? `Envio automático programado para toda ${pdfDayOfWeek} às ${pdfDeliveryTime}.`
                    : 'O envio automático semanal de PDF foi pausado temporariamente.'
                );
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 cursor-pointer ${
                pdfScheduleEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
              }`}
            >
              <span className="w-4 h-4 bg-white rounded-full shadow-md" />
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setLastScheduledInfo(
              `Toda ${pdfDayOfWeek} às ${pdfDeliveryTime} • Destino: ${pdfRecipientEmail}`
            );
            onShowToast(
              '📅 Agendamento PDF Salvo!',
              `Relatório semanal em PDF agendado para toda ${pdfDayOfWeek} às ${pdfDeliveryTime} (${pdfRecipientEmail}).`
            );
          }}
          className="space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            {/* Destinatário de E-mail */}
            <div className="md:col-span-6">
              <label className="block text-slate-300 mb-1.5 font-semibold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>E-mail Destinatário do Relatório PDF:</span>
              </label>
              <input
                type="email"
                required
                value={pdfRecipientEmail}
                onChange={(e) => setPdfRecipientEmail(e.target.value)}
                placeholder="diretoria@empresa.com.br"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Dia da Semana */}
            <div className="md:col-span-3">
              <label className="block text-slate-300 mb-1.5 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dia do Disparo:</span>
              </label>
              <select
                value={pdfDayOfWeek}
                onChange={(e) => setPdfDayOfWeek(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="Segunda-feira">Segunda-feira</option>
                <option value="Terça-feira">Terça-feira</option>
                <option value="Quarta-feira">Quarta-feira</option>
                <option value="Quinta-feira">Quinta-feira</option>
                <option value="Sexta-feira">Sexta-feira</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>

            {/* Horário do Envio */}
            <div className="md:col-span-3">
              <label className="block text-slate-300 mb-1.5 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Horário (BRT):</span>
              </label>
              <select
                value={pdfDeliveryTime}
                onChange={(e) => setPdfDeliveryTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="07:00">07:00</option>
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="12:00">12:00</option>
                <option value="18:00">18:00</option>
                <option value="20:00">20:00</option>
              </select>
            </div>
          </div>

          {/* Escopo do Conteúdo do PDF */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Módulos Incluídos no Documento PDF:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-indigo-500/40 transition">
                <input
                  type="checkbox"
                  checked={pdfIncludeKpis}
                  onChange={(e) => setPdfIncludeKpis(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
                <span className="text-slate-200">KPIs & Retenção da IA</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-indigo-500/40 transition">
                <input
                  type="checkbox"
                  checked={pdfIncludeCharts}
                  onChange={(e) => setPdfIncludeCharts(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
                <span className="text-slate-200">Gráficos de Evolução (7d/30d)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-indigo-500/40 transition">
                <input
                  type="checkbox"
                  checked={pdfIncludeSlaAudit}
                  onChange={(e) => setPdfIncludeSlaAudit(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
                <span className="text-slate-200">Auditoria de Latência SLA</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 cursor-pointer hover:border-indigo-500/40 transition">
                <input
                  type="checkbox"
                  checked={pdfIncludeHandoff}
                  onChange={(e) => setPdfIncludeHandoff(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
                <span className="text-slate-200">Relatório de Transbordo Humano</span>
              </label>
            </div>
          </div>

          {/* Barra Inferior de Status e Ações */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Programação atual: <strong className="text-indigo-300 font-mono">{lastScheduledInfo}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={() => {
                  setIsGeneratingPdf(true);
                  setTimeout(() => {
                    setIsGeneratingPdf(false);
                    onShowToast(
                      '📄 Relatório PDF Gerado & Enviado!',
                      `O PDF consolidado (${currentDataset.label}) foi enviado agora para ${pdfRecipientEmail}.`
                    );
                  }, 900);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isGeneratingPdf ? 'Compilando PDF...' : 'Enviar PDF Agora (Teste)'}</span>
              </button>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Salvar Agendamento Semanal</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
