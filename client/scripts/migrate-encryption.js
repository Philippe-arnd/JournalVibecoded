import { createClient } from '@supabase/supabase-js';
import CryptoJS from 'crypto-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !ENCRYPTION_KEY) {
  console.error('Missing environment variables in .env.local');
  console.error('Ensure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_ENCRYPTION_KEY are set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const SENSITIVE_FIELDS = [
  'professional_recap',
  'personal_recap',
  'learning_reflections',
  'gratitude',
  'ai_feedback',
  'ai_cited_entries'
];

const isEncrypted = (text) => {
  if (typeof text !== 'string') return false;
  return text.startsWith('U2FsdGVkX1');
};

const encrypt = (text) => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

async function migrate() {
  console.log('--- Journal Encryption Migration ---');
  
  const email = await question('Enter your account email: ');
  const password = await question('Enter your account password: ');

  console.log('\nLogging in...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    console.error('Login failed:', authError.message);
    rl.close();
    return;
  }

  const userId = authData.user.id;
  console.log('Login successful! User ID:', userId);

  console.log('Fetching your entries...');
  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching entries:', error);
    rl.close();
    return;
  }

  console.log(`Found ${entries.length} entries. Checking for unencrypted data...`);

  let updatedCount = 0;

  for (const entry of entries) {
    let needsUpdate = false;
    const updatedData = {};

    for (const field of SENSITIVE_FIELDS) {
      const value = entry[field];
      if (value && !isEncrypted(value)) {
        needsUpdate = true;
        let valueToEncrypt = value;
        if (field === 'ai_cited_entries' && typeof value !== 'string') {
          valueToEncrypt = JSON.stringify(value);
        }
        updatedData[field] = encrypt(valueToEncrypt);
      }
    }

    if (needsUpdate) {
      console.log(`Encrypting entry from ${entry.entry_date}...`);
      const { error: updateError } = await supabase
        .from('entries')
        .update(updatedData)
        .eq('id', entry.id);

      if (updateError) {
        console.error(`Failed to update entry ${entry.id}:`, updateError.message);
      } else {
        updatedCount++;
      }
    }
  }

  console.log('\nMigration complete!');
  console.log(`Successfully encrypted ${updatedCount} entries.`);
  rl.close();
}

migrate();
