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

  try {
    const { name, phone, clientDashboardLink, messageType } = await req.json();

    if (!name || !phone || !clientDashboardLink || !messageType) {
      return new Response(JSON.stringify({ error: 'Missing name, phone, clientDashboardLink, or messageType' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const whatsappApiKey = Deno.env.get('WHATSAPP_API_KEY');
    const whatsappApiEndpoint = 'https://your-whatsapp-api-provider.com/send'; // Replace with your API endpoint

    if (!whatsappApiKey) {
      console.error('WHATSAPP_API_KEY is not set in Supabase secrets.');
      return new Response(JSON.stringify({ error: 'WhatsApp API key not configured.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let messageContent = '';

    switch (messageType) {
      case 'welcome':
        messageContent = `🎉 Olá, ${name}!
Seja bem-vindo(a) à Memory School Fotografia 📸✨

Seu cadastro foi concluído com sucesso!
Agora você já pode acessar a sua área do cliente para acompanhar os serviços, pacotes e fotos do(s) seu(s) filho(s).

👉 Acesse aqui: ${clientDashboardLink}`;
        break;
      case 'reminder_24h':
        messageContent = `👋 Olá, ${name}!
Estamos muito felizes em tê-lo(a) conosco na Memory School Fotografia.

Se ainda não explorou sua área do cliente, aproveite para conhecer todos os recursos e novidades disponíveis.

✨ Acesse sua conta: ${clientDashboardLink}`;
        break;
      // Add more message templates here for future notifications (e.g., 'photos_available', 'payment_reminder', 'promotion')
      default:
        return new Response(JSON.stringify({ error: 'Invalid messageType provided.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Simulate sending message to WhatsApp API
    console.log(`Simulating WhatsApp message (${messageType}) to ${phone}:`);
    console.log(messageContent);
    console.log(`Using API Key: ${whatsappApiKey ? '********' : 'NOT SET'}`); // Mask key for logs

    // Example fetch call (uncomment and modify for your actual API)
    /*
    const whatsappResponse = await fetch(whatsappApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${whatsappApiKey}`, // Or whatever auth your API uses
      },
      body: JSON.stringify({
        to: phone,
        message: messageContent,
        // Other parameters required by your WhatsApp API
      }),
    });

    if (!whatsappResponse.ok) {
      const errorText = await whatsappResponse.text();
      console.error('Failed to send WhatsApp message:', whatsappResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Failed to send WhatsApp message', details: errorText }), {
        status: whatsappResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    */

    return new Response(JSON.stringify({ message: `WhatsApp message (${messageType}) simulated successfully.` }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error in send-whatsapp-message Edge Function:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});