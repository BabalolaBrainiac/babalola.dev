import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/upload-session'
import { supabase } from '@/lib/supabase'

// Called once after ALL files in a session have uploaded successfully.
// Marks the token as used so it cannot be reused.
export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { error } = await supabase
    .from('upload_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', session.tokenId)
    .is('used_at', null)

  if (error) {
    console.error('Finalize token error:', error)
    return NextResponse.json({ error: 'Failed to finalize session' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
