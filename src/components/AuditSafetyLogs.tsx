import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Trash2, 
  Cpu, 
  ShieldCheck, 
  Headphones, 
  FileText,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock
} from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditSafetyLogsProps {
  logs: AuditLogItem[];
  onClearLogs: () => void;
}

export const AuditSafetyLogs: React.FC<AuditSafetyLogsProps> = ({ logs, onClearLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('Todos');

  const filteredLogs = logs.filter((log) => {
    const matchesSev = filterSeverity === 'Todos' || log.severity === filterSeverity;
    const matchesSearch =
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSev && matchesSearch;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'danger':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">ALERTA SEGURANÇA</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">TRANSBORDO</span>;
      case 'success':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">SUCESSO</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">INFO</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'function_call':
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case 'jailbreak_attempt':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'ticket_created':
        return <Headphones className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Inspetor de Segurança & Audit Trail em Tempo Real</span>
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Acompanhe a auditoria de execução do assistente: ativação de Function Calling, detecção de ataques de engenharia social (Jailbreak) e criação de tickets de suporte.
          </p>
        </div>
        <button
          onClick={onClearLogs}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-700/60 transition"
        >
          <Trash2 className="w-4 h-4" />
          <span>Limpar Logs</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por evento ou detalhe..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['Todos', 'danger', 'warning', 'info', 'success'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                filterSeverity === sev
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {sev === 'danger' ? 'Alerta' : sev === 'warning' ? 'Transbordo' : sev === 'info' ? 'Info' : sev === 'success' ? 'Sucesso' : 'Todos'}
            </button>
          ))}
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            Nenhum evento registrado no log de auditoria no momento.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs hover:border-slate-700 transition"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 mt-0.5">
                  {getTypeIcon(log.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-bold text-slate-200 text-sm">{log.title}</span>
                    {getSeverityBadge(log.severity)}
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed break-all">{log.details}</p>
                </div>
              </div>

              <div className="text-slate-500 text-[11px] flex items-center gap-1 flex-shrink-0 self-end md:self-center">
                <Clock className="w-3.5 h-3.5" />
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
