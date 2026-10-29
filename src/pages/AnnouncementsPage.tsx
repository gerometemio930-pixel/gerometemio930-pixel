import { useState, useEffect } from 'react';
import { Megaphone, Pin, Search, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Announcement } from '@/types';
import { LoadingSpinner, ErrorMessage, EmptyState, PageHeader } from '@/components/ui';
import { formatDate, formatRelativeTime, CATEGORY_COLORS } from '@/lib/utils';

const CATEGORIES = ['All', 'General', 'Health', 'Safety', 'Events', 'Infrastructure'];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filtered, setFiltered] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
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
    }
    load();
  }, []);

  useEffect(() => {
    let result = announcements;
    if (activeCategory !== 'All') result = result.filter((a) => a.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q));
    }
    setFiltered(result);
  }, [announcements, activeCategory, search]);

  if (loading) return <LoadingSpinner message="Loading announcements..." />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Announcements" subtitle="Stay informed about the latest news, events, and advisories from Barangay Lumangbayan." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                    : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Megaphone} title="No announcements found" message="Try adjusting your search or category filter." />
        ) : (
          <div className="space-y-4">
            {filtered.map((ann) => {
              const isExpanded = expandedId === ann.id;
              return (
                <article key={ann.id} className="bg-white rounded-2xl border border-neutral-100 shadow-md shadow-neutral-900/5 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
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
                      <span className="text-xs text-neutral-400 whitespace-nowrap flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(ann.published_at)}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-neutral-900 leading-snug">{ann.title}</h2>
                    <p className={`mt-3 text-sm text-neutral-600 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                      {ann.content}
                    </p>
                    {ann.content.length > 150 && (
                      <button onClick={() => setExpandedId(isExpanded ? null : ann.id)} className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                    <div className="mt-4 pt-4 border-t border-neutral-100 text-xs text-neutral-400">
                      Posted {formatRelativeTime(ann.published_at)}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
