import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/';

  // Determine true public origin behind Vercel / reverse proxy (handling comma-separated lists)
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0].trim();
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim() || 'https';
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : requestUrl.origin;

  if (error) {
    console.error('OAuth provider error:', error, errorDescription);
    const redirectUrl = new URL('/', origin);
    redirectUrl.searchParams.set('auth_error', 'google');
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const supabase = await createClient();

    if (supabase) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError) {
        // Create redirect response pointing to target origin
        const response = NextResponse.redirect(new URL(next, origin));

        // EXPLICITLY copy all set cookies to the response object.
        // In Vercel serverless / Edge runtime, standalone redirects without binding cookies()
        // can drop Set-Cookie headers, leaving the browser unauthenticated after OAuth login!
        const cookieStore = await cookies();
        cookieStore.getAll().forEach((cookie) => {
          response.cookies.set(cookie.name, cookie.value, {
            path: '/',
            sameSite: 'lax',
            secure: origin.startsWith('https://'),
          });
        });

        return response;
      }

      // Only log real unexpected errors
      if (!exchangeError.message?.includes('PKCE') && !exchangeError.message?.includes('verifier')) {
        console.error('Auth callback exchange error:', exchangeError);
      }
    }
  }

  // Fallback: signal error to the app
  const redirectUrl = new URL('/', origin);
  redirectUrl.searchParams.set('auth_error', 'google');
  return NextResponse.redirect(redirectUrl);
}

