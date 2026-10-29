import { useState, useEffect } from 'react';
import { FileText, CheckCircle2, Copy, ArrowRight, LogIn } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner, ErrorMessage, PageHeader, Input, TextArea, Select, Button } from '@/components/ui';
import { generateReferenceNumber } from '@/lib/utils';
import type { Service, PageId } from '@/types';

interface ServiceRequestPageProps {
  onNavigate: (page: PageId) => void;
}

export default function ServiceRequestPage({ onNavigate }: ServiceRequestPageProps) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [details, setDetails] = useState('');

  useEffect(() => {
    async function loadServices() {
      try {
        const { data, error } = await supabase.from('services').select('*').order('name');
        if (error) throw error;
        setServices(data || []);
        if (data && data.length > 0) setServiceType(data[0].name);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Request a Service" />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Sign In Required</h2>
          <p className="text-sm text-neutral-500 mb-6">Please sign in to your resident account to submit a service request online.</p>
          <Button onClick={() => onNavigate('login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading services..." />;
  if (error) return <ErrorMessage message={error} />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const refNum = generateReferenceNumber('REQ');
    const { error } = await supabase.from('service_requests').insert({
      user_id: user.id,
      full_name: fullName,
      email: email || null,
      phone,
      address,
      service_type: serviceType,
      details,
      reference_number: refNum,
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
    } else {
      setSuccess(refNum);
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Request Submitted" />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Your request has been submitted!</h2>
            <p className="text-sm text-neutral-500 mt-2">Save your reference number to track your request status.</p>
            <div className="mt-6 bg-primary-50 rounded-xl p-4">
              <div className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">Reference Number</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-bold text-primary-900 tracking-wider">{success}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(success)}
                  className="p-1.5 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Copy className="w-4 h-4 text-primary-600" />
                </button>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <Button variant="outline" onClick={() => onNavigate('track')}>Track My Requests</Button>
              <Button onClick={() => { setSuccess(null); onNavigate('service-request'); }}>
                Submit Another <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Request a Service" subtitle="Submit a service request online and receive a reference number to track its status." />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-md space-y-5">
          {error && <div className="bg-error-50 border border-error-100 rounded-xl px-4 py-3 text-sm text-error-700">{error}</div>}

          <Input label="Full Name" value={fullName} onChange={setFullName} placeholder="Juan Dela Cruz" required icon={FileText} />
          <div className="grid sm:grid-cols-2 gap-5">
            <Input label="Email (optional)" type="email" value={email} onChange={setEmail} placeholder="juan@email.com" />
            <Input label="Phone Number" value={phone} onChange={setPhone} placeholder="0917-XXX-XXXX" required />
          </div>
          <Input label="Address" value={address} onChange={setAddress} placeholder="Purok 1, Lumangbayan" required />
          <Select
            label="Service Requested"
            value={serviceType}
            onChange={setServiceType}
            required
            options={services.map((s) => ({ value: s.name, label: s.name }))}
          />
          <TextArea label="Details / Purpose" value={details} onChange={setDetails} placeholder="Please describe the purpose of your request..." required rows={4} />

          <div className="pt-2">
            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
