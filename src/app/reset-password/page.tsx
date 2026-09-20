'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import CyberSamuraiBackground from '@/components/cyber-samurai-background';
import CyberShinobi from '@/components/cyber-shinobi';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    setIsComplete(true);
    setNewPassword('');
  };

  const returnToDashboard = () => {
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <CyberSamuraiBackground><main className="relative flex min-h-screen items-center justify-center gap-10 px-5 py-10 text-slate-800">

      <section className="relative w-full max-w-md rounded-sm border border-slate-200 bg-white p-7 font-mono shadow-[0_16px_45px_rgba(71,85,105,0.12)] sm:p-9">
        <div className="mb-8 border-b border-pink-100 pb-5">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-pink-500">Credential lab / online</p>
          <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">Calibrate password</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Install a new passcode to restore command-deck access.</p>
        </div>

        {isComplete ? (
          <div className="space-y-5">
            <p role="status" className="rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs leading-5 text-emerald-700">
              Password calibrated. Your account is ready for deployment.
            </p>
            <button
              type="button"
              onClick={returnToDashboard}
              className="w-full rounded-sm bg-pink-500 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_5px_14px_rgba(236,72,153,0.3)] transition hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2"
            >
              Return to dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label htmlFor="new-password" className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">New password</span>
              <input
                id="new-password"
                required
                minLength={6}
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className="h-12 w-full rounded-sm border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            {errorMessage && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">Calibration error: {errorMessage}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-sm bg-pink-500 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-[0_5px_14px_rgba(236,72,153,0.3)] transition hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? 'Calibrating…' : 'Calibrate Password'}
            </button>
          </form>
        )}
      </section><CyberShinobi mood={isLoading ? 'loading' : isComplete ? 'success' : newPassword ? 'typing' : 'idle'} />
    </main></CyberSamuraiBackground>
  );
}
