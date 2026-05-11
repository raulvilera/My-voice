import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Save, Eye, MessageCircle, BookMarked, Grid3x3, PenLine, Bot } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import styles from './NovaAula.module.css';

// ── Agente IA: registra atividade automaticamente após salvar ─────────────────
const EDGE_URL = 'https://ppzvwhkvwupmfmijrkkl.supabase.co/functions/v1/registrar-atividade';

const dispararAgenteRegistro = async ({ aula_id, professor_id, titulo, subtitulo, tag, secoes, origem }) => {
  try {
    const resp = await fetch(EDGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aula_id, professor_id, titulo, subtitulo, tag, secoes, origem }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.registro || null;
  } catch {
    return null; // falha silenciosa — não bloqueia o fluxo principal
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2);

const SECAO_INFO = {
  dialogo:     { label: 'Diálogo',     icon: <MessageCircle size={16}/>, cor: '#8b5cf6' },
  verbos:      { label: 'Verbos',      icon: <BookMarked   size={16}/>, cor: '#06b6d4' },
  vocabulario: { label: 'Vocabulário', icon: <Grid3x3      size={16}/>, cor: '#ec4899' },
  exercicios:  { label: 'Exercícios',  icon: <PenLine      size={16}/>, cor: '#f59e0b' },
};

// ── Editor Diálogo ────────────────────────────────────────────────────────────
const EditorDialogo = ({ dados, onChange }) => {
  const addFala = () => onChange({ ...dados, falas: [...(dados.falas||[]), { id: uid(), personagem: 'Linda', texto: '' }] });
  const removeFala = (id) => onChange({ ...dados, falas: dados.falas.filter(f => f.id !== id) });
  const updateFala = (id, campo, val) => onChange({ ...dados, falas: dados.falas.map(f => f.id === id ? { ...f, [campo]: val } : f) });

  return (
    <div className={styles.editorBlock}>
      <div className={styles.personagensRow}>
        <label>Personagem A:</label>
        <input value={dados.personagens?.[0]||'Linda'} onChange={e => onChange({ ...dados, personagens: [e.target.value, dados.personagens?.[1]||'Glynda'] })} placeholder="Ex: Linda"/>
        <label>Personagem B:</label>
        <input value={dados.personagens?.[1]||'Glynda'} onChange={e => onChange({ ...dados, personagens: [dados.personagens?.[0]||'Linda', e.target.value] })} placeholder="Ex: Glynda"/>
      </div>
      <div className={styles.falasList}>
        {(dados.falas||[]).map((fala, i) => (
          <div key={fala.id} className={styles.falaRow}>
            <select value={fala.personagem} onChange={e => updateFala(fala.id, 'personagem', e.target.value)}>
              <option>{dados.personagens?.[0]||'Linda'}</option>
              <option>{dados.personagens?.[1]||'Glynda'}</option>
            </select>
            <input value={fala.texto} onChange={e => updateFala(fala.id, 'texto', e.target.value)} placeholder={`Fala ${i+1}…`}/>
            <button className={styles.removeBtn} onClick={() => removeFala(fala.id)}><Trash2 size={14}/></button>
          </div>
        ))}
      </div>
      <button className={styles.addBtn} onClick={addFala}><Plus size={14}/> Adicionar fala</button>
    </div>
  );
};

// ── Editor Verbos ─────────────────────────────────────────────────────────────
const EditorVerbos = ({ dados, onChange }) => {
  const addVerbo = () => onChange({ ...dados, verbos: [...(dados.verbos||[]), { id: uid(), verbo: '', presente: '', passado: '', participio: '' }] });
  const removeVerbo = (id) => onChange({ ...dados, verbos: dados.verbos.filter(v => v.id !== id) });
  const updateVerbo = (id, campo, val) => onChange({ ...dados, verbos: dados.verbos.map(v => v.id === id ? { ...v, [campo]: val } : v) });

  return (
    <div className={styles.editorBlock}>
      <div className={styles.verbosHeader}>
        <span>Verbo</span><span>Presente</span><span>Passado</span><span>Particípio</span><span></span>
      </div>
      {(dados.verbos||[]).map(v => (
        <div key={v.id} className={styles.verboRow}>
          <input value={v.verbo}      onChange={e => updateVerbo(v.id, 'verbo', e.target.value)}      placeholder="TO BE (ser/estar)"/>
          <input value={v.presente}   onChange={e => updateVerbo(v.id, 'presente', e.target.value)}   placeholder="am/is/are"/>
          <input value={v.passado}    onChange={e => updateVerbo(v.id, 'passado', e.target.value)}    placeholder="was/were"/>
          <input value={v.participio} onChange={e => updateVerbo(v.id, 'participio', e.target.value)} placeholder="been"/>
          <button className={styles.removeBtn} onClick={() => removeVerbo(v.id)}><Trash2 size={14}/></button>
        </div>
      ))}
      <button className={styles.addBtn} onClick={addVerbo}><Plus size={14}/> Adicionar verbo</button>
    </div>
  );
};

// ── Editor Vocabulário ────────────────────────────────────────────────────────
const EditorVocab = ({ dados, onChange }) => {
  const addPalavra = () => onChange({ ...dados, palavras: [...(dados.palavras||[]), { id: uid(), en: '', pt: '' }] });
  const removePalavra = (id) => onChange({ ...dados, palavras: dados.palavras.filter(p => p.id !== id) });
  const updatePalavra = (id, campo, val) => onChange({ ...dados, palavras: dados.palavras.map(p => p.id === id ? { ...p, [campo]: val } : p) });

  return (
    <div className={styles.editorBlock}>
      <div className={styles.vocabHeader}><span>Inglês</span><span>Português</span><span></span></div>
      {(dados.palavras||[]).map(p => (
        <div key={p.id} className={styles.vocabRow}>
          <input value={p.en} onChange={e => updatePalavra(p.id, 'en', e.target.value)} placeholder="English"/>
          <input value={p.pt} onChange={e => updatePalavra(p.id, 'pt', e.target.value)} placeholder="Português"/>
          <button className={styles.removeBtn} onClick={() => removePalavra(p.id)}><Trash2 size={14}/></button>
        </div>
      ))}
      <button className={styles.addBtn} onClick={addPalavra}><Plus size={14}/> Adicionar palavra</button>
    </div>
  );
};

// ── Editor Exercícios ─────────────────────────────────────────────────────────
const EditorExercicios = ({ dados, onChange }) => {
  const addGrupo = () => onChange({ ...dados, grupos: [...(dados.grupos||[]), { id: uid(), instrucao: '', questoes: [] }] });
  const removeGrupo = (gid) => onChange({ ...dados, grupos: dados.grupos.filter(g => g.id !== gid) });
  const updateGrupo = (gid, campo, val) => onChange({ ...dados, grupos: dados.grupos.map(g => g.id === gid ? { ...g, [campo]: val } : g) });
  const addQuestao = (gid) => onChange({ ...dados, grupos: dados.grupos.map(g => g.id === gid ? { ...g, questoes: [...g.questoes, { id: uid(), pergunta: '', resposta: '' }] } : g) });
  const removeQuestao = (gid, qid) => onChange({ ...dados, grupos: dados.grupos.map(g => g.id === gid ? { ...g, questoes: g.questoes.filter(q => q.id !== qid) } : g) });
  const updateQuestao = (gid, qid, campo, val) => onChange({ ...dados, grupos: dados.grupos.map(g => g.id === gid ? { ...g, questoes: g.questoes.map(q => q.id === qid ? { ...q, [campo]: val } : q) } : g) });

  return (
    <div className={styles.editorBlock}>
      {(dados.grupos||[]).map((grupo, gi) => (
        <div key={grupo.id} className={styles.grupoBlock}>
          <div className={styles.grupoHeader}>
            <input value={grupo.instrucao} onChange={e => updateGrupo(grupo.id, 'instrucao', e.target.value)} placeholder={`Instrução do grupo ${gi+1}…`} className={styles.instrucaoInput}/>
            <button className={styles.removeBtn} onClick={() => removeGrupo(grupo.id)}><Trash2 size={14}/></button>
          </div>
          {grupo.questoes.map((q, qi) => (
            <div key={q.id} className={styles.questaoRow}>
              <span className={styles.questaoNum}>{qi+1}.</span>
              <input value={q.pergunta}  onChange={e => updateQuestao(grupo.id, q.id, 'pergunta', e.target.value)}  placeholder="Pergunta (use ___ para lacuna)"/>
              <input value={q.resposta}  onChange={e => updateQuestao(grupo.id, q.id, 'resposta', e.target.value)}  placeholder="Resposta" className={styles.respostaInput}/>
              <button className={styles.removeBtn} onClick={() => removeQuestao(grupo.id, q.id)}><Trash2 size={14}/></button>
            </div>
          ))}
          <button className={styles.addBtnSm} onClick={() => addQuestao(grupo.id)}><Plus size={12}/> Questão</button>
        </div>
      ))}
      <button className={styles.addBtn} onClick={addGrupo}><Plus size={14}/> Adicionar grupo de exercícios</button>
    </div>
  );
};

// ── Seção Card ────────────────────────────────────────────────────────────────
const SecaoCard = ({ secao, onUpdate, onRemove, onMove, isFirst, isLast }) => {
  const [aberta, setAberta] = useState(true);
  const info = SECAO_INFO[secao.tipo];

  const renderEditor = () => {
    switch (secao.tipo) {
      case 'dialogo':     return <EditorDialogo     dados={secao.dados} onChange={d => onUpdate({ ...secao, dados: d })}/>;
      case 'verbos':      return <EditorVerbos      dados={secao.dados} onChange={d => onUpdate({ ...secao, dados: d })}/>;
      case 'vocabulario': return <EditorVocab       dados={secao.dados} onChange={d => onUpdate({ ...secao, dados: d })}/>;
      case 'exercicios':  return <EditorExercicios  dados={secao.dados} onChange={d => onUpdate({ ...secao, dados: d })}/>;
    }
  };

  return (
    <div className={styles.secaoCard} style={{ '--secao-cor': info.cor }}>
      <div className={styles.secaoCardHeader}>
        <div className={styles.secaoCardTitle}>
          <span className={styles.secaoIcone} style={{ background: `${info.cor}22`, color: info.cor }}>{info.icon}</span>
          <input
            className={styles.secaoTituloInput}
            value={secao.titulo}
            onChange={e => onUpdate({ ...secao, titulo: e.target.value })}
            placeholder={`Título da seção de ${info.label}…`}
          />
        </div>
        <div className={styles.secaoCardActions}>
          {!isFirst && <button className={styles.moveBtn} onClick={() => onMove(-1)}>↑</button>}
          {!isLast  && <button className={styles.moveBtn} onClick={() => onMove(1)}>↓</button>}
          <button className={styles.toggleBtn} onClick={() => setAberta(a => !a)}>
            {aberta ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
          </button>
          <button className={styles.removeSecaoBtn} onClick={onRemove}><Trash2 size={16}/></button>
        </div>
      </div>
      {aberta && renderEditor()}
    </div>
  );
};

// ── Nova Aula Principal ───────────────────────────────────────────────────────
const NovaAula = ({ onSalvo }) => {
  const { user } = useAuth();
  const [titulo,    setTitulo]    = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [tag,       setTag]       = useState('Iniciante');
  const [secoes,    setSecoes]    = useState([]);
  const [salvando,  setSalvando]  = useState(false);
  const [erro,      setErro]      = useState('');
  const [sucesso,   setSucesso]   = useState('');
  const [registroIA, setRegistroIA] = useState(null); // feedback do agente

  const addSecao = (tipo) => {
    const defaults = {
      dialogo:     { personagens: ['Linda', 'Glynda'], falas: [] },
      verbos:      { verbos: [] },
      vocabulario: { palavras: [] },
      exercicios:  { grupos: [] },
    };
    setSecoes(prev => [...prev, {
      id: uid(),
      tipo,
      titulo: `${SECAO_INFO[tipo].label}`,
      dados: defaults[tipo],
      ordem: prev.length,
    }]);
  };

  const updateSecao = (id, nova) => setSecoes(prev => prev.map(s => s.id === id ? nova : s));
  const removeSecao = (id) => setSecoes(prev => prev.filter(s => s.id !== id));
  const moveSecao = (id, dir) => {
    setSecoes(prev => {
      const idx = prev.findIndex(s => s.id === id);
      const nova = [...prev];
      const [item] = nova.splice(idx, 1);
      nova.splice(idx + dir, 0, item);
      return nova;
    });
  };

  const salvar = async (publicar = false) => {
    if (!titulo.trim()) { setErro('Informe o título da aula.'); return; }
    if (secoes.length === 0) { setErro('Adicione pelo menos uma seção.'); return; }
    setErro(''); setSalvando(true);
    try {
      // Busca o próximo número de aula
      const { data: aulasExist } = await supabase.from('aulas').select('numero').order('numero', { ascending: false }).limit(1);
      const numero = (aulasExist?.[0]?.numero || 0) + 1;

      // Insere a aula
      const { data: aula, error: aulaErr } = await supabase
        .from('aulas')
        .insert({ numero, titulo: titulo.trim(), subtitulo: subtitulo.trim(), tag, publicada: publicar })
        .select().single();
      if (aulaErr) throw aulaErr;

      // Insere as seções
      const secoesData = secoes.map((s, i) => ({
        aula_id: aula.id,
        tipo: s.tipo,
        titulo: s.titulo,
        conteudo: s.dados,
        ordem: i,
      }));
      const { error: secErr } = await supabase.from('secoes').insert(secoesData);
      if (secErr) throw secErr;

      // ── Dispara o agente de IA para registrar a atividade (assíncrono) ────
      dispararAgenteRegistro({
        aula_id: aula.id,
        professor_id: user?.id,
        titulo: titulo.trim(),
        subtitulo: subtitulo.trim(),
        tag,
        secoes: secoesData,
        origem: 'manual',
      }).then(reg => { if (reg) setRegistroIA(reg); });

      setSucesso(publicar ? 'Aula publicada com sucesso!' : 'Aula salva como rascunho!');
      setTitulo(''); setSubtitulo(''); setSecoes([]);
      setTimeout(() => { setSucesso(''); onSalvo?.(); }, 2000);
    } catch (e) {
      setErro('Erro ao salvar: ' + e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className={styles.novaAulaContainer}>
      <div className={styles.aulaMetaCard}>
        <h3>Informações da Aula</h3>
        <div className={styles.metaFields}>
          <div className={styles.metaField}>
            <label>Título *</label>
            <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Linda & Glynda – Aula 3"/>
          </div>
          <div className={styles.metaField}>
            <label>Subtítulo</label>
            <input value={subtitulo} onChange={e => setSubtitulo(e.target.value)} placeholder="Ex: Presente Contínuo · Rotina"/>
          </div>
          <div className={styles.metaField}>
            <label>Nível</label>
            <select value={tag} onChange={e => setTag(e.target.value)}>
              <option>Iniciante</option>
              <option>Intermediário</option>
              <option>Avançado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Adicionar seções */}
      <div className={styles.addSecoesBar}>
        <span>Adicionar seção:</span>
        {Object.entries(SECAO_INFO).map(([tipo, info]) => (
          <button key={tipo} className={styles.addSecaoBtn} style={{ '--cor': info.cor }} onClick={() => addSecao(tipo)}>
            {info.icon} {info.label}
          </button>
        ))}
      </div>

      {/* Seções */}
      {secoes.length === 0 ? (
        <div className={styles.emptySecoes}>
          <p>Nenhuma seção adicionada. Clique acima para começar.</p>
        </div>
      ) : (
        <div className={styles.secoesList}>
          {secoes.map((s, i) => (
            <SecaoCard
              key={s.id}
              secao={s}
              onUpdate={nova => updateSecao(s.id, nova)}
              onRemove={() => removeSecao(s.id)}
              onMove={dir => moveSecao(s.id, dir)}
              isFirst={i === 0}
              isLast={i === secoes.length - 1}
            />
          ))}
        </div>
      )}

      {erro    && <div className={styles.erro}>{erro}</div>}
      {sucesso && <div className={styles.sucesso}>{sucesso}</div>}

      {/* Feedback do Agente IA após salvar */}
      {registroIA && (
        <div className={styles.agenteCard}>
          <div className={styles.agenteHeader}>
            <Bot size={16} style={{ color: '#8b5cf6' }} />
            <strong>Agente IA registrou sua atividade</strong>
          </div>
          <p className={styles.agenteResumo}>{registroIA.resumo}</p>
          {registroIA.objetivos?.length > 0 && (
            <ul className={styles.agenteList}>
              {registroIA.objetivos.map((o, i) => <li key={i}>{o}</li>)}
            </ul>
          )}
          {registroIA.sugestao_uso && (
            <p className={styles.agenteSugestao}>💡 {registroIA.sugestao_uso}</p>
          )}
          {registroIA.tags_automaticas?.length > 0 && (
            <div className={styles.agenteTags}>
              {registroIA.tags_automaticas.map((t, i) => (
                <span key={i} className={styles.agenteTag}>{t}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.saveBar}>
        <button className={styles.saveRascunhoBtn} onClick={() => salvar(false)} disabled={salvando}>
          <Save size={16}/> {salvando ? 'Salvando…' : 'Salvar Rascunho'}
        </button>
        <button className={styles.publishBtn} onClick={() => salvar(true)} disabled={salvando}>
          <Eye size={16}/> {salvando ? 'Publicando…' : 'Publicar Aula'}
        </button>
      </div>
    </div>
  );
};

export default NovaAula;
