/**
 * supabase/functions/registrar-atividade/index.ts
 *
 * Agente de IA — My Voice
 *
 * Disparado automaticamente sempre que uma aula é salva (pelo NovaAula ou
 * pelo UploadDocumento). O agente:
 *   1. Recebe os dados da aula recém-criada
 *   2. Usa Claude para gerar um registro pedagógico estruturado
 *   3. Salva o registro na tabela `atividades_registro` no Supabase
 *   4. Retorna o resumo gerado para exibição opcional no frontend
 *
 * ─── Deploy ───────────────────────────────────────────────────────────
 * supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
 * supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
 * supabase functions deploy registrar-atividade
 * ──────────────────────────────────────────────────────────────────────
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
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
      aula_id,
      professor_id,
      titulo,
      subtitulo,
      tag,
      secoes,
      origem,
    } = await req.json();

    if (!aula_id || !professor_id || !titulo) {
      return new Response(JSON.stringify({ error: 'Parâmetros obrigatórios ausentes.' }), {
        status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const resumoSecoes = (secoes || []).map((s: any) => {
      const tipo = s.tipo;
      const c = s.conteudo || {};
      let detalhes = '';
      if (tipo === 'dialogo' && c.falas?.length)
        detalhes = `${c.falas.length} falas entre ${c.personagens?.join(' e ')}`;
      else if (tipo === 'verbos' && c.verbos?.length)
        detalhes = `${c.verbos.length} verbo(s): ${c.verbos.slice(0,3).map((v: any) => v.verbo).join(', ')}`;
      else if (tipo === 'vocabulario' && c.palavras?.length)
        detalhes = `${c.palavras.length} palavra(s): ${c.palavras.slice(0,4).map((p: any) => p.en).join(', ')}`;
      else if (tipo === 'exercicios' && c.grupos?.length)
        detalhes = `${c.grupos.reduce((acc: number, g: any) => acc + (g.questoes?.length || 0), 0)} questão(ões) em ${c.grupos.length} grupo(s)`;
      return `  - [${tipo}] "${s.titulo}": ${detalhes}`;
    }).join('\n');

    const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

    const prompt = `Você é um agente pedagógico da plataforma "My Voice" de ensino de inglês para brasileiros.

Uma professora acabou de registrar uma nova atividade na plataforma. Gere um REGISTRO PEDAGÓGICO estruturado.

Dados da atividade:
- Título: "${titulo}"
- Subtítulo: "${subtitulo || '-'}"
- Nível: ${tag || 'Iniciante'}
- Origem: ${origem === 'upload' ? 'Importada de documento (IA converteu)' : 'Criada manualmente'}
- Seções:
${resumoSecoes || '  (nenhuma seção detalhada)'}

Retorne APENAS um JSON válido, sem markdown, no formato:
{
  "resumo": "Uma frase resumindo o conteúdo pedagógico da aula (máx 120 chars)",
  "objetivos": ["objetivo 1", "objetivo 2", "objetivo 3"],
  "habilidades_bncc": ["habilidade 1", "habilidade 2"],
  "sugestao_uso": "Uma dica de como usar essa aula em sala (máx 150 chars)",
  "nivel_detectado": "Iniciante | Intermediário | Avançado",
  "tags_automaticas": ["tag1", "tag2", "tag3"]
}`;

    const aiResp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const aiData = await aiResp.json();
    const rawText = aiData.content?.find((b: any) => b.type === 'text')?.text || '{}';
    const clean = rawText.replace(/```json|```/g, '').trim();

    let registro: any = {};
    try { registro = JSON.parse(clean); } catch { registro = { resumo: 'Registro gerado automaticamente.' }; }

    const supabase = createClient(
      'https://ppzvwhkvwupmfmijrkkl.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: registroSalvo, error: dbErr } = await supabase
      .from('atividades_registro')
      .insert({
        aula_id,
        professor_id,
        titulo_aula: titulo,
        nivel: registro.nivel_detectado || tag || 'Iniciante',
        origem: origem || 'manual',
        resumo: registro.resumo || '',
        objetivos: registro.objetivos || [],
        habilidades_bncc: registro.habilidades_bncc || [],
        sugestao_uso: registro.sugestao_uso || '',
        tags_automaticas: registro.tags_automaticas || [],
        num_secoes: (secoes || []).length,
        metadados_ia: registro,
      })
      .select()
      .single();

    if (dbErr) {
      console.error('[registrar-atividade] Erro ao salvar registro:', dbErr.message);
    } else {
      console.log(`[registrar-atividade] Registro criado: ${registroSalvo.id} para aula ${aula_id}`);
    }

    return new Response(
      JSON.stringify({ ok: true, registro }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );

  } catch (err) {
    console.error('[registrar-atividade] Erro interno:', err);
    return new Response(JSON.stringify({ error: 'Erro interno.' }), {
      status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
