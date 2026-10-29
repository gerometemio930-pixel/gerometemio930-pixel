import { Building2, MapPin, Phone, Mail, Clock, Facebook, Users, HeartHandshake, Shield } from 'lucide-react';
import { PageHeader } from '@/components/ui';

export default function AboutPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader title="About Barangay Lumangbayan" subtitle="Learn about our community, our mission, and the services we provide to residents." />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* History */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Our History</h2>
          <p className="text-neutral-600 leading-relaxed">
            Barangay Lumangbayan is one of the barangays comprising Calapan City in the province
            of Oriental Mindoro, Philippines. The name "Lumangbayan" reflects the deep roots and
            rich cultural heritage of our community. Over the years, our barangay has grown from
            a small rural settlement into a thriving community of over 4,200 residents across
            950+ households in 7 puroks.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
              <HeartHandshake className="w-6 h-6 text-primary-700" />
            </div>
            <h3 className="font-bold text-neutral-900 text-lg mb-2">Our Mission</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              To provide efficient, transparent, and responsive governance that improves the
              quality of life for all residents of Barangay Lumangbayan, ensuring access to
              essential services and fostering a safe, inclusive, and progressive community.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-secondary-50 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-secondary-700" />
            </div>
            <h3 className="font-bold text-neutral-900 text-lg mb-2">Our Vision</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              A model barangay recognized for its empowered, self-reliant, and peace-loving
              community, where every resident enjoys equal access to quality public service,
              sustainable livelihood, and a healthy environment.
            </p>
          </div>
        </section>

        {/* Demographics */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Community Profile</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Total Population', value: '4,200+' },
              { icon: Building2, label: 'Households', value: '950+' },
              { icon: MapPin, label: 'Puroks', value: '7' },
              { icon: HeartHandshake, label: 'Established', value: '1950s' },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-6 text-center border border-neutral-100 shadow-md">
                <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-5 h-5 text-primary-700" />
                </div>
                <div className="text-2xl font-bold text-neutral-900">{item.value}</div>
                <div className="text-xs text-neutral-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Get in Touch</h2>
          <div className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-md">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-neutral-900 text-sm">Address</div>
                    <div className="text-sm text-neutral-500">Barangay Hall, Lumangbayan, Calapan City, Oriental Mindoro</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-neutral-900 text-sm">Phone</div>
                    <div className="text-sm text-neutral-500">(043) 288-XXXX</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-neutral-900 text-sm">Email</div>
                    <div className="text-sm text-neutral-500">brgy.lumangbayan@calapan.gov.ph</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Facebook className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-neutral-900 text-sm">Facebook</div>
                    <div className="text-sm text-neutral-500">facebook.com/BrgyLumangbayan</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-neutral-100">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-neutral-900 text-sm">Office Hours</div>
                  <div className="text-sm text-neutral-500 mt-1">
                    Mon–Fri: 8:00 AM – 5:00 PM | Sat: 8:00 AM – 12:00 PM | Sun: Closed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
