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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('Auth callback: exchange result', {
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      error: error?.message,
      cookieCount: cookiesToSet.length,
      cookieNames: cookiesToSet.map(c => c.name)
    });

    if (!error && data?.session) {
      // Create the response with explicit 302 status for better cookie handling
      const response = NextResponse.redirect(`${redirectUrl}/`, { status: 302 });

      // Set all cookies on the response
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
        console.log(`Setting cookie: ${name}, options:`, options);
      });

      return response;
    }

    if (error) {
      return NextResponse.redirect(`${redirectUrl}/auth?error=${encodeURIComponent(error.message)}`);
    }

    // No session returned
    return NextResponse.redirect(`${redirectUrl}/auth?error=No session returned`);
  }

  return NextResponse.redirect(`${redirectUrl}/auth?error=No code provided`);
}
