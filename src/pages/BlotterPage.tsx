import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, Copy, ArrowRight, LogIn, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner, ErrorMessage, PageHeader, Input, TextArea, Select, Button } from '@/components/ui';
import { generateReferenceNumber, INCIDENT_TYPES } from '@/lib/utils';
import type { PageId } from '@/types';

interface BlotterPageProps {
  onNavigate: (page: PageId) => void;
}

export default function BlotterPage({ onNavigate }: BlotterPageProps) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [complainantName, setComplainantName] = useState('');
  const [complainantAddress, setComplainantAddress] = useState('');
  const [complainantPhone, setComplainantPhone] = useState('');
  const [incidentType, setIncidentType] = useState(INCIDENT_TYPES[0]);
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [personsInvolved, setPersonsInvolved] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (user) {
      setComplainantName(user.full_name || '');
      setComplainantPhone(user.phone || '');
      setComplainantAddress(user.address || '');
    }
  }, [user]);

  if (!user) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="File a Blotter Report" />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-error-50 flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-error-600" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">Sign In Required</h2>
          <p className="text-sm text-neutral-500 mb-6">Please sign in to your resident account to file a blotter report.</p>
          <Button onClick={() => onNavigate('login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const refNum = generateReferenceNumber('BLT');
    const { error } = await supabase.from('blotter_reports').insert({
      user_id: user.id,
      complainant_name: complainantName,
      complainant_address: complainantAddress,
      complainant_phone: complainantPhone,
      incident_type: incidentType,
      incident_date: incidentDate,
      incident_location: incidentLocation,
      persons_involved: personsInvolved || null,
      description,
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
        <PageHeader title="Report Filed" />
        <div className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900">Your blotter report has been filed!</h2>
            <p className="text-sm text-neutral-500 mt-2">Save your reference number to track the status of your report.</p>
            <div className="mt-6 bg-primary-50 rounded-xl p-4">
              <div className="text-xs text-primary-600 font-medium uppercase tracking-wide mb-1">Reference Number</div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl font-bold text-primary-900 tracking-wider">{success}</span>
                <button onClick={() => navigator.clipboard.writeText(success)} className="p-1.5 rounded-lg hover:bg-primary-100 transition-colors">
                  <Copy className="w-4 h-4 text-primary-600" />
                </button>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-center">
              <Button variant="outline" onClick={() => onNavigate('track')}>Track My Reports</Button>
              <Button onClick={() => { setSuccess(null); onNavigate('home'); }}>Back to Home <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="File a Blotter Report" subtitle="Report an incident or file a complaint. All reports are confidential and will be reviewed by the barangay authorities." />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-warning-50 border border-warning-100 rounded-xl p-4 mb-6 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-warning-700">
            For emergencies or crimes in progress, please call 911 or the barangay hotline directly. This form is for documenting incidents that have already occurred.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 border border-neutral-100 shadow-md space-y-5">
          {error && <div className="bg-error-50 border border-error-100 rounded-xl px-4 py-3 text-sm text-error-700">{error}</div>}

          <Input label="Complainant Name" value={complainantName} onChange={setComplainantName} placeholder="Juan Dela Cruz" required />
          <div className="grid sm:grid-cols-2 gap-5">
            <Input label="Address" value={complainantAddress} onChange={setComplainantAddress} placeholder="Purok 1, Lumangbayan" required />
            <Input label="Phone Number" value={complainantPhone} onChange={setComplainantPhone} placeholder="0917-XXX-XXXX" required />
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <Select
              label="Incident Type"
              value={incidentType}
              onChange={setIncidentType}
              required
              options={INCIDENT_TYPES.map((t) => ({ value: t, label: t }))}
            />
            <Input label="Date of Incident" type="date" value={incidentDate} onChange={setIncidentDate} required />
          </div>
          <Input label="Incident Location" value={incidentLocation} onChange={setIncidentLocation} placeholder="Where did the incident happen?" required />
          <Input label="Persons Involved (optional)" value={personsInvolved} onChange={setPersonsInvolved} placeholder="Names of other people involved" />
          <TextArea label="Description of Incident" value={description} onChange={setDescription} placeholder="Please describe what happened in detail..." required rows={5} />

          <div className="pt-2">
            <Button type="submit" size="lg" disabled={submitting} className="w-full">
              {submitting ? 'Filing Report...' : 'File Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
