import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X, RotateCcw, MessageCircle, BookMarked, Grid3x3, PenLine, Play, Square, Volume2 } from 'lucide-react';
import styles from '../pages/Trilha.module.css';

// ── Vocabulário ───────────────────────────────────────────────────────────────
export const SecaoVocabulario = ({ section }) => {
  const [revealed, setRevealed] = useState({});
  return (
    <div className={styles.sectionBlock}>
      <h3 className={styles.sectionTitle}>
        <Grid3x3 size={20}/> {section.titulo}
        <span className={styles.hint}>Clique para ver a tradução</span>
      </h3>
      <div className={styles.vocabGrid}>
        {section.palavras.map((p, i) => (
          <div key={i} className={`${styles.vocabCard} ${revealed[i] ? styles.vocabRevealed : ''}`} onClick={() => setRevealed(prev => ({ ...prev, [i]: !prev[i] }))}>
            <span className={styles.vocabEn}>{p.en}</span>
            <span className={styles.vocabPt}>{revealed[i] ? p.pt : '···'}</span>
          </div>
        ))}
      </div>
    </div>
  );
};



