
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function register() {
  const { data, error } = await supabase.auth.signUp({
    email: 'csolucionesup@gmail.com',
    password: 'Abcsolucionesup2025@',
  });

  if (error) {
    console.error('Error during registration:', error.message);
    if (error.status === 429) {
      console.log('Rate limit still active.');
    }
  } else {
    console.log('Registration successful or user already exists:', data.user?.id);
  }
}

register();
