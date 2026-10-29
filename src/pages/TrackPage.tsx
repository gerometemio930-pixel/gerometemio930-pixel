import { useState, useEffect } from 'react';
import { FileText, ShieldAlert, Search, LogIn, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner, ErrorMessage, EmptyState, PageHeader, Badge } from '@/components/ui';
import { formatDate, REQUEST_STATUS_COLORS, BLOTTER_STATUS_COLORS } from '@/lib/utils';
import type { ServiceRequest, BlotterReport, PageId } from '@/types';

interface TrackPageProps {
  onNavigate: (page: PageId) => void;
}

export default function TrackPage({ onNavigate }: TrackPageProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [reports, setReports] = useState<BlotterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'requests' | 'blotter'>('requests');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [reqRes, bltRes] = await Promise.all([
          supabase.from('service_requests').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('blotter_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        ]);
        if (reqRes.error) throw reqRes.error;
        if (bltRes.error) throw bltRes.error;
        setRequests(reqRes.data || []);
        setReports(bltRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your requests');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (!user) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Track Your Requests" />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Sign In Required</h2>
          <p className="text-sm text-neutral-500 mb-6">Please sign in to view and track your service requests and blotter reports.</p>
          <button onClick={() => onNavigate('login')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading your requests..." />;
  if (error) return <ErrorMessage message={error} />;

  const filteredRequests = requests.filter((r) =>
    search ? r.reference_number.toLowerCase().includes(search.toLowerCase()) || r.service_type.toLowerCase().includes(search.toLowerCase()) : true
  );
  const filteredReports = reports.filter((r) =>
    search ? r.reference_number.toLowerCase().includes(search.toLowerCase()) || r.incident_type.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="animate-fade-in">
      <PageHeader title="Track Your Requests" subtitle="View the status of your service requests and blotter reports." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('requests')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              tab === 'requests' ? 'bg-primary-600 text-white shadow-md' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary-300'
            }`}
          >
            <FileText className="w-4 h-4" /> Service Requests ({requests.length})
          </button>
          <button
            onClick={() => setTab('blotter')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              tab === 'blotter' ? 'bg-primary-600 text-white shadow-md' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Blotter Reports ({reports.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference number or type..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
          />
        </div>

        {/* Service requests */}
        {tab === 'requests' && (
          filteredRequests.length === 0 ? (
            <EmptyState icon={FileText} title="No service requests yet" message="Submit a service request to see it here." />
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-neutral-900">{req.service_type}</h3>
                      <div className="text-xs text-neutral-400 font-mono mt-1">{req.reference_number}</div>
                    </div>
                    <Badge color={REQUEST_STATUS_COLORS[req.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}>
                      {req.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{req.details}</p>
                  {req.admin_notes && (
                    <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-sm text-neutral-600">
                      <span className="font-medium text-neutral-700">Admin notes: </span>{req.admin_notes}
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center gap-4 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(req.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Blotter reports */}
        {tab === 'blotter' && (
          filteredReports.length === 0 ? (
            <EmptyState icon={ShieldAlert} title="No blotter reports yet" message="File a blotter report to see it here." />
          ) : (
            <div className="space-y-4">
              {filteredReports.map((rpt) => (
                <div key={rpt.id} className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-neutral-900">{rpt.incident_type}</h3>
                      <div className="text-xs text-neutral-400 font-mono mt-1">{rpt.reference_number}</div>
                    </div>
                    <Badge color={BLOTTER_STATUS_COLORS[rpt.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}>
                      {rpt.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-500 mt-2 line-clamp-2">{rpt.description}</p>
                  {rpt.admin_notes && (
                    <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-sm text-neutral-600">
                      <span className="font-medium text-neutral-700">Admin notes: </span>{rpt.admin_notes}
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-4 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Incident: {formatDate(rpt.incident_date)}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Filed: {formatDate(rpt.created_at)}</span>
                    <span>Location: {rpt.incident_location}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
