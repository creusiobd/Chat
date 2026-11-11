import Database from 'better-sqlite3';
import path from 'path';

// Instancia o banco SQLite local
const dbPath = path.resolve(process.cwd(), 'database.sqlite');
export const db = new Database(dbPath);

// Configuração do PRAGMA para melhor performance e journaling
db.pragma('journal_mode = WAL');

// Tabela e Schemas do Banco de Dados
db.exec(`
  -- Tabela de Pedidos
  CREATE TABLE IF NOT EXISTS pedidos (
    codigo TEXT PRIMARY KEY,
    cliente TEXT NOT NULL,
    telefone TEXT,
    cpf TEXT,
    status TEXT NOT NULL,
    rastreio TEXT,
    pos_venda_enviado INTEGER DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela para registrar o desfecho financeiro de cada atendimento
  CREATE TABLE IF NOT EXISTS metricas_atendimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    telefone TEXT,
    tokens_entrada INTEGER DEFAULT 0,
    tokens_saida INTEGER DEFAULT 0,
    custo_ia_reais REAL DEFAULT 0.0,
    resolvido_ia INTEGER DEFAULT 1,       -- 1 = Resolvido por IA (Deflexão), 0 = Foi para Humano
    motivo_transbordo TEXT,               -- Ex: "Dúvida não documentada" ou "Insatisfação"
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Tabela de parâmetros comerciais configuráveis pelo cliente
  CREATE TABLE IF NOT EXISTS configuracoes_roi (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    custo_chamado_humano REAL DEFAULT 9.00, -- R$ 9,00 padrão, customizável
    mensalidade_plataforma REAL DEFAULT 990.00
  );

  -- Tabela de documentos RAG para a Base de Conhecimento
  CREATE TABLE IF NOT EXISTS documentos_rag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_arquivo TEXT NOT NULL,
    categoria TEXT DEFAULT 'Geral',
    conteudo_texto TEXT NOT NULL,
    tokens_estimados INTEGER DEFAULT 0,
    ativo INTEGER DEFAULT 1,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Insere o registro padrão de ROI se não existir
  INSERT OR IGNORE INTO configuracoes_roi (id, custo_chamado_humano, mensalidade_plataforma)
  VALUES (1, 9.00, 990.00);
`);

export const roiRepo = {
  // Salva o registro da conversa finalizada
  salvarMetrica: (dados: {
    sessionId: string;
    telefone?: string;
    tokensEntrada: number;
    tokensSaida: number;
    custoIAReais: number;
    resolvidoIA: boolean;
    motivoTransbordo?: string;
  }) => {
    const stmt = db.prepare(`
      INSERT INTO metricas_atendimentos 
      (session_id, telefone, tokens_entrada, tokens_saida, custo_ia_reais, resolvido_ia, motivo_transbordo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      dados.sessionId,
      dados.telefone || 'webchat',
      dados.tokensEntrada,
      dados.tokensSaida,
      dados.custoIAReais,
      dados.resolvidoIA ? 1 : 0,
      dados.motivoTransbordo || null
    );
  },

  // Busca configurações comerciais
  obterConfiguracoes: () => {
    return db.prepare('SELECT * FROM configuracoes_roi WHERE id = 1').get() as {
      custo_chamado_humano: number;
      mensalidade_plataforma: number;
    };
  },

  // Atualiza custo por chamado humano do cliente
  atualizarCustoHumano: (novoCusto: number) => {
    db.prepare('UPDATE configuracoes_roi SET custo_chamado_humano = ? WHERE id = 1').run(novoCusto);
  },

  // Obtém resumo consolidado de ROI e métricas
  obterResumoMetricas: () => {
    const totalRow = db.prepare(`
      SELECT 
        COUNT(*) as total_atendimentos,
        SUM(CASE WHEN resolvido_ia = 1 THEN 1 ELSE 0 END) as resolvidos_ia,
        SUM(CASE WHEN resolvido_ia = 0 THEN 1 ELSE 0 END) as transbordos,
        SUM(custo_ia_reais) as custo_total_ia,
        SUM(tokens_entrada + tokens_saida) as total_tokens
      FROM metricas_atendimentos
    `).get() as any;

    const config = roiRepo.obterConfiguracoes();
    const total = totalRow?.total_atendimentos || 0;
    const resolvidos = totalRow?.resolvidos_ia || 0;
    const custoHumanoEconomizado = resolvidos * (config?.custo_chamado_humano || 9.00);
    const custoIaTotal = totalRow?.custo_total_ia || 0;
    const economiaLiquida = custoHumanoEconomizado - custoIaTotal;

    return {
      totalAtendimentos: total,
      resolvidosIA: resolvidos,
      transbordos: totalRow?.transbordos || 0,
      custoTotalIA: custoIaTotal,
      custoHumanoEconomizado,
      economiaLiquida,
      custoPorChamadoHumano: config?.custo_chamado_humano || 9.00,
      mensalidadePlataforma: config?.mensalidade_plataforma || 990.00
    };
  }
};

export const ragRepo = {
  // Salva novo documento
  salvarDocumento: (nomeArquivo: string, categoria: string, conteudoTexto: string, tokens: number) => {
    const stmt = db.prepare(`
      INSERT INTO documentos_rag (nome_arquivo, categoria, conteudo_texto, tokens_estimados)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(nomeArquivo, categoria, conteudoTexto, tokens);
  },

  // Retorna todos os documentos ativos concatenados para o Context Caching
  obterTextoConsolidadoAtivo: (): { textoTotal: string; totalTokens: number } => {
    const docs = db.prepare('SELECT nome_arquivo, categoria, conteudo_texto, tokens_estimados FROM documentos_rag WHERE ativo = 1').all() as any[];
    
    let textoTotal = '# BASE DE CONHECIMENTO OFICIAL E DIRETRIZES DA EMPRESA\n\n';
    let totalTokens = 0;

    for (const doc of docs) {
      textoTotal += `\n---\n## DOCUMENTO: ${doc.nome_arquivo} [Categoria: ${doc.categoria}]\n\n${doc.conteudo_texto}\n`;
      totalTokens += doc.tokens_estimados;
    }

    return { textoTotal, totalTokens };
  },

  // Lista todos os documentos para exibir no painel
  listarDocumentos: () => {
    return db.prepare('SELECT id, nome_arquivo, categoria, tokens_estimados, ativo, atualizado_em FROM documentos_rag ORDER BY atualizado_em DESC').all();
  },

  // Remove ou desativa documento
  removerDocumento: (id: number) => {
    db.prepare('DELETE FROM documentos_rag WHERE id = ?').run(id);
  }
};
