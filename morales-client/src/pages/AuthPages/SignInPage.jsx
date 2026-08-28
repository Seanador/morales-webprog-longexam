import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const inputClasses =
  'mt-1.5 w-full rounded-lg border-2 border-[#0B1F44]/15 bg-white px-4 py-3 text-sm text-[#0B1F44] outline-none transition placeholder:text-[#0B1F44]/30 focus:border-[#0B1F44] focus:ring-4 focus:ring-[#0B1F44]/10';

const SignInPage = () => {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/user/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to log in.');
      saveSession(result); navigate(['admin', 'supplier'].includes(result.user.userRole) ? '/dashboard' : '/');
    } catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); }
  };

  return (
    <div className="relative">
      {/* corner notches, ticket-stub echo */}
      <span aria-hidden className="absolute -left-3 -top-3 hidden h-3 w-3 rounded-full bg-zinc-100 sm:block" />
      <span aria-hidden className="absolute -right-3 -top-3 hidden h-3 w-3 rounded-full bg-zinc-100 sm:block" />

      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#F5B700]">Account Access</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0B1F44] sm:text-4xl">Welcome back.</h1>
      <p className="mt-2 text-sm leading-6 text-[#0B1F44]/60">
        Sign in to manage your orders, cart, and pickup details in one place.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="signin-email" className="text-xs font-bold uppercase tracking-wider text-[#0B1F44]/70">
            Email address
          </label>
          <input id="signin-email" name="email" type="email" value={form.email} onChange={update} required placeholder="you@example.com" autoComplete="email" className={inputClasses} />
        </div>

        <div>
          <label htmlFor="signin-password" className="text-xs font-bold uppercase tracking-wider text-[#0B1F44]/70">
            Password
          </label>
          <input id="signin-password" name="password" type="password" value={form.password} onChange={update} required placeholder="••••••••" autoComplete="current-password" className={inputClasses} />
          <p className="mt-2 text-xs text-[#0B1F44]/40">Minimum 8 characters — letters, numbers, and symbols.</p>
        </div>

        {error ? (
          <p role="alert" aria-live="polite" className="rounded-lg border-l-4 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-[#0B1F44]/60">
            <input type="checkbox" className="h-4 w-4 rounded border-[#0B1F44]/30 accent-[#0B1F44] focus-visible:ring-2 focus-visible:ring-[#0B1F44]/30" />
            <span>Remember me</span>
          </label>
          <button type="button" className="rounded text-xs font-bold text-[#0B1F44] transition hover:text-[#e5aa00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1F44]/30">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#F5B700] py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0B1F44] transition hover:bg-[#e5aa00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B1F44]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Logging in...' : 'Log In'}
        </button>

        <div className="flex items-center gap-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B1F44]/30">
          <span className="h-px flex-1 border-t-2 border-dashed border-[#0B1F44]/15" />
          or continue with
          <span className="h-px flex-1 border-t-2 border-dashed border-[#0B1F44]/15" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {['Google', 'Apple'].map((label) => (
            <button
              key={label}
              type="button"
              className="rounded-lg border-2 border-[#0B1F44] py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0B1F44] transition hover:bg-[#0B1F44] hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B1F44]/20"
            >
              {label}
            </button>
          ))}
        </div>
      </form>

      <p className="mt-8 border-t border-[#0B1F44]/10 pt-5 text-center text-sm text-[#0B1F44]/60">
        No account yet?{' '}
        <Link to="/auth/signup" className="font-bold text-[#0B1F44] hover:text-[#e5aa00]">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default SignInPage;