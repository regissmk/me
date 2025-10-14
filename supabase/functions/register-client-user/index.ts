import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Edge Function: register-client-user invoked.');

  try {
    const { email, password, first_name, last_name } = await req.json();
    console.log('Received payload:', { email, first_name, last_name });

    if (!email || !password || !first_name || !last_name) {
      console.error('Missing required fields in payload.');
      return new Response(JSON.stringify({ error: 'Missing email, password, first_name, or last_name' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    console.log('Environment Variables check:');
    console.log('SUPABASE_URL is present:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY is present:', !!supabaseServiceRoleKey);

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Supabase environment variables are not set.');
      return new Response(JSON.stringify({ error: 'Supabase environment variables not configured for Edge Function.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a Supabase client with the service role key
    const supabaseServiceRoleClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey
    );
    console.log('Supabase service role client created.');

    // Create user using admin API, bypassing rate limits and confirming email
    const { data: user, error: authError } = await supabaseServiceRoleClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatically confirm email for testing/admin purposes
      user_metadata: {
        first_name,
        last_name,
      },
    });
    console.log('Supabase auth.admin.createUser call completed.');

    if (authError) {
      console.error('Supabase Auth Error:', authError.message);
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User created successfully with ID:', user.id);
    return new Response(JSON.stringify({ userId: user.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error in register-client-user Edge Function:', errorMessage);
    return new Response(JSON.stringify({ error: `Internal server error: ${errorMessage}` }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});