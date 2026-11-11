import { GoogleGenAI } from '@google/genai';

function getAiClient() {
  return new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || ' placeholder_key ',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const MODEL_NAME = 'gemini-3.8-flash';

// Estrutura para controle em memória do cache ativo
interface CacheMetadata {
  cacheName: string | null;
  criadoEm: number;
  expiraEm: number; // Timestamp em ms
  hashConteudo: string;
}

let activeCache: CacheMetadata = {
  cacheName: null,
  criadoEm: 0,
  expiraEm: 0,
  hashConteudo: ''
};

/**
 * Obtém ou cria o Context Caching do Gemini para as políticas oficiais
 * @param systemInstructionTexto Texto consolidado de todas as políticas ativas
 * @param ttlSegundos Tempo de expiração (padrão 3600s = 1 hora)
 */
export async function obterOuCriarContextCache(
  systemInstructionTexto: string,
  ttlSegundos: number = 3600
): Promise<string | null> {
  const agora = Date.now();
  const ttlMs = ttlSegundos * 1000;

  // 1. Verifica se já existe um cache ativo válido com o mesmo conteúdo
  if (
    activeCache.cacheName &&
    agora < activeCache.expiraEm - 60000 && // Margem de segurança de 1 minuto
    activeCache.hashConteudo === systemInstructionTexto
  ) {
    console.log(`⚡ [Context Caching] Reutilizando cache ativo: ${activeCache.cacheName}`);
    return activeCache.cacheName;
  }

  // 2. Criação ou renovação do cache na API do Google
  try {
    console.log(`📦 [Context Caching] Criando novo cache nos servidores do Google...`);
    const ai = getAiClient();

    const cacheCriado = await ai.caches.create({
      model: MODEL_NAME,
      config: {
        displayName: 'omniflow_knowledge_cache',
        systemInstruction: systemInstructionTexto,
        ttl: `${ttlSegundos}s`
      }
    });

    activeCache = {
      cacheName: cacheCriado.name || null,
      criadoEm: agora,
      expiraEm: agora + ttlMs,
      hashConteudo: systemInstructionTexto
    };

    console.log(`✅ [Context Caching] Cache criado com sucesso! ID: ${cacheCriado.name}`);
    console.log(`⏳ [Context Caching] Válido até: ${new Date(activeCache.expiraEm).toLocaleTimeString()}`);

    return activeCache.cacheName;
  } catch (error: any) {
    // Tratamento de contingência: bases menores que o limiar mínimo de tokens da API
    console.warn(`⚠️ [Context Caching Fallback]: ${error.message}`);
    console.log(`🔄 Utilizando injeção direta de System Instruction sem cache.`);
    return null;
  }
}

export function obterStatusCacheAtivo() {
  const agora = Date.now();
  const ativo = activeCache.cacheName !== null && agora < activeCache.expiraEm;
  return {
    ativo,
    cacheName: activeCache.cacheName,
    expiraEm: activeCache.expiraEm > 0 ? new Date(activeCache.expiraEm).toLocaleTimeString('pt-BR') : null,
    tempoRestanteMinutos: ativo ? Math.round((activeCache.expiraEm - agora) / 60000) : 0
  };
}
