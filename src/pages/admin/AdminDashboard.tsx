import { useState, useEffect } from 'react';
import { FileText, ShieldAlert, Megaphone, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LoadingSpinner, ErrorMessage } from '@/components/ui';
import { formatDate, REQUEST_STATUS_COLORS, BLOTTER_STATUS_COLORS } from '@/lib/utils';
import type { ServiceRequest, BlotterReport, PageId } from '@/types';

interface AdminDashboardProps {
  onNavigate: (page: PageId) => void;
}

interface Stats {
  totalRequests: number;
  pendingRequests: number;
  totalBlotter: number;
  filedBlotter: number;
  totalAnnouncements: number;
  totalOfficials: number;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([]);
  const [recentBlotter, setRecentBlotter] = useState<BlotterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [reqRes, bltRes, annRes, offRes] = await Promise.all([
          supabase.from('service_requests').select('*').order('created_at', { ascending: false }),
          supabase.from('blotter_reports').select('*').order('created_at', { ascending: false }),
          supabase.from('announcements').select('id', { count: 'exact', head: true }),
          supabase.from('officials').select('id', { count: 'exact', head: true }),
        ]);

        if (reqRes.error) throw reqRes.error;
        if (bltRes.error) throw bltRes.error;

        const requests = reqRes.data || [];
        const blotter = bltRes.data || [];

        setStats({
          totalRequests: requests.length,
          pendingRequests: requests.filter((r) => r.status === 'Pending').length,
          totalBlotter: blotter.length,
          filedBlotter: blotter.filter((r) => r.status === 'Filed').length,
          totalAnnouncements: annRes.count || 0,
          totalOfficials: offRes.count || 0,
        });
        setRecentRequests(requests.slice(0, 5));
        setRecentBlotter(blotter.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} />;

  const cards = [
    { icon: FileText, label: 'Service Requests', value: stats?.totalRequests || 0, sub: `${stats?.pendingRequests || 0} pending`, page: 'admin-requests' as PageId, color: 'bg-primary-600' },
    { icon: ShieldAlert, label: 'Blotter Reports', value: stats?.totalBlotter || 0, sub: `${stats?.filedBlotter || 0} filed`, page: 'admin-blotter' as PageId, color: 'bg-error-600' },
    { icon: Megaphone, label: 'Announcements', value: stats?.totalAnnouncements || 0, sub: 'Published', page: 'admin-announcements' as PageId, color: 'bg-accent-600' },
    { icon: Users, label: 'Officials', value: stats?.totalOfficials || 0, sub: 'Listed', page: 'admin-officials' as PageId, color: 'bg-secondary-600' },
  ];

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Admin Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Overview of barangay operations and recent activity.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <button
            key={card.label}
            onClick={() => onNavigate(card.page)}
            className="group bg-white rounded-2xl p-6 border border-neutral-100 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left"
          >
            <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-3xl font-bold text-neutral-900">{card.value}</div>
            <div className="text-sm text-neutral-500 mt-1">{card.label}</div>
            <div className="text-xs text-neutral-400 mt-0.5">{card.sub}</div>
          </button>
        ))}
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent service requests */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" /> Recent Service Requests
            </h2>
            <button onClick={() => onNavigate('admin-requests')} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {recentRequests.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">No requests yet.</p>
          ) : (
            <div className="space-y-3">
              {recentRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between gap-3 py-2 border-b border-neutral-50 last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-700 truncate">{req.service_type}</div>
                    <div className="text-xs text-neutral-400 truncate">{req.full_name} · {formatDate(req.created_at)}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${REQUEST_STATUS_COLORS[req.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                    {req.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent blotter reports */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-neutral-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-error-600" /> Recent Blotter Reports
            </h2>
            <button onClick={() => onNavigate('admin-blotter')} className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {recentBlotter.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">No reports yet.</p>
          ) : (
            <div className="space-y-3">
              {recentBlotter.map((rpt) => (
                <div key={rpt.id} className="flex items-center justify-between gap-3 py-2 border-b border-neutral-50 last:border-0">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-neutral-700 truncate">{rpt.incident_type}</div>
                    <div className="text-xs text-neutral-400 truncate">{rpt.complainant_name} · {formatDate(rpt.created_at)}</div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${BLOTTER_STATUS_COLORS[rpt.status] || 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                    {rpt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
