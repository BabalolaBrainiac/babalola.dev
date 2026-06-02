import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import { supabase } from '@/lib/supabase';
import { sendLearnerCredentials } from '@/lib/email';

// 12-char password from a readable alphabet (no confusing chars)
const generatePassword = customAlphabet(
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789',
  12,
);

const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = requestCounts.get(ip);
  if (!current || current.resetAt <= now) {
    requestCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many access requests. Try again later.' }, { status: 429 });
  }

  let body: { email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim() || email?.split('@')[0] || 'Learner';

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
  }

  if (email.length > 254 || name.length > 80) {
    return NextResponse.json({ error: 'Email or name is too long' }, { status: 400 });
  }

  // Block duplicate signups: if account already exists, tell them to sign in
  const { data: existing } = await supabase
    .from('blog_users')
    .select('id, role')
    .eq('email', email)
    .single();

  if (existing) {
    // Only block if it's a learner/contributor — admins can't accidentally reset via this form
    if (existing.role === 'learner' || existing.role === 'contributor') {
      return NextResponse.json(
        { error: 'An account with this email already exists. Use Sign In instead.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: 'This email is not available for learner access.' }, { status: 403 });
  }

  const password = generatePassword();
  const password_hash = await bcrypt.hash(password, 12);

  // Try learner role first; fall back to contributor if the constraint hasn't been migrated yet
  let upsertError = null;
  for (const role of ['learner', 'contributor'] as const) {
    const { error } = await supabase
      .from('blog_users')
      .insert({ email, name, password_hash, role });
    if (!error) { upsertError = null; break; }
    upsertError = error;
    if (error.code !== '23514') break; // only retry on CHECK constraint violation
  }

  if (upsertError) {
    console.error('request-access insert error:', upsertError);
    return NextResponse.json({ error: 'Could not create account', detail: upsertError.message }, { status: 500 });
  }

  try {
    await sendLearnerCredentials(email, name, password);
  } catch (emailErr) {
    console.error('Email send failed:', emailErr);
    // Account was created but email failed — still return ok so caller can retry
    return NextResponse.json({ ok: true, warning: 'email_failed' });
  }

  return NextResponse.json({ ok: true });
}
