import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Edit2, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, ErrorMessage, EmptyState, Button, Input, TextArea } from '@/components/ui';
import type { Official } from '@/types';

interface FormData {
  name: string;
  position: string;
  committee: string;
  term: string;
  display_order: number;
}

const emptyForm: FormData = { name: '', position: '', committee: '', term: '2023–2026', display_order: 0 };

export default function AdminOfficials() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('officials').select('*').order('display_order');
      if (error) throw error;
      setOfficials(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load officials');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = { name: form.name, position: form.position, committee: form.committee || null, term: form.term || null, display_order: form.display_order };
      if (editingId) {
        const { error } = await supabase.from('officials').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('officials').insert(payload);
        if (error) throw error;
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save official');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (off: Official) => {
    setEditingId(off.id);
    setForm({ name: off.name, position: off.position, committee: off.committee || '', term: off.term || '', display_order: off.display_order });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this official?')) return;
    try {
      const { error } = await supabase.from('officials').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete official');
    }
  };

  const handleReorder = async (off: Official, direction: 'up' | 'down') => {
    const sorted = [...officials].sort((a, b) => a.display_order - b.display_order);
    const index = sorted.findIndex((o) => o.id === off.id);
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;
    const swapOff = sorted[swapIndex];
    try {
      await Promise.all([
        supabase.from('officials').update({ display_order: swapOff.display_order }).eq('id', off.id),
        supabase.from('officials').update({ display_order: off.display_order }).eq('id', swapOff.id),
      ]);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder');
    }
  };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  if (loading) return <LoadingSpinner message="Loading officials..." />;
  if (error && !showForm) return <ErrorMessage message={error} />;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Manage Officials</h1>
          <p className="text-sm text-neutral-500 mt-1">Add, edit, and reorder barangay officials.</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setForm({ ...emptyForm, display_order: officials.length + 1 }); setEditingId(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Add Official
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-md space-y-5 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-900">{editingId ? 'Edit Official' : 'Add Official'}</h2>
            <button type="button" onClick={handleCancel} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"><X className="w-5 h-5 text-neutral-500" /></button>
          </div>
          {error && <div className="bg-error-50 border border-error-100 rounded-xl px-4 py-3 text-sm text-error-700">{error}</div>}
          <div className="grid sm:grid-cols-2 gap-5">
            <Input label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Hon. Juan Dela Cruz" required />
            <Input label="Position" value={form.position} onChange={(v) => setForm({ ...form, position: v })} placeholder="Punong Barangay" required />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Input label="Committee / Area" value={form.committee} onChange={(v) => setForm({ ...form, committee: v })} placeholder="Health & Sanitation" />
            <Input label="Term" value={form.term} onChange={(v) => setForm({ ...form, term: v })} placeholder="2023–2026" />
          </div>
          <Input label="Display Order" type="number" value={String(form.display_order)} onChange={(v) => setForm({ ...form, display_order: parseInt(v) || 0 })} placeholder="1" required />
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Add Official'}</Button>
            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        </form>
      )}

      {!showForm && (
        officials.length === 0 ? (
          <EmptyState icon={Users} title="No officials" message="Add your first barangay official." />
        ) : (
          <div className="space-y-3">
            {officials.map((off, idx) => (
              <div key={off.id} className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-md flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-900">{off.name}</h3>
                  <p className="text-sm text-primary-600 font-medium">{off.position}</p>
                  {off.committee && <p className="text-xs text-neutral-400 mt-1">{off.committee}</p>}
                  {off.term && <p className="text-xs text-neutral-400">Term: {off.term}</p>}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => handleReorder(off, 'up')} disabled={idx === 0} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors disabled:opacity-30"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => handleReorder(off, 'down')} disabled={idx === officials.length - 1} className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors disabled:opacity-30"><ArrowDown className="w-4 h-4" /></button>
                  <button onClick={() => handleEdit(off)} className="p-2 rounded-lg bg-neutral-50 hover:bg-accent-50 text-neutral-500 hover:text-accent-600 transition-colors ml-1"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(off.id)} className="p-2 rounded-lg bg-neutral-50 hover:bg-error-50 text-neutral-500 hover:text-error-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
