import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    // Create the redirect response first so we can attach cookies to it
    const response = NextResponse.redirect(`${origin}/`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set cookies directly on the response
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Return specific error message for debugging
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error.message)}`);
    }

    if (!data.session) {
      return NextResponse.redirect(`${origin}/auth?error=No session returned`);
    }

    return response;
  }

  // Return to auth page if no code provided
  return NextResponse.redirect(`${origin}/auth?error=No code provided`);
}
