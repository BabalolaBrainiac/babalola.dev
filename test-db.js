require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('blog_users').upsert(
    { email: 'test-role@example.com', name: 'Test', password_hash: 'hash', role: 'learner' },
    { onConflict: 'email' }
  );
  console.log('Error:', error);
}
test();
