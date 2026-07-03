import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const next = requestUrl.searchParams.get('next') || '/';

  if (error) {
    console.error('OAuth provider error:', error, errorDescription);
    const redirectUrl = new URL('/', requestUrl.origin);
    redirectUrl.searchParams.set('auth_error', 'google');
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const supabase = await createClient();

    if (supabase) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError) {
        // Success: cookies set, session ready
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }

      // Only log real unexpected errors (PKCE verifier missing is normal for manual/test URLs)
      if (!exchangeError.message?.includes('PKCE') && !exchangeError.message?.includes('verifier')) {
        console.error('Auth callback exchange error:', exchangeError);
      }
    }
  }

  // Fallback: signal error to the app
  const redirectUrl = new URL('/', requestUrl.origin);
  redirectUrl.searchParams.set('auth_error', 'google');
  return NextResponse.redirect(redirectUrl);
}
