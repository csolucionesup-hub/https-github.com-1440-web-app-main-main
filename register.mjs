
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhiwmcnjtnxzrizmegjt.supabase.co';
const supabaseAnonKey = 'sb_publishable_Ec82vOngzXAW3tK0N6V_bw_8fLjiwlP'; // Hardcoding for the test script

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function register() {
  console.log('Attempting to register user...');
  const { data, error } = await supabase.auth.signUp({
    email: 'csolucionesup@gmail.com',
    password: 'Abcsolucionesup2025@',
  });

  if (error) {
    console.error('Registration failed:', error.message);
  } else {
    console.log('Registration success! User ID:', data.user?.id);
  }
}

register();
