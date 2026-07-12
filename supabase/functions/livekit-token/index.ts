import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { AccessToken } from "npm:livekit-server-sdk";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { room, identity, name, isProfessora } = body;

    if (!room || !identity) {
      return new Response(JSON.stringify({ error: 'room and identity are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');

    if (!apiKey || !apiSecret) {
      return new Response(JSON.stringify({ error: 'LiveKit keys not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: identity,
      name: name,
    });

    // Se for a professora, pode publicar vídeo, áudio, tela.
    // Se for aluno, por enquanto apenas assiste (subscribe) para não virar bagunça.
    at.addGrant({
      roomJoin: true,
      room: room,
      canPublish: isProfessora,
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return new Response(JSON.stringify({ token }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
