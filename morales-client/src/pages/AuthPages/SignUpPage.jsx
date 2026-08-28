import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const inputClasses =
  'mt-1.5 w-full rounded-lg border-2 border-[#0B1F44]/15 bg-white px-4 py-3 text-sm text-[#0B1F44] outline-none transition placeholder:text-[#0B1F44]/30 focus:border-[#0B1F44] focus:ring-4 focus:ring-[#0B1F44]/10';

const SignUpPage = () => {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/user/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to create your account.');
      saveSession(result); navigate('/');
    } catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); }
  };

  return (
    <div className="relative">
      {/* corner notches, ticket-stub echo */}
      <span aria-hidden className="absolute -left-3 -top-3 hidden h-3 w-3 rounded-full bg-zinc-100 sm:block" />
      <span aria-hidden className="absolute -right-3 -top-3 hidden h-3 w-3 rounded-full bg-zinc-100 sm:block" />

      <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#F5B700]">New Member</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-[#0B1F44] sm:text-4xl">Create your account.</h1>
      <p className="mt-2 text-sm leading-6 text-[#0B1F44]/60">
        Join the campus marketplace in just a few details.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="signup-first-name" className="text-xs font-bold uppercase tracking-wider text-[#0B1F44]/70">
              First name
            </label>
            <input id="signup-first-name" name="firstName" type="text" value={form.firstName} onChange={update} required placeholder="John" autoComplete="given-name" className={inputClasses} />
          </div>
          <div>
            <label htmlFor="signup-last-name" className="text-xs font-bold uppercase tracking-wider text-[#0B1F44]/70">
              Last name
            </label>
            <input id="signup-last-name" name="lastName" type="text" value={form.lastName} onChange={update} required placeholder="Doe" autoComplete="family-name" className={inputClasses} />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="text-xs font-bold uppercase tracking-wider text-[#0B1F44]/70">
            Email address
          </label>
          <input id="signup-email" name="email" type="email" value={form.email} onChange={update} required placeholder="you@example.com" autoComplete="email" className={inputClasses} />
        </div>

        <div>
          <label htmlFor="signup-password" className="text-xs font-bold uppercase tracking-wider text-[#0B1F44]/70">
            Password
          </label>
          <input id="signup-password" name="password" type="password" value={form.password} onChange={update} required minLength="8" placeholder="••••••••" autoComplete="new-password" className={inputClasses} />
          <p className="mt-2 text-xs text-[#0B1F44]/40">Minimum 8 characters — letters, numbers, and symbols.</p>
        </div>

        {error ? (
          <p role="alert" aria-live="polite" className="rounded-lg border-l-4 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#F5B700] py-3.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#0B1F44] transition hover:bg-[#e5aa00] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0B1F44]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Creating account...' : 'Create Account'}
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
        Already have an account?{' '}
        <Link to="/auth/signin" className="font-bold text-[#0B1F44] hover:text-[#e5aa00]">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default SignUpPage;