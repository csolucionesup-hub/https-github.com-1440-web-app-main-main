import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSchema() {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching activities:', error);
    } else {
      console.log('Sample activity structure:', data.length > 0 ? JSON.stringify(data[0], null, 2) : 'No activities found');
      console.log('Columns found:', data.length > 0 ? Object.keys(data[0]) : 'N/A');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkSchema();
