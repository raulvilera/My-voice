
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Loader2, Volume2, Type, Save } from "lucide-react";

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

  // Sincronizar volume do elemento <video> com o slider
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = Math.min(volume / 100, 1);
    }
  }, [volume]);

  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const metadata: VideoMetadata = {
        titulo,
        descricao,
        // FIX: volume > 100 é apenas representação visual do slider;
        // para a API de áudio real seria necessário Web Audio API + OfflineAudioContext.
        // Por ora, salva o valor numérico como metadado e aplica no <video> via useEffect.
        volume,
        legenda,
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
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-6 bg-card">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-card-foreground">
          Editor de Vídeo
        </h2>

        {/* Visualização do vídeo */}
        <div className="bg-black rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onLoadedMetadata={handleMetadataLoaded}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Informações do vídeo */}
        <div className="p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p>
            Duração:{" "}
            <span className="font-semibold">{formatTime(videoDuration)}</span>
          </p>
          <p>
            Tamanho:{" "}
            <span className="font-semibold">
              {(videoBlob.size / 1024 / 1024).toFixed(2)}MB
            </span>
          </p>
        </div>

        {/* Formulário de metadados */}
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Título do Vídeo
            </label>
            <Input
              type="text"
              placeholder="Ex: Aula de Verbos Irregulares"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descrição
            </label>
            <Textarea
              placeholder="Descreva o conteúdo do vídeo..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full min-h-24"
            />
          </div>

          {/* Legenda */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Type size={16} />
              Legenda (opcional)
            </label>
            <Textarea
              placeholder="Adicione legendas ou transcrição..."
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              className="w-full min-h-20"
            />
          </div>

          {/* Controle de volume */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Volume2 size={16} />
              Volume: {volume}%
            </label>
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              min={0}
              max={150}
              step={5}
              className="w-full"
            />
          </div>
        </div>

        {/* Controles de ação */}
        <div className="flex gap-3 justify-end flex-wrap">
          <Button onClick={onCancel} variant="outline">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !titulo.trim()}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} />
                Salvar Edições
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default VideoEditor;
