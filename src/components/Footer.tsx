import { Building2, MapPin, Phone, Mail, Clock, Facebook } from 'lucide-react';
import { PUBLIC_NAV } from '@/lib/utils';
import type { PageId } from '@/types';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleNav = (page: PageId) => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary-900 text-neutral-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-base">Barangay Lumangbayan</div>
                <div className="text-xs text-neutral-400">Official Community Portal</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-neutral-400">
              Serving the residents of Barangay Lumangbayan with dedication, transparency,
              and community spirit.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2.5">
              {PUBLIC_NAV.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNav(item.id)}
                    className="text-sm text-neutral-400 hover:text-secondary-300 transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => handleNav('login')}
                  className="text-sm text-neutral-400 hover:text-secondary-300 transition-colors"
                >
                  Sign In
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" />
                <span>Barangay Hall, Lumangbayan, Calapan City, Oriental Mindoro</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                <span>(043) 288-XXXX</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                <span>brgy.lumangbayan@calapan.gov.ph</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Facebook className="w-4 h-4 text-secondary-400 flex-shrink-0" />
                <span>facebook.com/BrgyLumangbayan</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Office Hours</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Clock className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Monday – Friday</div>
                  <div className="text-neutral-400">8:00 AM – 5:00 PM</div>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Saturday</div>
                  <div className="text-neutral-400">8:00 AM – 12:00 PM</div>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="w-4 h-4 text-secondary-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-white font-medium">Sunday & Holidays</div>
                  <div className="text-neutral-400">Closed (Emergency only)</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Barangay Lumangbayan. All rights reserved.
          </p>
          <p className="text-xs text-neutral-500">
            Republic of the Philippines · Province of Oriental Mindoro
          </p>
        </div>
      </div>
    </footer>
  );
}
