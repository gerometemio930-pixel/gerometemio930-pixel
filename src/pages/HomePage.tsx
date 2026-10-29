import { useState, useEffect } from 'react';
import {
  Building2,
  Megaphone,
  FileText,
  Users,
  ArrowRight,
  MapPin,
  Clock,
  ShieldAlert,
  HeartHandshake,
  Calendar,
  Pin,
  Sparkles,
  CreditCard,
  Store,
  Home,
  Baby,
  LogIn,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Announcement, Service, Official, PageId } from '@/types';
import { LoadingSpinner, ErrorMessage, SectionTitle, EmptyState } from '@/components/ui';
import { formatRelativeTime, CATEGORY_COLORS } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
}

const SERVICE_ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  HeartHandshake,
  CreditCard,
  Store,
  ShieldAlert,
  Home,
  Users,
  Baby,
};

export default function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [annRes, svcRes, offRes] = await Promise.all([
          supabase
            .from('announcements')
            .select('*')
            .order('is_pinned', { ascending: false })
            .order('published_at', { ascending: false })
            .limit(4),
          supabase.from('services').select('*').limit(6),
          supabase.from('officials').select('*').order('display_order').limit(4),
        ]);

        if (annRes.error) throw annRes.error;
        if (svcRes.error) throw svcRes.error;
        if (offRes.error) throw offRes.error;

        setAnnouncements(annRes.data || []);
        setServices(svcRes.data || []);
        setOfficials(offRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading portal..." />;
  if (error) return <ErrorMessage message={error} />;

  const scrollTo = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-primary-900">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 text-secondary-300" />
                <span>Welcome to our community portal</span>
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.1] text-balance">
                Barangay Lumangbayan
              </h1>
              <p className="mt-5 text-lg lg:text-xl text-primary-100 leading-relaxed max-w-xl">
                Your gateway to community services, announcements, and resources. Connect with
                your barangay online — anytime, anywhere.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {!user && (
                  <button
                    onClick={() => scrollTo('signup')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-secondary-500 hover:bg-secondary-400 text-white font-semibold shadow-lg shadow-secondary-900/20 transition-all duration-200 hover:scale-[1.02]"
                  >
                    <LogIn className="w-5 h-5" />
                    Register as Resident
                  </button>
                )}
                <button
                  onClick={() => scrollTo('announcements')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold border border-white/20 transition-all duration-200"
                >
                  View Announcements
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-12 grid grid-cols-3 gap-4 max-w-md">
                {[
                  { label: 'Residents', value: '4,200+' },
                  { label: 'Households', value: '950+' },
                  { label: 'Puroks', value: '7' },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-primary-200 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block animate-fade-in-up">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/36125254/pexels-photo-36125254.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Filipino community"
                  className="w-full h-[480px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-primary-700" />
                      </div>
                      <div>
                        <div className="font-semibold text-neutral-900 text-sm">
                          Lumangbayan, Calapan City
                        </div>
                        <div className="text-xs text-neutral-500">Oriental Mindoro, Philippines</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Megaphone, label: 'Announcements', desc: 'Latest news', page: 'announcements' as PageId, color: 'bg-primary-600' },
            { icon: FileText, label: 'Services', desc: 'Barangay services', page: 'services' as PageId, color: 'bg-accent-600' },
            { icon: Users, label: 'Officials', desc: 'Meet your leaders', page: 'officials' as PageId, color: 'bg-secondary-600' },
            { icon: ShieldAlert, label: 'File Blotter', desc: 'Report an incident', page: 'blotter' as PageId, color: 'bg-error-600' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => scrollTo(item.page)}
              className="group bg-white rounded-2xl p-5 lg:p-6 shadow-lg shadow-neutral-900/5 border border-neutral-100 text-left hover:shadow-xl hover:border-neutral-200 transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className={`w-11 h-11 rounded-xl ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="font-semibold text-neutral-900 text-sm lg:text-base">{item.label}</div>
              <div className="text-xs lg:text-sm text-neutral-500 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Announcements preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <SectionTitle
          eyebrow="Stay Updated"
          title="Latest Announcements"
          subtitle="Important news, events, and advisories from the Barangay Lumangbayan council."
        />
        {announcements.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements yet" message="Check back soon for updates." />
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {announcements.map((ann) => (
              <button
                key={ann.id}
                onClick={() => scrollTo('announcements')}
                className="group text-left bg-white rounded-2xl p-6 shadow-md shadow-neutral-900/5 border border-neutral-100 hover:shadow-lg hover:border-primary-200 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${CATEGORY_COLORS[ann.category] || CATEGORY_COLORS['General']}`}>
                      {ann.category}
                    </span>
                    {ann.is_pinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-secondary-100 text-secondary-700">
                        <Pin className="w-3 h-3" /> Pinned
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 whitespace-nowrap">{formatRelativeTime(ann.published_at)}</span>
                </div>
                <h3 className="font-semibold text-neutral-900 text-lg leading-snug group-hover:text-primary-700 transition-colors">
                  {ann.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-500 leading-relaxed line-clamp-2">{ann.content}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Services preview */}
      <section className="bg-neutral-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle eyebrow="Barangay Services" title="What We Offer" subtitle="From barangay clearance to certificates — view our services, requirements, and fees." center />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((svc) => {
              const Icon = SERVICE_ICON_MAP[svc.icon] || FileText;
              return (
                <div key={svc.id} className="bg-white rounded-2xl p-6 shadow-md shadow-neutral-900/5 border border-neutral-100 hover:shadow-lg transition-all duration-200">
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-700" />
                  </div>
                  <h3 className="font-semibold text-neutral-900">{svc.name}</h3>
                  <p className="mt-2 text-sm text-neutral-500 leading-relaxed line-clamp-2">{svc.description}</p>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {svc.processing_time}
                    </span>
                    <span className="font-semibold text-primary-700">{svc.fee}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => scrollTo('services')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-md transition-all duration-200">
              View All Services <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Officials preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <SectionTitle eyebrow="Your Leaders" title="Barangay Officials" subtitle="The elected and appointed officials serving Barangay Lumangbayan." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {officials.map((off) => (
            <div key={off.id} className="bg-white rounded-2xl p-6 text-center shadow-md shadow-neutral-900/5 border border-neutral-100 hover:shadow-lg transition-all duration-200">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                {off.name.replace(/Hon\.|Capt\.|SK Chair\./g, '').trim().charAt(0)}
              </div>
              <h3 className="font-semibold text-neutral-900 text-sm leading-snug">{off.name}</h3>
              <p className="text-xs text-primary-600 font-medium mt-1">{off.position}</p>
              {off.committee && <p className="text-xs text-neutral-400 mt-1">{off.committee}</p>}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button onClick={() => scrollTo('officials')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-neutral-200 hover:border-primary-300 text-neutral-700 hover:text-primary-700 font-semibold shadow-sm transition-all duration-200">
            Meet All Officials <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 to-primary-900 px-6 py-12 lg:px-16 lg:py-16 text-center">
          <div className="relative">
            <Calendar className="w-10 h-10 text-secondary-300 mx-auto mb-4" />
            <h2 className="text-2xl lg:text-3xl font-bold text-white">
              {user ? 'Need to Request a Document?' : 'Register to Access Online Services'}
            </h2>
            <p className="mt-3 text-primary-100 max-w-xl mx-auto leading-relaxed">
              {user
                ? 'Submit your service request online. Get a reference number and track your request status anytime.'
                : 'Create a resident account to submit service requests, file blotter reports, and track your requests online.'}
            </p>
            <button
              onClick={() => scrollTo(user ? 'service-request' : 'signup')}
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-secondary-500 hover:bg-secondary-400 text-white font-semibold shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              {user ? 'Start a Request' : 'Register Now'} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
