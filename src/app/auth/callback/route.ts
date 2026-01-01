import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Determine the redirect URL for Vercel
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  let redirectUrl = origin;
  if (!isLocalEnv && forwardedHost) {
    redirectUrl = `https://${forwardedHost}`;
  }

  if (code) {
    const cookieStore = await cookies();

    // WORKAROUND: Next.js 14+ bug - call getAll() twice before exchangeCodeForSession
    // This ensures the cookie store is properly initialized
    // See: https://github.com/supabase/ssr/issues/55
    cookieStore.getAll();
    cookieStore.getAll();

    // Collect cookies to set on the redirect response
    const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookies) {
            // Collect cookies for the response
            cookies.forEach((cookie) => {
              cookiesToSet.push(cookie);
            });
            // Also try to set via cookieStore (may work in some cases)
            try {
              cookies.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore errors
            }
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    // Debug: Check what we got back
    const debugInfo = {
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      errorMsg: error?.message || 'none',
      cookieCount: cookiesToSet.length,
    };

    if (!error && data?.session) {
      // Create redirect response and set cookies explicitly
      const response = NextResponse.redirect(`${redirectUrl}/?auth=success&cookies=${cookiesToSet.length}`);

      // Set all auth cookies on the response
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

      return response;
    }

    // If we get here, something went wrong
    const errorDetail = error?.message || `no-session-returned,debug:${JSON.stringify(debugInfo)}`;
    return NextResponse.redirect(`${redirectUrl}/auth?error=${encodeURIComponent(errorDetail)}`);
  }

  return NextResponse.redirect(`${redirectUrl}/auth?error=No code provided`);
}
