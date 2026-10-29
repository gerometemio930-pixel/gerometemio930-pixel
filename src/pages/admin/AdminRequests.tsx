import { useState, useEffect, useCallback } from 'react';
import { FileText, Search, X, ChevronDown, ChevronRight, Phone, MapPin, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, ErrorMessage, EmptyState, Badge, TextArea, Button } from '@/components/ui';
import { formatDate, REQUEST_STATUS_COLORS, REQUEST_STATUSES } from '@/lib/utils';
import type { ServiceRequest } from '@/types';

export default function AdminRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [filtered, setFiltered] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setRequests(data || []);
      setFiltered(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    let result = requests;
    if (statusFilter !== 'All') result = result.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.reference_number.toLowerCase().includes(q) || r.full_name.toLowerCase().includes(q) || r.service_type.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [requests, statusFilter, search]);

  const updateStatus = async (id: string, status: string) => {
    setSaving(id);
    try {
      const { error } = await supabase.from('service_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(null);
    }
  };

  const saveNotes = async (id: string) => {
    setSaving(id);
    try {
      const { error } = await supabase.from('service_requests').update({ admin_notes: notes[id] || null, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      await loadData();
      setExpandedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading requests..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Service Requests</h1>
        <p className="text-sm text-neutral-500 mt-1">Review and update the status of resident service requests.</p>
      </div>

      {error && <div className="bg-error-50 border border-error-100 rounded-xl px-4 py-3 text-sm text-error-700 mb-6">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, type, or reference..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all">
          <option value="All">All Statuses</option>
          {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No service requests" message="Requests from residents will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const isExpanded = expandedId === req.id;
            return (
              <div key={req.id} className="bg-white rounded-2xl border border-neutral-100 shadow-md overflow-hidden">
                <button onClick={() => { setExpandedId(isExpanded ? null : req.id); setNotes({ ...notes, [req.id]: req.admin_notes || '' }); }} className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-neutral-900">{req.service_type}</h3>
                      <Badge color={REQUEST_STATUS_COLORS[req.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}>{req.status}</Badge>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">{req.reference_number}</div>
                    <div className="text-sm text-neutral-500 mt-1">{req.full_name} · {formatDate(req.created_at)}</div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-neutral-50 pt-4 animate-slide-down">
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-neutral-600"><Phone className="w-4 h-4 text-neutral-400" /> {req.phone}</div>
                      <div className="flex items-center gap-2 text-neutral-600"><MapPin className="w-4 h-4 text-neutral-400" /> {req.address}</div>
                      {req.email && <div className="text-neutral-600">Email: {req.email}</div>}
                      <div className="flex items-center gap-2 text-neutral-600"><Calendar className="w-4 h-4 text-neutral-400" /> Submitted: {formatDate(req.created_at)}</div>
                    </div>
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Details</div>
                      <p className="text-sm text-neutral-600 leading-relaxed">{req.details}</p>
                    </div>
                    {req.admin_notes && (
                      <div className="bg-accent-50 rounded-xl p-4">
                        <div className="text-xs font-semibold text-accent-700 uppercase tracking-wide mb-1">Admin Notes</div>
                        <p className="text-sm text-accent-800 leading-relaxed">{req.admin_notes}</p>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Update Status</label>
                        <select
                          value={req.status}
                          onChange={(e) => updateStatus(req.id, e.target.value)}
                          disabled={saving === req.id}
                          className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all disabled:opacity-50"
                        >
                          {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Add Notes</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={notes[req.id] || ''}
                            onChange={(e) => setNotes({ ...notes, [req.id]: e.target.value })}
                            placeholder="Internal notes..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
                          />
                          <Button size="sm" onClick={() => saveNotes(req.id)} disabled={saving === req.id}>Save</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
