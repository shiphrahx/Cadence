/**
 * Auth Callback Route Handler
 * Handles OAuth redirects and creates user profile on first login
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    if (data.user) {
      // Check if user profile exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // Create user profile if it doesn't exist (first login)
      if (!profile) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            name: (data.user.user_metadata.full_name || data.user.user_metadata.name || 'User') as string,
            email: data.user.email || null,
          } as any)

        if (profileError) {
          console.error('Error creating user profile:', profileError)
        }
      }
    }
  }

  // Redirect to dashboard after successful auth
  return NextResponse.redirect(`${origin}/`)
}
