import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usisxkkjryublbgmtrcq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaXN4a2tqcnl1YmxiZ210cmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMzQ2NzIsImV4cCI6MjA3MjYxMDY3Mn0.8WRQBxFeCYjgptXREtmu0Q7ms4r7wjG7nBwdBqB4X3U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);