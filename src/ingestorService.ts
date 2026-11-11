// @ts-ignore
import pdfParse from 'pdf-parse';
import 'multer';
import { ragRepo } from './database';
import { obterOuCriarContextCache } from './cacheManager';

export async function processarArquivoEAtualizarCache(
  arquivo: Express.Multer.File,
  categoria: string = 'Geral'
) {
  let textoExtraido = '';

  // 1. Extração de acordo com a extensão do arquivo
  const extensao = arquivo.originalname.split('.').pop()?.toLowerCase();

  if (extensao === 'pdf') {
    const pdfFn = typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default || pdfParse;
    const pdfData = await pdfFn(arquivo.buffer);
    // Limpeza de quebras de linha excessivas comuns em PDFs
    textoExtraido = pdfData.text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  } else {
    // Arquivos .md, .txt ou .csv
    textoExtraido = arquivo.buffer.toString('utf-8').trim();
  }

  if (!textoExtraido) {
    throw new Error('O arquivo enviado está vazio ou não contém texto legível.');
  }

  // 2. Estimativa de tokens (~1 token a cada 4 caracteres)
  const tokensEstimados = Math.round(textoExtraido.length / 4);

  // 3. Salva no banco de dados local SQLite
  ragRepo.salvarDocumento(arquivo.originalname, categoria, textoExtraido, tokensEstimados);
  console.log(`📄 [Ingestor] Documento "${arquivo.originalname}" salvo no SQLite (~${tokensEstimados} tokens).`);

  // 4. Consolida todos os documentos ativos e recria o Cache no Gemini
  const { textoTotal, totalTokens } = ragRepo.obterTextoConsolidadoAtivo();
  console.log(`🔄 [Ingestor] Reconstruindo Context Cache do Gemini (Total: ~${totalTokens} tokens)...`);

  // Força a recriação do cache (TTL de 2 horas = 7200s)
  const novoCacheName = await obterOuCriarContextCache(textoTotal, 7200);

  return {
    sucesso: true,
    arquivo: arquivo.originalname,
    tokensDocumento: tokensEstimados,
    totalTokensBase: totalTokens,
    cacheAtivoId: novoCacheName
  };
}
