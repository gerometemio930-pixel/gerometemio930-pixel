import { useState, useEffect, useCallback } from 'react';
import { ShieldAlert, Search, ChevronDown, ChevronRight, Phone, MapPin, Calendar, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, ErrorMessage, EmptyState, Badge, Button } from '@/components/ui';
import { formatDate, BLOTTER_STATUS_COLORS, BLOTTER_STATUSES } from '@/lib/utils';
import type { BlotterReport } from '@/types';

export default function AdminBlotter() {
  const [reports, setReports] = useState<BlotterReport[]>([]);
  const [filtered, setFiltered] = useState<BlotterReport[]>([]);
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
      const { data, error } = await supabase.from('blotter_reports').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setReports(data || []);
      setFiltered(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    let result = reports;
    if (statusFilter !== 'All') result = result.filter((r) => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.reference_number.toLowerCase().includes(q) || r.complainant_name.toLowerCase().includes(q) || r.incident_type.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [reports, statusFilter, search]);

  const updateStatus = async (id: string, status: string) => {
    setSaving(id);
    try {
      const { error } = await supabase.from('blotter_reports').update({ status }).eq('id', id);
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
      const { error } = await supabase.from('blotter_reports').update({ admin_notes: notes[id] || null }).eq('id', id);
      if (error) throw error;
      await loadData();
      setExpandedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading blotter reports..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Blotter Reports</h1>
        <p className="text-sm text-neutral-500 mt-1">Review and manage incident reports filed by residents.</p>
      </div>

      {error && <div className="bg-error-50 border border-error-100 rounded-xl px-4 py-3 text-sm text-error-700 mb-6">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, type, or reference..." className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all">
          <option value="All">All Statuses</option>
          {BLOTTER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ShieldAlert} title="No blotter reports" message="Reports filed by residents will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((rpt) => {
            const isExpanded = expandedId === rpt.id;
            return (
              <div key={rpt.id} className="bg-white rounded-2xl border border-neutral-100 shadow-md overflow-hidden">
                <button onClick={() => { setExpandedId(isExpanded ? null : rpt.id); setNotes({ ...notes, [rpt.id]: rpt.admin_notes || '' }); }} className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-neutral-900">{rpt.incident_type}</h3>
                      <Badge color={BLOTTER_STATUS_COLORS[rpt.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}>{rpt.status}</Badge>
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">{rpt.reference_number}</div>
                    <div className="text-sm text-neutral-500 mt-1">{rpt.complainant_name} · Filed {formatDate(rpt.created_at)}</div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-neutral-400 flex-shrink-0" /> : <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4 border-t border-neutral-50 pt-4 animate-slide-down">
                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-neutral-600"><Phone className="w-4 h-4 text-neutral-400" /> {rpt.complainant_phone}</div>
                      <div className="flex items-center gap-2 text-neutral-600"><MapPin className="w-4 h-4 text-neutral-400" /> {rpt.complainant_address}</div>
                      <div className="flex items-center gap-2 text-neutral-600"><Calendar className="w-4 h-4 text-neutral-400" /> Incident: {formatDate(rpt.incident_date)}</div>
                      <div className="flex items-center gap-2 text-neutral-600"><MapPin className="w-4 h-4 text-neutral-400" /> {rpt.incident_location}</div>
                    </div>
                    {rpt.persons_involved && (
                      <div className="bg-neutral-50 rounded-xl p-4">
                        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Persons Involved</div>
                        <p className="text-sm text-neutral-600">{rpt.persons_involved}</p>
                      </div>
                    )}
                    <div className="bg-neutral-50 rounded-xl p-4">
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">Description</div>
                      <p className="text-sm text-neutral-600 leading-relaxed">{rpt.description}</p>
                    </div>
                    {rpt.admin_notes && (
                      <div className="bg-accent-50 rounded-xl p-4">
                        <div className="text-xs font-semibold text-accent-700 uppercase tracking-wide mb-1">Admin Notes</div>
                        <p className="text-sm text-accent-800 leading-relaxed">{rpt.admin_notes}</p>
                      </div>
                    )}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Update Status</label>
                        <select value={rpt.status} onChange={(e) => updateStatus(rpt.id, e.target.value)} disabled={saving === rpt.id} className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all disabled:opacity-50">
                          {BLOTTER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1.5">Add Notes</label>
                        <div className="flex gap-2">
                          <input type="text" value={notes[rpt.id] || ''} onChange={(e) => setNotes({ ...notes, [rpt.id]: e.target.value })} placeholder="Internal notes..." className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
                          <Button size="sm" onClick={() => saveNotes(rpt.id)} disabled={saving === rpt.id}>Save</Button>
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
