import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  // Determine the redirect URL for Vercel
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';
  let redirectUrl = origin;
  if (!isLocalEnv && forwardedHost) {
    redirectUrl = `https://${forwardedHost}`;
  }

  if (token_hash && type) {
    const cookieStore = await cookies();

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
            // Also try to set via cookieStore
            try {
              cookies.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore errors in Server Component context
            }
          },
        },
      }
    );

    // Verify the magic link token
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Create redirect response and set cookies explicitly
      const response = NextResponse.redirect(`${redirectUrl}/`);

      // Set all auth cookies on the response
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });

      return response;
    }

    return NextResponse.redirect(`${redirectUrl}/auth?error=${encodeURIComponent(error.message)}`);
  }

  return NextResponse.redirect(`${redirectUrl}/auth?error=Invalid magic link`);
}
