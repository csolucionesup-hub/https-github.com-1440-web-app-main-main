
import fs from 'fs';

async function verify() {
  try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.+)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

    if (!urlMatch || !keyMatch) {
      console.error('Credentials not found in .env');
      return;
    }

    const url = urlMatch[1].trim();
    const key = keyMatch[1].trim();

    console.log(`Connecting to: ${url}`);

    const response = await fetch(`${url}/rest/v1/goals?select=id&limit=1`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });

    if (response.ok) {
      console.log('✅ SUCCESS: Supabase connection established and "goals" table found.');
    } else {
      const error = await response.json();
      console.error('❌ ERROR:', error.message || response.statusText);
    }
  } catch (err) {
    console.error('❌ EXCEPTION:', err.message);
  }
}

verify();
