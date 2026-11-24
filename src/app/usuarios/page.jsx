"use client";

import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Edit3, Trash2, X, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/UI/Toast';

export default function UsuariosPage() {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'TATUADOR',
    especialidade: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar equipe:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  function openNew() {
    setEditingId(null);
    setForm({ nome: '', email: '', senha: '', role: 'TATUADOR', especialidade: '' });
    setModalOpen(true);
  }

  function openEdit(u) {
    setEditingId(u.id);
    setForm({
      nome: u.nome || '',
      email: u.email || '',
      senha: '',
      role: u.role || 'TATUADOR',
      especialidade: u.especialidade || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        toast('Integrante atualizado!', 'success');
      } else {
        await api.post('/users', form);
        toast('Integrante adicionado à equipe!', 'success');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao salvar integrante.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(u) {
    if (!confirm(`Remover ${u.nome} da equipe?`)) return;
    try {
      await api.delete(`/users/${u.id}`);
      toast('Integrante removido.', 'success');
      fetchUsers();
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao remover integrante.', 'error');
    }
  }

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="card-apple py-12 text-center text-xs text-text-muted">
          Apenas administradores podem gerenciar a equipe do estúdio.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-gothic text-3xl text-white flex items-center gap-2.5 leading-none">
            <Shield size={20} className="text-apple-blue" />
            <span>Equipe & Tatuadores</span>
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Gerencie tatuadores, especialidades e acessos ao CRM do estúdio
          </p>
        </div>

        <button onClick={openNew} className="btn-primary h-9 px-4 text-xs font-semibold">
          <Plus size={15} />
          <span>Novo Integrante</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full card-apple py-12 text-center text-xs text-text-muted">
            Carregando equipe...
          </div>
        ) : (
          users.map((u) => (
            <div key={u.id} className="card-apple flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-apple-blue to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {u.nome?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{u.nome}</h3>
                    <p className="text-[11px] text-text-muted">{u.email}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-apple-blue/15 text-apple-blue border border-apple-blue/30">
                  {u.role}
                </span>
              </div>

              <div className="text-xs text-text-secondary flex items-center justify-between pt-3 border-t border-border-subtle">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-ios-amber" />
                  {u.especialidade || 'Estilo livre'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(u)}
                    className="p-1.5 text-text-muted hover:text-apple-blue rounded-md hover:bg-[#1C1728]"
                  >
                    <Edit3 size={14} />
                  </button>
                  {u.id !== user?.id && (
                    <button
                      onClick={() => handleDelete(u)}
                      className="p-1.5 text-text-muted hover:text-ios-red rounded-md hover:bg-[#1C1728]"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={() => setModalOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl w-full max-w-md shadow-modal p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h2 className="text-base font-bold text-white">
                {editingId ? 'Editar Integrante' : 'Novo Integrante'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">Nome *</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">E-mail *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary block mb-1">
                  {editingId ? 'Nova Senha (deixe vazio para manter)' : 'Senha *'}
                </label>
                <input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  className="input"
                  required={!editingId}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">Perfil</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="select"
                  >
                    <option value="ADMIN">Administrador</option>
                    <option value="TATUADOR">Tatuador(a)</option>
                    <option value="RECEPCAO">Recepção</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-secondary block mb-1">
                    Especialidade
                  </label>
                  <input
                    type="text"
                    value={form.especialidade}
                    onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
                    placeholder="Ex: Fine Line"
                    className="input"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary h-9">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="btn-primary h-9">
                  {submitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
