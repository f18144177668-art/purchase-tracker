import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://chliujaxnfkgrmyuzqhs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNobGl1amF4bmZrZ3JteXV6cWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MDYwNjUsImV4cCI6MjA5Nzk4MjA2NX0.65qT3txuS27WaP1t-2BpceqnKfynPfZx9qJ0lnBXGFA';

export const supabase = createClient(supabaseUrl, supabaseKey);
