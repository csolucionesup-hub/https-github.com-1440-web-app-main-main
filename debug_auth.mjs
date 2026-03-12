
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uhiwmcnjtnxzrizmegjt.supabase.co';
const supabaseAnonKey = 'sb_publishable_Ec82vOngzXAW3tK0N6V_bw_8fLjiwlP';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAuth() {
  const email = 'csolucionesup@gmail.com';
  const password = 'Abcsolucionesup2025@';

  console.log(`Diagnostic: Attempting login for ${email}...`);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Diagnostic error:', error.message);
    console.error('Diagnostic code:', error.status);
    
    if (error.message.includes('Email not confirmed')) {
      console.log('CRITICAL: Email confirmation is required by Supabase logic.');
    }
  } else {
    console.log('Diagnostic success! User is authenticated.');
    console.log('User ID:', data.user?.id);
    console.log('Is email confirmed?', data.user?.email_confirmed_at);
  }
}

debugAuth();
