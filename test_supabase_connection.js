
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Credentials missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  try {
    // Try to check if goals table exists (or any table)
    const { data, error } = await supabase.from('goals').select('id').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "goals" does not exist')) {
        console.log('✅ Connection successful!');
        console.log('⚠️ Note: Table "goals" not found. Make sure to run the SQL migration I provided.');
      } else {
        console.error('❌ Connection error:', error.message);
      }
    } else {
      console.log('✅ Connection successful!');
      console.log('📊 Table "goals" found and accessible.');
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

testConnection();
