import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../lib/adminApi.js';
import { useAdminAuth } from '../../context/AdminAuthContext.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { markAuthenticated } = useAdminAuth();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setError(null);
    try {
      await adminLogin(password);
      markAuthenticated();
      navigate('/admin/dashboard');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  }

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display font-medium text-xl text-fc-ink mb-6">Admin sign in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-pwd" className="block text-sm text-fc-ink-2 mb-1">
            Password
          </label>
          <input
            id="admin-pwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="w-full border border-fc-border-strong rounded-fc-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fc-sage-deep bg-fc-white"
          />
        </div>
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-fc-md px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full bg-fc-ink text-fc-white text-sm font-medium py-2 rounded-fc-md hover:bg-fc-ink/90 transition-colors disabled:opacity-50"
        >
          {status === 'submitting' ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
