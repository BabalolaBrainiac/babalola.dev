import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import { createClient } from '@supabase/supabase-js';
import { sendLearnerCredentials } from '../src/lib/email';

// Load .env.local manually if running outside Next.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const generatePassword = customAlphabet(
  'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789',
  12,
);

async function main() {
  const args = process.argv.slice(2);
  const emailIdx = args.indexOf('--email');
  const nameIdx = args.indexOf('--name');
  const email = args[emailIdx + 1]?.toLowerCase().trim();
  const name = nameIdx !== -1 ? args[nameIdx + 1] : email?.split('@')[0];

  if (!email) {
    console.error('Usage: npx ts-node scripts/create-learner.ts --email user@example.com [--name "Full Name"]');
    process.exit(1);
  }

  const password = generatePassword();
  const password_hash = await bcrypt.hash(password, 12);

  const { error } = await supabase.from('blog_users').upsert(
    { email, name, password_hash, role: 'learner' },
    { onConflict: 'email' },
  );

  if (error) {
    console.error('DB error:', error.message);
    process.exit(1);
  }

  await sendLearnerCredentials(email, name!, password);

  console.log(`✓ Account created for ${email}`);
  console.log(`  Name:     ${name}`);
  console.log(`  Password: ${password}`);
  console.log(`  Email sent via ZeptoMail`);
}

main();
