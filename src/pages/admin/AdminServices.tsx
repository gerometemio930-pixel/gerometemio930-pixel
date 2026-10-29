import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Edit2, Trash2, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, ErrorMessage, EmptyState, Button, Input, TextArea, Select } from '@/components/ui';
import type { Service } from '@/types';

const ICON_OPTIONS = ['FileText', 'HeartHandshake', 'CreditCard', 'Store', 'ShieldAlert', 'Home', 'Users', 'Baby'];

interface FormData {
  name: string;
  description: string;
  requirements: string;
  fee: string;
  processing_time: string;
  icon: string;
}

const emptyForm: FormData = { name: '', description: '', requirements: '', fee: 'Free', processing_time: '', icon: 'FileText' };

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('services').select('*').order('name');
      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load services');
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
      const payload = { name: form.name, description: form.description, requirements: form.requirements, fee: form.fee, processing_time: form.processing_time, icon: form.icon };
      if (editingId) {
        const { error } = await supabase.from('services').update(payload).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('services').insert(payload);
        if (error) throw error;
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save service');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (svc: Service) => {
    setEditingId(svc.id);
    setForm({ name: svc.name, description: svc.description, requirements: svc.requirements, fee: svc.fee, processing_time: svc.processing_time, icon: svc.icon });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
    }
  };

  const handleCancel = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  if (loading) return <LoadingSpinner message="Loading services..." />;
  if (error && !showForm) return <ErrorMessage message={error} />;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Manage Services</h1>
          <p className="text-sm text-neutral-500 mt-1">Add, edit, and delete barangay services.</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-md space-y-5 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-900">{editingId ? 'Edit Service' : 'Add Service'}</h2>
            <button type="button" onClick={handleCancel} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"><X className="w-5 h-5 text-neutral-500" /></button>
          </div>
          {error && <div className="bg-error-50 border border-error-100 rounded-xl px-4 py-3 text-sm text-error-700">{error}</div>}
          <Input label="Service Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Barangay Clearance" required />
          <TextArea label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="What does this service provide?" required rows={3} />
          <TextArea label="Requirements" value={form.requirements} onChange={(v) => setForm({ ...form, requirements: v })} placeholder="What documents/items are needed?" required rows={3} />
          <div className="grid sm:grid-cols-3 gap-5">
            <Input label="Fee" value={form.fee} onChange={(v) => setForm({ ...form, fee: v })} placeholder="₱50.00 or Free" required />
            <Input label="Processing Time" value={form.processing_time} onChange={(v) => setForm({ ...form, processing_time: v })} placeholder="1-2 hours" required />
            <Select label="Icon" value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} options={ICON_OPTIONS.map((i) => ({ value: i, label: i }))} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Add Service'}</Button>
            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        </form>
      )}

      {!showForm && (
        services.length === 0 ? (
          <EmptyState icon={FileText} title="No services" message="Add your first barangay service." />
        ) : (
          <div className="space-y-3">
            {services.map((svc) => (
              <div key={svc.id} className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-md flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-900">{svc.name}</h3>
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-1">{svc.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-400">
                    <span>Fee: <span className="font-medium text-primary-700">{svc.fee}</span></span>
                    <span>Time: {svc.processing_time}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleEdit(svc)} className="p-2 rounded-lg bg-neutral-50 hover:bg-accent-50 text-neutral-500 hover:text-accent-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(svc.id)} className="p-2 rounded-lg bg-neutral-50 hover:bg-error-50 text-neutral-500 hover:text-error-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
