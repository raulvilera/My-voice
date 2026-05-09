/**
 * supabase/functions/mp-webhook/index.ts
 *
 * Recebe notificações do Mercado Pago (webhooks) e atualiza o plano
 * automaticamente quando um pagamento é aprovado, cancelado ou expirado.
 *
 * ─── Configurar webhook no painel do MP ───────────────────────────────
 * URL: https://ppzvwhkvwupmfmijrkkl.supabase.co/functions/v1/mp-webhook
 * Eventos: payment (todos os status)
 *
 * ─── Deploy ───────────────────────────────────────────────────────────
 * supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
 * supabase functions deploy mp-webhook
 * ──────────────────────────────────────────────────────────────────────
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const payload = await req.json();

    if (payload.type !== 'payment') {
      return new Response('OK', { status: 200, headers: CORS_HEADERS });
    }

    const paymentId = payload.data?.id;
    if (!paymentId) return new Response('OK', { status: 200, headers: CORS_HEADERS });

    const ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')!;
    const mpResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}` },
    });
    const pagamento = await mpResp.json();

    const status   = pagamento.status;
    const plano_id = pagamento.metadata?.plano_id;
    const email    = pagamento.payer?.email;

    console.log(`[mp-webhook] payment=${paymentId} status=${status} plano=${plano_id} email=${email}`);

    if (!email || !plano_id) {
      return new Response('OK', { status: 200, headers: CORS_HEADERS });
    }

    const supabase = createClient(
      'https://ppzvwhkvwupmfmijrkkl.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    if (status === 'approved') {
      const vencimento = new Date();
      vencimento.setMonth(vencimento.getMonth() + 1);

      await supabase
        .from('profiles')
        .update({
          plano: plano_id,
          plano_inicio: new Date().toISOString(),
          plano_vencimento: vencimento.toISOString(),
          mp_payment_id: String(paymentId),
        })
        .eq('email', email);

      console.log(`[mp-webhook] Plano ${plano_id} ativado para ${email}`);

    } else if (['cancelled', 'refunded', 'charged_back'].includes(status)) {
      await supabase
        .from('profiles')
        .update({ plano: 'basico', plano_vencimento: null })
        .eq('email', email);

      console.log(`[mp-webhook] Plano revertido para básico (${status}) — ${email}`);
    }

    return new Response('OK', { status: 200, headers: CORS_HEADERS });

  } catch (err) {
    console.error('[mp-webhook] Erro:', err);
    return new Response('Error', { status: 500, headers: CORS_HEADERS });
  }
});
