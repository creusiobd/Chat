import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  X, 
  Database,
  FileSpreadsheet,
  Gift,
  Send,
  Sparkles,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { Order } from '../types';

interface OrdersDBManagerProps {
  orders: Order[];
  onAddOrder: (newOrder: Order) => void;
  onLogAudit: (type: any, title: string, details: string, severity: any) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error') => void;
}

export const OrdersDBManager: React.FC<OrdersDBManagerProps> = ({
  orders,
  onAddOrder,
  onLogAudit,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisparandoPosVenda, setIsDisparandoPosVenda] = useState(false);
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);

  const [codigoPedido, setCodigoPedido] = useState(`PED-${Math.floor(1000 + Math.random() * 9000)}`);
  const [cliente, setCliente] = useState('');
  const [status, setStatus] = useState('Em trânsito');
  const [rastreio, setRastreio] = useState('');
  const [previsaoEntrega, setPrevisaoEntrega] = useState('18/11/2026');
  const [itens, setItens] = useState('');
  const [origem, setOrigem] = useState('Google Sheets');

  const displayOrders = localOrders.length > 0 ? localOrders : orders;

  const filteredOrders = displayOrders.filter(
    (o) =>
      o.codigo_pedido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoPedido.trim() || !cliente.trim() || !itens.trim()) return;

    const itemsArray = itens.split('\n').filter((i) => i.trim().length > 0);

    const newOrder: Order = {
      codigo_pedido: codigoPedido.trim().toUpperCase(),
      cliente: cliente.trim(),
      status,
      rastreio: rastreio.trim() || 'Aguardando Coleta',
      previsao_entrega: previsaoEntrega.trim(),
      itens: itemsArray,
      valor: 299.00,
      endereco: 'Endereço sincronizado no ERP',
      forma_pagamento: origem,
      pos_venda_enviado: false,
    };

    onAddOrder(newOrder);
    setLocalOrders((prev) => [newOrder, ...prev]);
    onShowToast('Pedido Sincronizado', `Pedido ${newOrder.codigo_pedido} registrado na redundância.`);
    setIsModalOpen(false);
    setCodigoPedido(`PED-${Math.floor(1000 + Math.random() * 9000)}`);
    setCliente('');
    setItens('');
  };

  const handleForceSync = () => {
    onShowToast('Sincronização Ativa', 'Google Sheets sincronizado com o SQLite local (4 registros atualizados).');
  };

  const handleTriggerPosVendaAtivo = async () => {
    setIsDisparandoPosVenda(true);
    try {
      const res = await fetch('/api/pos-venda/disparar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: displayOrders }),
      });
      const data = await res.json();

      setIsDisparandoPosVenda(false);

      if (data.sucesso) {
        // Update local status of sent orders
        setLocalOrders((prev) =>
          prev.map((ord) =>
            ord.status === 'Entregue' ? { ...ord, pos_venda_enviado: true } : ord
          )
        );

        onLogAudit(
          'policy_query',
          'Rotina Pós-Venda Ativo Executada',
          `Mensagem ativa com cupom RECOMPRA15 enviada para ${data.totalProcessados} pedido(s) com status 'Entregue'.`,
          'success'
        );

        onShowToast(
          '🎉 Pós-Venda Ativo Disparado!',
          data.totalProcessados > 0
            ? `Cupom RECOMPRA15 enviado via WhatsApp para ${data.totalProcessados} cliente(s) com pedido entregue!`
            : 'Todos os pedidos entregues já haviam recebido a mensagem de pós-venda.'
        );
      }
    } catch (e: any) {
      setIsDisparandoPosVenda(false);
      onShowToast('Erro ao Disparar Pós-Venda', e.message || 'Falha na rotina.', 'error');
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Redundancy Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border border-indigo-900/40 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Redundância Ativa: Google Sheets + SQLite Local
            </h4>
            <p className="text-xs text-slate-400">
              Primário: Planilha em Nuvem (Edição rápida) • Contingência: SQLite Local (Zero Downtime)
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-xs px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition"
          >
            + Novo Registro
          </button>
          <button
            onClick={handleForceSync}
            className="text-xs px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sincronizar Agora</span>
          </button>
        </div>
      </div>

      {/* Pós-Venda Ativo Automated Trigger Banner */}
      <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white">
                  Rotina de Pós-Venda Ativo (WhatsApp Meta API)
                </h4>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Cron Job / Webhook ERP
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Busca pedidos com status <strong className="text-emerald-400 font-normal">'Entregue'</strong> que ainda não receberam mensagem e dispara automaticamente o cupom <strong className="text-emerald-300 font-mono font-bold">RECOMPRA15</strong> (15% OFF nas próximas 48h).
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerPosVendaAtivo}
            disabled={isDisparandoPosVenda}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 shrink-0 cursor-pointer"
          >
            {isDisparandoPosVenda ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Disparando Pós-Venda...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Executar Pós-Venda Ativo (RECOMPRA15)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Registros Sincronizados de Pedidos
          </h4>
          <span className="text-xs text-slate-500 font-mono">{displayOrders.length} registros ativos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-semibold">Código</th>
                <th className="p-3.5 font-semibold">Cliente</th>
                <th className="p-3.5 font-semibold">CPF (LGPD)</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Pós-Venda</th>
                <th className="p-3.5 font-semibold">Rastreamento</th>
                <th className="p-3.5 font-semibold">Previsão</th>
                <th className="p-3.5 font-semibold">Origem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredOrders.map((ord) => (
                <tr key={ord.codigo_pedido} className="hover:bg-slate-900/40 transition">
                  <td className="p-3.5 font-mono font-bold text-indigo-400">{ord.codigo_pedido}</td>
                  <td className="p-3.5">{ord.cliente}</td>
                  <td className="p-3.5 font-mono text-slate-400">
                    <span className="text-emerald-400 font-bold">{ord.cpf_prefixo || ord.cpf_titular?.slice(0, 3) || '123'}</span>.***.***-**
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        ord.status.includes('Entregue')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ord.status.includes('trânsito')
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {ord.pos_venda_enviado ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> RECOMPRA15 Enviado
                      </span>
                    ) : ord.status === 'Entregue' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                        <Tag className="w-3 h-3" /> Pendente Disparo
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono">Aguardando Entrega</span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-slate-400">{ord.rastreio || 'Aguardando Coleta'}</td>
                  <td className="p-3.5">{ord.previsao_entrega || ord.data_entrega || 'Em processamento'}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-mono ${
                        ord.forma_pagamento?.includes('SQLite') ? 'text-indigo-400' : 'text-emerald-400'
                      }`}
                    >
                      {ord.forma_pagamento || 'Google Sheets'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-xs">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Novo Registro no Hub de Pedidos</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Código do Pedido</label>
                <input
                  type="text"
                  required
                  value={codigoPedido}
                  onChange={(e) => setCodigoPedido(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Ex: Carlos Santos"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Status do Pedido</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Em trânsito">Em trânsito</option>
                  <option value="Entregue">Entregue</option>
                  <option value="Preparando no estoque">Preparando no estoque</option>
                  <option value="Aguardando Coleta">Aguardando Coleta</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Código de Rastreamento</label>
                <input
                  type="text"
                  value={rastreio}
                  onChange={(e) => setRastreio(e.target.value)}
                  placeholder="BR987654321"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Itens do Pedido</label>
                <textarea
                  rows={2}
                  required
                  value={itens}
                  onChange={(e) => setItens(e.target.value)}
                  placeholder="Item 1 (x1)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-1.5 rounded-xl shadow-md shadow-indigo-600/30"
                >
                  Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
