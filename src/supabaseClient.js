
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdgmqardrasiecwajsrg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZ21xYXJkcmFzaWVjd2Fqc3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjY2MDcsImV4cCI6MjA4MDM0MjYwN30.oQKDHL4x-tfEzCXWjE0a6Udf6fWV3wtgP3QVhJ-jwtQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
