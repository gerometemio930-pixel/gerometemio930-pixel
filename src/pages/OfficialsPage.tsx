import { useState, useEffect } from 'react';
import { Users, Building2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Official } from '@/types';
import { LoadingSpinner, ErrorMessage, EmptyState, PageHeader } from '@/components/ui';

function getInitials(name: string): string {
  const parts = name.replace(/Hon\.|Capt\.|SK Chair\./gi, '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0]?.substring(0, 2).toUpperCase() || '?';
}

function getRoleColor(position: string): string {
  if (position.includes('Punong')) return 'from-primary-600 to-primary-800';
  if (position.includes('Kagawad')) return 'from-accent-500 to-accent-700';
  if (position.includes('SK')) return 'from-secondary-500 to-secondary-700';
  return 'from-neutral-500 to-neutral-700';
}

export default function OfficialsPage() {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from('officials').select('*').order('display_order');
        if (error) throw error;
        setOfficials(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load officials');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Loading officials..." />;
  if (error) return <ErrorMessage message={error} />;

  const punongBarangay = officials.find((o) => o.position.includes('Punong'));
  const kagawads = officials.filter((o) => o.position === 'Kagawad');
  const appointed = officials.filter((o) => !o.position.includes('Punong') && o.position !== 'Kagawad');

  return (
    <div className="animate-fade-in">
      <PageHeader title="Barangay Officials" subtitle="Meet the elected and appointed officials of Barangay Lumangbayan, serving the community with dedication and integrity." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {officials.length === 0 ? (
          <EmptyState icon={Users} title="No officials to display" message="Official information will be available soon." />
        ) : (
          <div className="space-y-12 lg:space-y-16">
            {punongBarangay && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary-600 mb-6">Punong Barangay</h2>
                <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-3xl overflow-hidden shadow-xl">
                  <div className="grid md:grid-cols-3 gap-0">
                    <div className="p-8 lg:p-10 flex flex-col items-center justify-center text-center md:border-r border-white/10">
                      <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center text-white text-3xl font-bold border-4 border-white/20">
                        {getInitials(punongBarangay.name)}
                      </div>
                      <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-500/20 text-secondary-200 text-xs font-medium">
                        <Building2 className="w-3.5 h-3.5" /> Presiding Officer
                      </div>
                    </div>
                    <div className="md:col-span-2 p-8 lg:p-10 text-white">
                      <div className="text-secondary-300 text-sm font-medium">{punongBarangay.position}</div>
                      <h3 className="text-2xl lg:text-3xl font-bold mt-1">{punongBarangay.name}</h3>
                      {punongBarangay.committee && <p className="mt-3 text-primary-100 leading-relaxed">{punongBarangay.committee}</p>}
                      {punongBarangay.term && (
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-sm">
                          <span className="text-primary-200">Term:</span>
                          <span className="font-semibold text-white">{punongBarangay.term}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {kagawads.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary-600 mb-6">Sangguniang Barangay (Kagawads)</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {kagawads.map((off) => (
                    <div key={off.id} className="bg-white rounded-2xl p-6 text-center shadow-md shadow-neutral-900/5 border border-neutral-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getRoleColor(off.position)} flex items-center justify-center text-white text-lg font-bold mx-auto mb-4`}>
                        {getInitials(off.name)}
                      </div>
                      <h3 className="font-semibold text-neutral-900 text-sm leading-snug">{off.name}</h3>
                      <p className="text-xs text-primary-600 font-medium mt-1">{off.position}</p>
                      {off.committee && <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{off.committee}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {appointed.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-secondary-600 mb-6">Appointed Officials & Staff</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {appointed.map((off) => (
                    <div key={off.id} className="bg-white rounded-2xl p-5 shadow-md shadow-neutral-900/5 border border-neutral-100 hover:shadow-lg transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getRoleColor(off.position)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                          {getInitials(off.name)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-neutral-900 text-sm leading-snug">{off.name}</h3>
                          <p className="text-xs text-primary-600 font-medium mt-0.5">{off.position}</p>
                          {off.committee && <p className="text-xs text-neutral-400 mt-1 truncate">{off.committee}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-neutral-50 rounded-2xl p-6 lg:p-8 text-center border border-neutral-100">
              <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl mx-auto">
                All elected officials serve a term of three (3) years as mandated by the Local Government Code of the Philippines (RA 7160).{punongBarangay?.term ? ` Current term: ${punongBarangay.term}.` : ''}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
