
import React, { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2 } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string;
  titulo?: string;
  descricao?: string;
  legenda?: string;
  onPlay?: () => void;
  isLoading?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  titulo,
  descricao,
  legenda,
  onPlay,
  isLoading = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
      if (onPlay) onPlay();
    }
  };

  const handleMuteToggle = () => {
    if (!videoRef.current) return;
    const next = !isMuted;
    videoRef.current.muted = next;
    setIsMuted(next);
  };

  // FIX: fullscreen cross-browser com vendor prefixes
  const handleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await (
          containerRef.current.requestFullscreen?.() ??
          (containerRef.current as any).webkitRequestFullscreen?.()
        );
      } else {
        await (
          document.exitFullscreen?.() ??
          (document as any).webkitExitFullscreen?.()
        );
      }
    } catch {
      // silenciar erros de fullscreen em ambientes restritos
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full bg-card p-6">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <Loader2 size={48} className="animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-card overflow-hidden">
      <div
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden aspect-video group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video */}
        <video
          ref={videoRef}
          src={videoUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        />

        {/* Controles */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Barra de progresso */}
          <div className="mb-3">
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Controles inferiores */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <Button
                onClick={handlePlayPause}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>

              {/* Mute */}
              <Button
                onClick={handleMuteToggle}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>

              {/* Tempo */}
              <span className="text-white text-sm ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Fullscreen */}
            <Button
              onClick={handleFullscreen}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <Maximize size={20} />
            </Button>
          </div>
        </div>

        {/* Overlay de play ao clicar */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer hover:bg-black/50 transition-colors"
            onClick={handlePlayPause}
          >
            <Play size={64} className="text-white fill-white" />
          </div>
        )}
      </div>

      {/* Informações do vídeo */}
      {(titulo || descricao) && (
        <div className="p-4 space-y-2">
          {titulo && (
            <h3 className="text-lg font-semibold text-foreground">{titulo}</h3>
          )}
          {descricao && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {descricao}
            </p>
          )}
        </div>
      )}

      {/* Legenda */}
      {legenda && (
        <div className="p-4 bg-muted border-t border-border">
          <p className="text-sm text-foreground whitespace-pre-wrap">{legenda}</p>
        </div>
      )}
    </Card>
  );
};

export default VideoPlayer;
