import { useState, useEffect } from 'react';
import {
  FileText, HeartHandshake, CreditCard, Store, ShieldAlert, Home, Users, Baby,
  Clock, Tag, ClipboardList, ArrowRight, LogIn,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Service, PageId } from '@/types';
import { LoadingSpinner, ErrorMessage, EmptyState, PageHeader } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

const ICON_MAP: Record<string, React.ElementType> = {
  FileText, HeartHandshake, CreditCard, Store, ShieldAlert, Home, Users, Baby,
};

interface ServicesPageProps {
  onNavigate: (page: PageId) => void;
}

export default function ServicesPage({ onNavigate }: ServicesPageProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase.from('services').select('*');
        if (error) throw error;
        setServices(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingSpinner message="Loading services..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Barangay Services" subtitle="View the services we offer, including requirements, fees, and processing times. Log in as a resident to request a service online." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {services.length === 0 ? (
          <EmptyState icon={FileText} title="No services available" message="Please check back later." />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => {
              const Icon = ICON_MAP[svc.icon] || FileText;
              const isExpanded = expandedId === svc.id;
              return (
                <div key={svc.id} className="bg-white rounded-2xl border border-neutral-100 shadow-md shadow-neutral-900/5 hover:shadow-lg transition-all duration-200 flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary-700" />
                    </div>
                    <h2 className="font-semibold text-neutral-900">{svc.name}</h2>
                    <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{svc.description}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-neutral-600">{svc.processing_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                        <span className="text-neutral-600 font-medium">{svc.fee}</span>
                      </div>
                    </div>
                    <button onClick={() => setExpandedId(isExpanded ? null : svc.id)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                      <ClipboardList className="w-4 h-4" />
                      {isExpanded ? 'Hide requirements' : 'View requirements'}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 p-4 bg-neutral-50 rounded-xl animate-slide-down">
                        <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Requirements</p>
                        <p className="text-sm text-neutral-600 leading-relaxed">{svc.requirements}</p>
                      </div>
                    )}
                  </div>
                  <div className="p-6 pt-0">
                    {user ? (
                      <button
                        onClick={() => { onNavigate('service-request'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-50 hover:bg-primary-100 text-primary-700 font-semibold text-sm transition-all duration-200"
                      >
                        Request This Service <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => { onNavigate('login'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-600 font-semibold text-sm transition-all duration-200"
                      >
                        <LogIn className="w-4 h-4" /> Sign in to request
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
