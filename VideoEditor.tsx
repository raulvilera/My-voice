import React, { useRef, useState, useEffect } from "react";
import { Volume2, Type, Save, Loader2 } from "lucide-react";

interface VideoEditorProps {
  videoBlob: Blob;
  onSave?: (editedBlob: Blob, metadata: VideoMetadata) => void;
  onCancel?: () => void;
}

interface VideoMetadata {
  titulo: string;
  descricao: string;
  volume: number;
  legenda?: string;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({
  videoBlob,
  onSave,
  onCancel,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [volume, setVolume] = useState(100);
  const [legenda, setLegenda] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    const url = URL.createObjectURL(videoBlob);
    setVideoUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoBlob]);

  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (videoRef.current) {
        videoRef.current.volume = volume / 100;
      }

      const metadata: VideoMetadata = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        volume,
        legenda: legenda.trim(),
      };

      if (onSave) {
        onSave(videoBlob, metadata);
      }
    } catch (error) {
      console.error("Erro ao salvar edições:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Inline styles premium matching the Dark Glassmorphism aesthetic
  const containerStyle: React.CSSProperties = {
    background: "rgba(30, 41, 59, 0.75)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
    color: "#e2e8f0",
    fontFamily: "'Outfit', system-ui, sans-serif",
  };

  const headerStyle: React.CSSProperties = {
    fontSize: "1.1rem",
    fontWeight: 800,
    color: "#f8fafc",
    marginBottom: "0.2rem",
  };

  const videoBoxStyle: React.CSSProperties = {
    width: "100%",
    aspectRatio: "16 / 9",
    borderRadius: "14px",
    overflow: "hidden",
    background: "#0a0f1e",
    border: "2px solid rgba(255, 255, 255, 0.07)",
  };

  const videoStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  const infoBoxStyle: React.CSSProperties = {
    padding: "0.85rem 1rem",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    fontSize: "0.82rem",
    color: "#94a3b8",
    display: "flex",
    justifyContent: "space-between",
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "0.4rem",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.65rem 0.9rem",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "10px",
    color: "#e2e8f0",
    fontSize: "0.88rem",
    fontFamily: "inherit",
    boxSizing: "border-box",
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: "80px",
    resize: "vertical",
  };

  const rangeStyle: React.CSSProperties = {
    width: "100%",
    accentColor: "#8b5cf6",
    height: "6px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "999px",
    cursor: "pointer",
    outline: "none",
  };

  const controlsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end",
    marginTop: "1rem",
  };

  const btnSaveStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.65rem 1.5rem",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "#fff",
    border: "none",
    fontSize: "0.88rem",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.15s",
  };

  const btnCancelStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.45rem",
    padding: "0.65rem 1.25rem",
    borderRadius: "999px",
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    color: "#94a3b8",
    fontSize: "0.85rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  };

  return (
    <div style={containerStyle}>
      <h2 style={headerStyle}>Editor de Vídeo-Aula</h2>

      {/* Visualização do vídeo */}
      <div style={videoBoxStyle}>
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          onLoadedMetadata={handleMetadataLoaded}
          style={videoStyle}
        />
      </div>

      {/* Informações do vídeo */}
      <div style={infoBoxStyle}>
        <span>Duração: <strong>{formatTime(videoDuration)}</strong></span>
        <span>Tamanho: <strong>{(videoBlob.size / 1024 / 1024).toFixed(2)} MB</strong></span>
      </div>

      {/* Formulário de metadados */}
      <div style={formStyle}>
        <div>
          <label style={labelStyle}>Título do Vídeo</label>
          <input
            type="text"
            placeholder="Ex: Explicação de Verbos Irregulares"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Descrição (Conteúdo do Vídeo)</label>
          <textarea
            placeholder="Descreva o conteúdo para seus alunos..."
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            <Type size={14} /> Legenda ou Transcrição (Opcional)
          </label>
          <textarea
            placeholder="Adicione transcrição de diálogos ou anotações extras..."
            value={legenda}
            onChange={(e) => setLegenda(e.target.value)}
            style={textareaStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            <Volume2 size={14} /> Volume do Vídeo: {volume}%
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={rangeStyle}
            />
          </div>
        </div>
      </div>

      {/* Controles de ação */}
      <div style={controlsStyle}>
        <button
          onClick={onCancel}
          style={btnCancelStyle}
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !titulo.trim()}
          style={{
            ...btnSaveStyle,
            opacity: isSaving || !titulo.trim() ? 0.6 : 1,
            cursor: isSaving || !titulo.trim() ? "not-allowed" : "pointer",
          }}
        >
          {isSaving ? (
            <>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
              Salvando...
            </>
          ) : (
            <>
              <Save size={18} />
              Salvar Edições
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default VideoEditor;
