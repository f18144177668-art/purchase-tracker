const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://chliujaxnfkgrmyuzqhs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobGl1amF4bmZrZ3JteXV6cWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDYwNjUsImV4cCI6MjA5Nzk4MjA2NX0.65qT3txuS27WaP1t-2BpceqnKfynPfZx9qJ0lnBXGFA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateG37Records() {
  console.log('Starting to update G37 records...');
  
  const { data, error } = await supabase
    .from('purchases')
    .select('id, model')
    .like('model', 'G37%');
  
  if (error) {
    console.error('Failed to fetch records:', error);
    return;
  }
  
  console.log(`Found ${data.length} records to update`);
  
  for (const record of data) {
    const newModel = record.model.replace(/^G37\s*/, '公牛 ');
    console.log(`Updating ${record.id}: ${record.model} -> ${newModel}`);
    
    const { error: updateError } = await supabase
      .from('purchases')
      .update({ model: newModel })
      .eq('id', record.id);
    
    if (updateError) {
      console.error(`Failed to update ${record.id}:`, updateError);
    } else {
      console.log(`Successfully updated ${record.id}`);
    }
  }
  
  console.log('Update completed!');
}

updateG37Records();
