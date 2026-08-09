'use client';

import type { Session } from '@supabase/supabase-js';
import { type FormEvent, type ReactNode, useCallback, useEffect, useState } from 'react';

import { getSupabase } from '@/lib/archive/supabaseClient';

type Phase = 'init' | 'signedOut' | 'sending' | 'code' | 'verifying';

/**
 * Gates the archive behind a Supabase magic-link sign-in, with a 6-digit code
 * path as a first-class fallback (robust on a borrowed machine / across
 * browsers, where the PKCE same-browser link can trip). Renders `children` once
 * a session exists.
 *
 * The initial `getSession` + the `onAuthStateChange` subscription both run only
 * in the browser (useEffect), so static prerender renders the neutral 'init'
 * state and never touches Supabase.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<Phase>('init');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const supabase = getSupabase();
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setPhase((p) => (data.session ? p : 'signedOut'));
      })
      .catch(() => {
        if (active) setPhase('signedOut');
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) setPhase('signedOut');
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const sendLink = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError('');
      setNotice('');
      const addr = email.trim();
      if (!addr) return;
      setPhase('sending');
      const { error: sendError } = await getSupabase().auth.signInWithOtp({
        email: addr,
        options: { emailRedirectTo: `${window.location.origin}/archive/` },
      });
      if (sendError) {
        setError(sendError.message);
        setPhase('signedOut');
      } else {
        setNotice('Check your email — tap the link, or type the 6-digit code from the same email below.');
        setPhase('code');
      }
    },
    [email],
  );

  const verifyCode = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError('');
      const token = code.trim();
      if (!token) return;
      setPhase('verifying');
      const { error: verifyError } = await getSupabase().auth.verifyOtp({
        email: email.trim(),
        token,
        type: 'email',
      });
      if (verifyError) {
        setError(verifyError.message);
        setPhase('code');
      }
      // Success flips the session via onAuthStateChange → children render.
    },
    [code, email],
  );

  if (session) return <>{children}</>;

  if (phase === 'init') {
    return (
      <div className="sa-auth">
        <p className="sa-mono sa-dim">opening the studio…</p>
      </div>
    );
  }

  const busy = phase === 'sending' || phase === 'verifying';

  return (
    <div className="sa-auth">
      <div className="sa-card">
        <div className="sa-mono sa-card-kicker">THE STUDIO ARCHIVE</div>
        <p className="sa-serif sa-card-lede">Your catalogue, on any device. Sign in to open it.</p>

        <form onSubmit={sendLink}>
          <label className="sa-mono sa-label" htmlFor="sa-email">
            email
          </label>
          <input
            id="sa-email"
            className="sa-field"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="sa-btn" type="submit" disabled={busy || !email.trim()}>
            {phase === 'sending' ? 'sending…' : 'email me a link'}
          </button>
        </form>

        {(phase === 'code' || phase === 'verifying') && (
          <form onSubmit={verifyCode} className="sa-code-form">
            <label className="sa-mono sa-label" htmlFor="sa-code">
              or enter the 6-digit code
            </label>
            <input
              id="sa-code"
              className="sa-field"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
            <button className="sa-btn" type="submit" disabled={busy || code.trim().length < 6}>
              {phase === 'verifying' ? 'verifying…' : 'enter'}
            </button>
          </form>
        )}

        {notice && <p className="sa-notice sa-serif">{notice}</p>}
        {error && (
          <p className="sa-error sa-mono" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
