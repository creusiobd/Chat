import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  CheckCircle, 
  RefreshCw, 
  Smartphone, 
  Code, 
  Zap, 
  Copy, 
  Check 
} from 'lucide-react';

interface WhatsAppLog {
  id: string;
  timestamp: string;
  type: 'incoming' | 'outgoing' | 'verification';
  fromOrTo: string;
  text: string;
  details?: any;
}

interface WhatsAppSimulatorProps {
  onShowToast: (title: string, message: string, type?: 'success' | 'error') => void;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({ onShowToast }) => {
  const [phoneNumber, setPhoneNumber] = useState('5511999998888');
  const [messageText, setMessageText] = useState('Olá, onde está o pedido PED-1001?');
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/whatsapp/logs');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Erro ao obter logs de WhatsApp:', e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendWaWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || loading) return;

    setLoading(true);

    const metaPayload = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WHATSAPP_BUSINESS_ACCOUNT_ID',
          changes: [
            {
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '5511999999999', phone_number_id: '100200300400' },
                contacts: [{ profile: { name: 'Cliente WhatsApp' }, wa_id: phoneNumber }],
                messages: [
                  {
                    from: phoneNumber,
                    id: `wamid.${Date.now()}`,
                    timestamp: `${Math.floor(Date.now() / 1000)}`,
                    text: { body: messageText },
                    type: 'text',
                  },
                ],
              },
              field: 'messages',
            },
          ],
        },
      ],
    };

    try {
      await fetch('/webhook/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaPayload),
      });

      onShowToast('Webhook Disparado', `Mensagem simulada enviada a partir de ${phoneNumber}`);
      setMessageText('');
    } catch (err: any) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setLoading(false);
        fetchLogs();
      }, 600);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulador de Payload da Meta */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Disparar Webhook POST (Simular Mensagem Meta)</span>
          </h4>

          <form onSubmit={handleSendWaWebhook} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Telefone Remetente (message.from):</label>
              <input
                type="text"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Conteúdo da Mensagem (message.text.body):</label>
              <input
                type="text"
                required
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Olá, onde está o pedido PED-1001?"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={!messageText.trim() || loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Zap className="w-4 h-4" />
              <span>Disparar Webhook no server.ts</span>
            </button>
          </form>
        </div>

        {/* Monitor de Tráfego de Webhook */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col h-[380px] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-400 font-mono">Live Webhook Traffic Monitor</span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              200 OK Listening
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 font-mono text-[11px] text-slate-300 space-y-2">
            {logs.length === 0 ? (
              <div className="text-slate-500 py-12 text-center text-xs">
                Aguardando disparo de eventos no webhook...
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="space-y-0.5 border-b border-slate-900/80 pb-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span
                      className={`font-bold ${
                        log.type === 'incoming'
                          ? 'text-blue-400'
                          : log.type === 'outgoing'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      [{log.timestamp}] {log.type.toUpperCase()} - {log.fromOrTo}
                    </span>
                  </div>
                  <div className="text-slate-200">{log.text}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
