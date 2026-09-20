import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') === '/reset-password' ? '/reset-password' : '/dashboard';
  const response = NextResponse.redirect(new URL(next, requestUrl.origin));

  if (!code) return NextResponse.redirect(new URL('/login?error=missing_auth_code', requestUrl.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.headers.get('cookie')?.split('; ').filter(Boolean).map((cookie) => {
            const [name, ...value] = cookie.split('=');
            return { name, value: value.join('=') };
          }) ?? [];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL('/forgot-password?error=invalid_or_expired_link', requestUrl.origin));

  return response;
}
