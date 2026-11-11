export interface PolicyDoc {
  id: string;
  title: string;
  category: string;
  content: string;
  active: boolean;
  updatedAt: string;
}

export interface Order {
  codigo_pedido: string;
  cliente: string;
  telefone?: string;
  cpf_titular?: string;
  cpf_prefixo?: string;
  status: string;
  rastreio?: string;
  previsao_entrega?: string;
  data_entrega?: string;
  itens: string[];
  valor: number;
  endereco: string;
  forma_pagamento: string;
  pos_venda_enviado?: boolean;
}

export interface HumanTicket {
  id: string;
  cliente: string;
  codigo_pedido?: string;
  motivo: string;
  resumo: string;
  causa_transferencia: string;
  dados_coletados?: string;
  status: 'Aberto' | 'Em Atendimento' | 'Resolvido';
  criadoEm: string;
  prioridade: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  respostaOperador?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  toolCalls?: {
    name: string;
    args: Record<string, any>;
    result?: Record<string, any>;
  }[];
  ticketGenerated?: HumanTicket;
  isJailbreakAttempt?: boolean;
  feedback?: 'up' | 'down';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  type: 'function_call' | 'jailbreak_attempt' | 'hallucination_prevention' | 'ticket_created' | 'policy_query';
  title: string;
  details: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
}

export interface AppConfig {
  companyName: string;
  accentColor: string;
  systemPrompt: string;
}
