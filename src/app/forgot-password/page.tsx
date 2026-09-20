'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    setErrorMessage('');

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setMessage('Uplink sent. Check your inbox.');
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7fa] px-5 py-10 text-slate-800">
      <div className="mecha-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(ellipse_at_top,rgba(236,72,153,0.15),transparent_65%)]" />

      <section className="relative w-full max-w-md rounded-sm border border-slate-200 bg-white p-7 font-mono shadow-[0_16px_45px_rgba(71,85,105,0.12)] sm:p-9">
        <div className="mb-8 border-b border-pink-100 pb-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-pink-500">Recovery uplink / secure</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Recover access</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Enter your operator email and we&apos;ll transmit a password calibration link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label htmlFor="email" className="block">
            <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Operator email</span>
            <input
              id="email"
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="player@life-rpg.dev"
              disabled={isLoading}
              className="h-12 w-full rounded-sm border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          {errorMessage && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">Uplink error: {errorMessage}</p>}
          {message && <p role="status" className="rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs leading-5 text-emerald-700">{message}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-sm bg-pink-500 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_5px_14px_rgba(236,72,153,0.3)] transition hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoading ? 'Sending uplink…' : 'Send Reset Uplink'}
          </button>
        </form>

        <Link href="/login" className="mt-6 block text-center text-[10px] font-bold uppercase tracking-[0.16em] text-pink-500 transition hover:text-pink-700">
          Return to login
        </Link>
      </section>
    </main>
  );
}
