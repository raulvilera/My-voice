/**
 * supabase/functions/mp-payment/index.ts
 *
 * Edge Function Supabase — processa pagamento via Mercado Pago.
 * Recebe token do cartão (gerado pelo MP.js no frontend) + metadados,
 * chama a API do MP e retorna o status do pagamento.
 *
 * ─── Deploy ───────────────────────────────────────────────────────────
 * 1. Instalar CLI:  npm install -g supabase
 * 2. Login:         supabase login
 * 3. Link projeto:  supabase link --project-ref ppzvwhkvwupmfmijrkkl
 * 4. Setar secret:  supabase secrets set MP_ACCESS_TOKEN=APP_USR-SEU_ACCESS_TOKEN_AQUI
 * 5. Deploy:        supabase functions deploy mp-payment
 *
 * ─── Access Token ─────────────────────────────────────────────────────
 * NUNCA coloque o Access Token no código. Use:
 *   supabase secrets set MP_ACCESS_TOKEN=APP_USR-xxxx
 * O Access Token está disponível em:
 *   https://www.mercadopago.com.br/developers/panel/app → Credenciais de Produção
 * ──────────────────────────────────────────────────────────────────────
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

serve(async (req: Request) => {
  // ── CORS preflight ──────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  try {
    const {
      token,        // string — token do cartão gerado pelo MP.js
      amount,       // number — valor em reais (ex: 49)
      description,  // string — "My Voice — Plano Pro"
      email,        // string — email do pagador
      cpf,          // string — CPF sem pontuação
      installments, // number — número de parcelas (1, 2, 3…)
      plano_id,     // string — 'pro' | 'escola' (para log)
    } = await req.json();

    // Validações básicas no backend
    if (!token || !amount || !email || !cpf) {
      return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios ausentes.' }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN');
    if (!ACCESS_TOKEN) {
      console.error('MP_ACCESS_TOKEN não configurado');
      return new Response(JSON.stringify({ error: 'Configuração de pagamento incompleta.' }), {
        status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // ── Chamada à API do Mercado Pago ───────────────────────────────────
    const body = {
      transaction_amount: Number(amount),
      token,
      description,
      installments: Number(installments) || 1,
      payment_method_id: undefined as string | undefined, // MP detecta automaticamente pelo token
      payer: {
        email,
        identification: { type: 'CPF', number: cpf },
      },
      // Metadados internos (ficam visíveis no painel do MP)
      metadata: { plano_id, plataforma: 'my-voice' },
      // Webhook (configurar no painel do MP ou via API de Webhooks)
      // notification_url: 'https://ppzvwhkvwupmfmijrkkl.supabase.co/functions/v1/mp-webhook',
    };

    const mpResp = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        // Idempotency key previne cobranças duplicadas em retry
        'X-Idempotency-Key': `${email}-${plano_id}-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const pagamento = await mpResp.json();

    console.log(`[mp-payment] status=${pagamento.status} detail=${pagamento.status_detail} id=${pagamento.id}`);

    if (!mpResp.ok) {
      // Erro da API do MP (ex: token expirado, dados inválidos)
      const msg = pagamento.message || pagamento.error || 'Erro no gateway de pagamento.';
      return new Response(JSON.stringify({ error: msg }), {
        status: 422, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    // Retorna apenas os campos necessários para o frontend
    return new Response(
      JSON.stringify({
        id:            pagamento.id,
        status:        pagamento.status,        // approved | pending | rejected | in_process
        status_detail: pagamento.status_detail, // cc_rejected_insufficient_amount etc
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    console.error('[mp-payment] Erro interno:', err);
    return new Response(JSON.stringify({ error: 'Erro interno. Tente novamente.' }), {
      status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
