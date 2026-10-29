import { useState } from 'react';
import { Building2, Mail, Lock, User, Phone, MapPin, Shield, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input } from '@/components/ui';
import type { UserRole, PageId } from '@/types';

interface AuthPageProps {
  mode: 'login' | 'signup';
  onNavigate: (page: PageId) => void;
}

export default function AuthPage({ mode, onNavigate }: AuthPageProps) {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<UserRole>('resident');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLogin = mode === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        onNavigate('home');
      }
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName, role, phone, address);
      if (error) {
        setError(error);
        setLoading(false);
      } else {
        onNavigate('login');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-neutral-50 to-primary-50/30">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to portal
        </button>

        <div className="bg-white rounded-3xl shadow-xl shadow-neutral-900/5 border border-neutral-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary-700 to-primary-900 px-8 py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">
              {isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h1>
            <p className="text-sm text-primary-200 mt-1">
              {isLogin
                ? 'Sign in to access your dashboard'
                : 'Join the Barangay Lumangbayan portal'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {error && (
              <div className="bg-error-50 border border-error-100 rounded-xl px-4 py-3 text-sm text-error-700">
                {error}
              </div>
            )}

            {!isLogin && (
              <>
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Juan Dela Cruz"
                  required
                  icon={User}
                />

                {/* Role selector */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Account Type <span className="text-error-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('resident')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        role === 'resident'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <Users className={`w-6 h-6 ${role === 'resident' ? 'text-primary-600' : 'text-neutral-400'}`} />
                      <span className={`text-sm font-medium ${role === 'resident' ? 'text-primary-700' : 'text-neutral-500'}`}>
                        Resident
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        role === 'admin'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <Shield className={`w-6 h-6 ${role === 'admin' ? 'text-primary-600' : 'text-neutral-400'}`} />
                      <span className={`text-sm font-medium ${role === 'admin' ? 'text-primary-700' : 'text-neutral-500'}`}>
                        Admin
                      </span>
                    </button>
                  </div>
                </div>

                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={setPhone}
                  placeholder="0917-XXX-XXXX"
                  icon={Phone}
                />
                <Input
                  label="Address"
                  value={address}
                  onChange={setAddress}
                  placeholder="Purok 1, Lumangbayan"
                  icon={MapPin}
                />
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="juan@email.com"
              required
              icon={Mail}
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
              required
              icon={Lock}
            />

            <Button type="submit" size="lg" disabled={loading} className="w-full">
              {loading
                ? 'Please wait...'
                : isLogin
                  ? 'Sign In'
                  : 'Create Account'}
            </Button>

            <div className="text-center text-sm text-neutral-500">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('signup')}
                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Sign up here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Sign in instead
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
