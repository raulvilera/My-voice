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
      token,
      amount,
      description,
      email,
      cpf,
      installments,
      plano_id,
    } = await req.json();

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

    const body = {
      transaction_amount: Number(amount),
      token,
      description,
      installments: Number(installments) || 1,
      payment_method_id: undefined as string | undefined,
      payer: {
        email,
        identification: { type: 'CPF', number: cpf },
      },
      metadata: { plano_id, plataforma: 'my-voice' },
    };

    const mpResp = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'X-Idempotency-Key': `${email}-${plano_id}-${Date.now()}`,
      },
      body: JSON.stringify(body),
    });

    const pagamento = await mpResp.json();

    console.log(`[mp-payment] status=${pagamento.status} detail=${pagamento.status_detail} id=${pagamento.id}`);

    if (!mpResp.ok) {
      const msg = pagamento.message || pagamento.error || 'Erro no gateway de pagamento.';
      return new Response(JSON.stringify({ error: msg }), {
        status: 422, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        id:            pagamento.id,
        status:        pagamento.status,
        status_detail: pagamento.status_detail,
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
