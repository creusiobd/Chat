import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  FileText, 
  CheckCircle2, 
  ToggleLeft, 
  ToggleRight 
} from 'lucide-react';
import { PolicyDoc } from '../types';

interface KnowledgeBaseEditorProps {
  companyName: string;
  policies: PolicyDoc[];
  onUpdatePolicies: (newPolicies: PolicyDoc[]) => void;
  onLogAudit: (type: any, title: string, details: string, severity: any) => void;
  onShowToast: (title: string, message: string, type?: 'success' | 'error') => void;
}

export const KnowledgeBaseEditor: React.FC<KnowledgeBaseEditorProps> = ({
  companyName,
  policies,
  onUpdatePolicies,
  onLogAudit,
  onShowToast,
}) => {
  const [editingPolicy, setEditingPolicy] = useState<PolicyDoc | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Pós-Venda');
  const [content, setContent] = useState('');
  const [active, setActive] = useState(true);

  const handleToggleActive = (id: string) => {
    const updated = policies.map((p) => (p.id === id ? { ...p, active: !p.active } : p));
    onUpdatePolicies(updated);
    const target = policies.find((p) => p.id === id);
    onShowToast(
      'Política Atualizada',
      `Documento "${target?.title}" foi ${!target?.active ? 'ativado' : 'desativado'}.`
    );
  };

  const handleDelete = (id: string) => {
    const target = policies.find((p) => p.id === id);
    if (!confirm(`Excluir o documento "${target?.title}"?`)) return;
    const updated = policies.filter((p) => p.id !== id);
    onUpdatePolicies(updated);
    onShowToast('Documento Removido', `Política "${target?.title}" removida da base de conhecimento.`);
  };

  const handleSavePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    if (editingPolicy) {
      const updated = policies.map((p) =>
        p.id === editingPolicy.id
          ? { ...p, title, category, content, active, updatedAt: new Date().toISOString().split('T')[0] }
          : p
      );
      onUpdatePolicies(updated);
      onShowToast('Documento Editado', `Política "${title}" salva com sucesso.`);
    } else {
      const newDoc: PolicyDoc = {
        id: `pol-${Date.now()}`,
        title,
        category,
        content,
        active: true,
        updatedAt: new Date().toISOString().split('T')[0],
      };
      onUpdatePolicies([...policies, newDoc]);
      onShowToast('Nova Política Criada', `Documento "${title}" inserido no contexto RAG.`);
    }

    closeModal();
  };

  const openEditModal = (doc: PolicyDoc) => {
    setEditingPolicy(doc);
    setTitle(doc.title);
    setCategory(doc.category);
    setContent(doc.content);
    setActive(doc.active);
    setIsCreating(true);
  };

  const openCreateModal = () => {
    setEditingPolicy(null);
    setTitle('');
    setCategory('Pós-Venda');
    setContent('');
    setActive(true);
    setIsCreating(true);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingPolicy(null);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Documentos e Políticas Oficiais</h3>
          <p className="text-xs text-slate-400">
            Estes textos são injetados diretamente na instrução de sistema do Gemini como Fonte da Verdade.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Nova Política</span>
        </button>
      </div>

      {/* Grid de Políticas Cadastradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policies.map((doc) => (
          <div
            key={doc.id}
            className={`bg-slate-950 border rounded-2xl p-5 space-y-3 hover:border-slate-700 transition ${
              doc.active ? 'border-slate-800' : 'border-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                {doc.title}
              </span>
              <button
                onClick={() => handleToggleActive(doc.id)}
                className="text-xs font-semibold transition flex items-center gap-1"
              >
                {doc.active ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Ativo
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-500">
                    Inativo
                  </span>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 max-h-36 overflow-y-auto">
              "{doc.content.replace(/\{\{NOME_DA_EMPRESA\}\}/g, companyName)}"
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-500">
              <span>{doc.category} • ~{doc.content.split(/\s+/).length} tokens</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(doc)}
                  className="text-slate-400 hover:text-white transition flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="text-slate-500 hover:text-rose-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>{editingPolicy ? 'Editar Documento RAG' : 'Novo Documento de Política'}</span>
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Título do Documento</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Política de Garantia Estendida"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Categoria</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Pós-Venda / Logística / Financeiro"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Conteúdo Oficial (Fonte da Verdade)</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Descreva as regras comerciais sem margem para duplas interpretações..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3.5 text-xs text-white font-mono leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md shadow-indigo-600/30"
                >
                  Salvar Política
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
