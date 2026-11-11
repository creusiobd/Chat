import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Check, 
  Search,
  MessageSquare
} from 'lucide-react';
import { HumanTicket } from '../types';

interface HumanDeskProps {
  tickets: HumanTicket[];
  onUpdateTicketStatus: (id: string, status: 'Aberto' | 'Em Atendimento' | 'Resolvido', resposta?: string) => void;
  onLogAudit: (type: any, title: string, details: string, severity: any) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error') => void;
}

export const HumanDesk: React.FC<HumanDeskProps> = ({
  tickets,
  onUpdateTicketStatus,
  onLogAudit,
  onShowToast,
}) => {
  const [assignedTickets, setAssignedTickets] = useState<Record<string, boolean>>({});

  const handleTakeTicket = (id: string) => {
    setAssignedTickets((prev) => ({ ...prev, [id]: true }));
    onUpdateTicketStatus(id, 'Em Atendimento');
    onShowToast('Chamado Assumido', `Conversa do ticket ${id} transferida para a sua fila de operador.`);
  };

  const openTickets = tickets.filter((t) => t.status !== 'Resolvido');

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Fila de Chamados para Atendentes</h3>
          <p className="text-xs text-slate-400">
            Gerados automaticamente quando a ferramenta <code className="text-amber-400 font-mono">abrir_chamado_humano</code> é acionada.
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
          {openTickets.length} Chamados Pendentes
        </span>
      </div>

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-xs">
            Nenhum chamado pendente no momento.
          </div>
        ) : (
          tickets.map((t) => {
            const isAssigned = assignedTickets[t.id] || t.status === 'Em Atendimento';
            const isResolved = t.status === 'Resolvido';

            return (
              <div
                key={t.id}
                className={`bg-slate-950 border rounded-2xl p-5 space-y-3 hover:border-slate-700 transition shadow-xl ${
                  isResolved ? 'border-slate-900 opacity-60' : 'border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        t.prioridade === 'Urgente' || t.prioridade === 'Alta'
                          ? 'bg-rose-500 animate-ping'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span className="text-xs font-bold text-white">{t.id} • {t.cliente}</span>
                    <span className="text-[10px] font-mono text-slate-500">{t.dados_coletados || '5511988887777'}</span>
                  </div>

                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                      t.prioridade === 'Urgente' || t.prioridade === 'Alta'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    Urgência: {t.prioridade} ({t.causa_transferencia.includes('Insatisfação') ? 'Procon' : 'Suporte'})
                  </span>
                </div>

                <div className="bg-slate-900/80 rounded-xl p-3 text-xs space-y-1.5 border border-slate-800/80 font-mono">
                  <div>
                    <span className="text-slate-500">Motivo:</span> <span className="text-amber-300">{t.motivo}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Resumo:</span> <span className="text-slate-300">{t.resumo}</span>
                  </div>
                  {t.causa_transferencia && (
                    <div>
                      <span className="text-slate-500">Causa Transferência:</span>{' '}
                      <span className="text-indigo-300">{t.causa_transferencia}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    disabled={isAssigned || isResolved}
                    onClick={() => handleTakeTicket(t.id)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl font-semibold transition shadow-md flex items-center gap-1.5 ${
                      isAssigned
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{isAssigned ? 'Chamado em Atendimento' : 'Assumir no WhatsApp'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
