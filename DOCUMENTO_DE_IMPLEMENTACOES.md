# DOCUMENTO DE ESPECIFICAÇÃO TÉCNICA E IMPLEMENTAÇÕES
**Plataforma OmniFlow AI — Atendimento Autônomo & Analytics Financeiro**
*Data das Implementações: 10 de Novembro de 2026*

---

## 1. RESUMO EXECUTIVO
Este documento registra formalmente todas as arquiteturas, módulos, regras de segurança, integrações de IA e dashboards analíticos implementados no sistema **OmniFlow AI**. As melhorias abrangem desde a proteção de dados (LGPD) até o rastreamento financeiro de ROI (Retorno sobre Investimento) em tempo real via banco SQLite local.

---

## 2. SEGURANÇA E PROTOCOLO LGPD

### 2.1 Validação de Autenticidade por CPF Parcial
- **Ferramenta Invocada**: `consultar_pedido` em `server.ts`.
- **Regra de Negócio**: Antes de expor o endereço de entrega completo ou dados cadastrais sensíveis do titular de um pedido (ex: `PED-1001`), a IA deve exigir que o cliente confirme os **3 primeiros dígitos do CPF do titular**.
- **Resultado do Servidor**:
  - *Sem confirmação ou CPF incorreto*: Retorna status `auth_requerida` mascarando o endereço (ex: `"Rua *** (Pendente confirmação dos 3 primeiros dígitos do CPF)"`).
  - *Com confirmação exata (ex: "123")*: Retorna status `autorizado` liberando o rastreio e o endereço completo de entrega.

---

## 3. AUTOMAÇÃO DE PÓS-VENDA ATIVO VIA WHATSAPP

### 3.1 Disparo de Mensagens de Boas-Vindas e Recompra
- **Módulo**: `dispararPosVendaAtivo` / Rota `POST /api/whatsapp/pos-venda-ativo`.
- **Regra de Operação**:
  1. Varre o banco de dados buscando pedidos com status `'Entregue'` que ainda não receberam a notificação (`pos_venda_enviado = 0`).
  2. Dispara mensagem via simulador / Meta Cloud API do WhatsApp com cupom de desconto exclusivo (`RECOMPRA15` - 15% OFF válido por 48h).
  3. Atualiza o sinalizador no banco de dados para evitar reenvio duplicado.

---

## 4. SISTEMA DE AVALIAÇÃO DE RESPOSTAS DA IA (JOINHA 👍 / 👎)

### 4.1 Captura de Feedback no ChatSimulator
- **Componente**: `src/components/ChatSimulator.tsx`.
- **Interface**: Adicionados botões interativos de "Joinha Positivo" (👍) e "Joinha Negativo" (👎) em cada mensagem do assistente.
- **Fluxo**:
  - Ao clicar em 👍 ou 👎, o estado da mensagem é atualizado instantaneamente com destaque de cor.
  - Um Toast de confirmação é exibido ao usuário.
  - A ação gera um log auditável em `AuditSafetyLogs.tsx` e atualiza o estado global `feedbackStats` em `App.tsx`.

### 4.2 Métricas Consolidadas de CSAT
- **Componente**: `src/components/AnalyticsDashboard.tsx`.
- **Card CSAT & Joinha da IA**: Exibe o índice de satisfação geral em porcentagem, contagem absoluta de votos positivos e negativos, além de um medidor gráfico proporcional.

---

## 5. DASHBOARD VISUAL DE EVOLUÇÃO DA SATISFAÇÃO (RECHARTS)

### 5.1 Gráfico Diário de Linhas Duplas
- **Módulo**: `AnalyticsDashboard.tsx` utilizando a biblioteca **Recharts**.
- **Visualização**:
  - *Eixo Esquerdo*: Volume de avaliações positivas (👍 verde) vs negativas (👎 vermelho).
  - *Eixo Direito*: Porcentagem acumulada da nota **CSAT (%)** em azul ciano.
- **Filtros Temporais**: Atualiza dinamicamente conforme o período selecionado (**7 Dias**, **30 Dias** e **Anual**).

---

## 6. TEMPO MÉDIO DE RESPOSTA (TMR) E ANÁLISE DE AUDITORIA

### 6.1 Rastreamento de Latência por Logs de Auditoria
- **Módulo**: `AnalyticsDashboard.tsx`.
- **Funcionalidade**:
  - Calcula o **Tempo Médio de Resposta (TMR)** com base na amostragem dos logs de auditoria (`auditLogs`).
  - Exibe comparativo entre a **Última Semana** vs **Semana Anterior** (ex: `540ms` vs `610ms`).
  - Apresenta variação visual (ex: `-70ms / -11.5%` de ganho de velocidade com ícone ⚡).

---

## 7. ARQUITETURA DE BANCO DE DADOS E AUDITORIA FINANCEIRA (ROI)

### 7.1 Banco SQLite e Repositório (`src/database.ts`)
Tabelas criadas via `better-sqlite3`:
1. `metricas_atendimentos`:
   - `session_id` (TEXT)
   - `telefone` (TEXT)
   - `tokens_entrada` (INTEGER)
   - `tokens_saida` (INTEGER)
   - `custo_ia_reais` (REAL)
   - `resolvido_ia` (INTEGER: 1 = IA / Deflexão, 0 = Transbordo)
   - `motivo_transbordo` (TEXT)
   - `criado_em` (DATETIME)

2. `configuracoes_roi`:
   - `custo_chamado_humano` (REAL DEFAULT 9.00)
   - `mensalidade_plataforma` (REAL DEFAULT 990.00)

3. **Repositório `roiRepo`**:
   - `salvarMetrica()`: Registra dados de cada atendimento.
   - `obterConfiguracoes()`: Retorna parâmetros comerciais.
   - `atualizarCustoHumano()`: Atualiza o custo por chamado humano.
   - `obterResumoMetricas()`: Consolida economia bruta, economia líquida e % ROI.

### 7.2 Auditoria Automática de Tokens (`server.ts`)
- **Função**: `auditarAtendimentoFinanceiro`.
- **Funcionamento**: Extrai a contagem real de `usageMetadata` do SDK `@google/genai` em cada interação do `/api/chat`, aplica a tabela de preços oficial do Gemini (R$ 0,40 por 1M de tokens) e persiste o desfecho financeiro no SQLite.

---

## 8. ENDPOINTS DE API REST

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/metricas/roi` | Retorna métricas consolidadas em tempo real (total atendimentos, deflexão, custo IA, economia líquida, % ROI e Top 3 motivos de transbordo). |
| `POST` | `/api/configuracoes/custo-humano` | Atualiza o custo por atendimento humano configurado pelo cliente. |
| `GET` | `/api/roi/config` | Consulta as configurações comerciais cadastradas. |
| `POST` | `/api/roi/metricas` | Registra métrica individual de conversa via API. |

---

## 9. PAINEL EXECUTIVO DE ROI E ELEMENTOS DOM

### 9.1 Mapeamento de IDs Exatos para Integração
No `AnalyticsDashboard.tsx`, os elementos de KPI são atualizados via dados da API `/api/metricas/roi` e possuem os seguintes seletores DOM:

- `#kpiEconomia`: Exibe a economia líquida gerada (ex: `R$ 11.795,60`).
- `#kpiDeflexao`: Exibe a taxa de deflexão autônoma da IA (ex: `88.4%`).
- `#kpiCustoIA`: Exibe o custo total consumido de IA (ex: `R$ 12.40`).
- `#kpiRoi`: Exibe a porcentagem de retorno sobre investimento (ex: `+1180%`).

---

## 10. COMPONENTE DE CONFIGURAÇÕES DE ALERTAS DE TMR

### 10.1 Controle em Segundos e Persistência Local
- **Inputs Numéricos em Segundos**: Entrada direta para ajuste dos limiares em segundos (ex: `0.60s` para aviso e `0.85s` para nível crítico).
- **Checkbox de E-mail**: Checkbox de alternância rápida para ativar ou pausar o disparo de e-mails de notificação automática.
- **Persistência `localStorage`**: Salva e carrega automaticamente o objeto `tmr_alert_settings` no navegador do usuário a cada inicialização.

---

## 11. STATUS DOS TESTES E COMPILAÇÃO
- **Build TypeScript (`compile_applet`)**: Executado e aprovado com **0 erros**.
- **Linter de Código (`lint_applet`)**: Executado e aprovado com **0 avisos/erros**.
- **Servidor Dev (`tsx server.ts`)**: Rodando normalmente na porta **3000**.
