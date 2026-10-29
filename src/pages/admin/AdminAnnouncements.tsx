import { useState, useEffect, useCallback } from 'react';
import { Megaphone, Plus, Edit2, Trash2, Pin, X, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, ErrorMessage, EmptyState, Button, Input, TextArea, Select, Badge } from '@/components/ui';
import { formatDate, formatRelativeTime, CATEGORY_COLORS } from '@/lib/utils';
import type { Announcement } from '@/types';

const CATEGORIES = ['General', 'Health', 'Safety', 'Events', 'Infrastructure'];

interface FormData {
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
}

const emptyForm: FormData = { title: '', content: '', category: 'General', is_pinned: false };

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filtered, setFiltered] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
      setFiltered(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      setFiltered(announcements.filter((a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)));
    } else {
      setFiltered(announcements);
    }
  }, [announcements, search]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const { error } = await supabase
          .from('announcements')
          .update({ title: form.title, content: form.content, category: form.category, is_pinned: form.is_pinned })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert({ title: form.title, content: form.content, category: form.category, is_pinned: form.is_pinned });
        if (error) throw error;
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (ann: Announcement) => {
    setEditingId(ann.id);
    setForm({ title: ann.title, content: ann.content, category: ann.category, is_pinned: ann.is_pinned });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement? This cannot be undone.')) return;
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete announcement');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  if (loading) return <LoadingSpinner message="Loading announcements..." />;
  if (error && !showForm) return <ErrorMessage message={error} />;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Manage Announcements</h1>
          <p className="text-sm text-neutral-500 mt-1">Create, edit, and delete barangay announcements.</p>
        </div>
        {!showForm && (
          <Button onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> New Announcement
          </Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-md space-y-5 mb-8">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-900">{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>
            <button type="button" onClick={handleCancel} className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>
          {error && <div className="bg-error-50 border border-error-100 rounded-xl px-4 py-3 text-sm text-error-700">{error}</div>}
          <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Announcement title" required />
          <TextArea label="Content" value={form.content} onChange={(v) => setForm({ ...form, content: v })} placeholder="Announcement content..." required rows={5} />
          <div className="grid sm:grid-cols-2 gap-5">
            <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Pin to top</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, is_pinned: !form.is_pinned })}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  form.is_pinned ? 'bg-secondary-50 border-secondary-300 text-secondary-700' : 'border-neutral-200 text-neutral-500'
                }`}
              >
                <Pin className="w-4 h-4" /> {form.is_pinned ? 'Pinned' : 'Not pinned'}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Publish'}</Button>
            <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
          </div>
        </form>
      )}

      {!showForm && (
        <>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
          {filtered.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements" message="Create your first announcement to get started." />
          ) : (
            <div className="space-y-4">
              {filtered.map((ann) => (
                <div key={ann.id} className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge color={CATEGORY_COLORS[ann.category] || CATEGORY_COLORS['General']}>{ann.category}</Badge>
                        {ann.is_pinned && <Badge color="bg-secondary-100 text-secondary-700 border-secondary-300/30"><Pin className="w-3 h-3 mr-1" />Pinned</Badge>}
                      </div>
                      <h3 className="font-semibold text-neutral-900">{ann.title}</h3>
                      <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{ann.content}</p>
                      <div className="text-xs text-neutral-400 mt-2">{formatRelativeTime(ann.published_at)}</div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleEdit(ann)} className="p-2 rounded-lg bg-neutral-50 hover:bg-accent-50 text-neutral-500 hover:text-accent-600 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(ann.id)} className="p-2 rounded-lg bg-neutral-50 hover:bg-error-50 text-neutral-500 hover:text-error-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
