import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import { createClient } from '@supabase/supabase-js';
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

async function deleteAccount(email: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const { error } = await supabase
    .from('blog_users')
    .delete()
    .eq('email', normalizedEmail);

  if (error) {
    console.error('Error deleting account:', error.message);
    process.exit(1);
  }

  console.log(`Deleted account for ${normalizedEmail}`);
  console.log('You can now sign up again at /auth/signin');
}

async function resetPassword(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const newPassword = generatePassword();
  const password_hash = await bcrypt.hash(newPassword, 12);

  const { error } = await supabase
    .from('blog_users')
    .update({ password_hash })
    .eq('email', normalizedEmail);

  if (error) {
    console.error('Error resetting password:', error.message);
    process.exit(1);
  }

  console.log(`Password reset for ${normalizedEmail}`);
  console.log(`New password: ${newPassword}`);
  console.log('Sign in at /auth/signin with your email and new password');
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];
  const emailIdx = args.indexOf('--email');
  const email = args[emailIdx + 1];

  if (!action || !email || !['delete', 'reset'].includes(action)) {
    console.error('Usage:');
    console.error('  Delete account:   npx ts-node scripts/manage-account.ts delete --email user@example.com');
    console.error('  Reset password:   npx ts-node scripts/manage-account.ts reset --email user@example.com');
    process.exit(1);
  }

  if (action === 'delete') {
    await deleteAccount(email);
  } else if (action === 'reset') {
    await resetPassword(email);
  }
}

main();
