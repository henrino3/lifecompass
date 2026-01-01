import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Determine the redirect URL
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  let redirectUrl = origin;
  if (!isLocalEnv && forwardedHost) {
    redirectUrl = `https://${forwardedHost}`;
  }

  if (code) {
    const cookieStore = await cookies();

    // Store cookies to set on the response
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
            cookies.forEach((cookie) => {
              cookiesToSet.push(cookie);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Create the response and manually set cookies
      const response = NextResponse.redirect(`${redirectUrl}/`);

      // Set all cookies on the response
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

      return response;
    }

    return NextResponse.redirect(`${redirectUrl}/auth?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${redirectUrl}/auth?error=No code provided`);
}
