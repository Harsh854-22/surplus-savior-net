// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qtqwvsbetoxcvsudbrcf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0cXd2c2JldG94Y3ZzdWRicmNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMjQzODMsImV4cCI6MjA2MDcwMDM4M30.gb7w_FNz_4IU1S6HJqiqV2YrMWCmcVWlQgR4xKXoEpI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);