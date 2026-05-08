import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X, RotateCcw, MessageCircle, BookMarked, Grid3x3, PenLine, Play, Square, Volume2 } from 'lucide-react';
import styles from '../pages/Trilha.module.css';

// ── Verbos ────────────────────────────────────────────────────────────────────
export const SecaoVerbos = ({ section }) => (
  <div className={styles.sectionBlock}>
    <h3 className={styles.sectionTitle}><BookMarked size={20}/> {section.titulo}</h3>
    <div className={styles.tableWrapper}>
      <table className={styles.verbTable}>
        <thead><tr><th>Verbo</th><th>Presente</th><th>Passado</th><th>Particípio</th></tr></thead>
        <tbody>
          {section.verbos.map((v, i) => (
            <tr key={i}>
              <td className={styles.verbName}>{v.verbo}</td>
              <td><span className={styles.verbForm}>{v.presente}</span></td>
              <td><span className={styles.verbForm}>{v.passado}</span></td>
              <td><span className={styles.verbForm}>{v.participio}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);



