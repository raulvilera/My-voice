import React, { useRef, useState,
useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Mic, Square, Play, Download } from "lucide-react";

interface VideoRecorderProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  onClose?: () => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({
  onRecordingComplete,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);

  // Inicializar câmera e microfone
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError(
          "Não foi possível acessar câmera/microfone. Verifique as permissões."
        );
        console.error("Erro ao acessar mídia:", err);
      }
    };

    initializeMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = () => {
    if (!stream) {
      setError("Câmera/microfone não inicializados");
      return;
    }

    chunksRef.current = [];
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      setIsPreviewing(true);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
    startTimeRef.current = Date.now();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      const recordedDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setDuration(recordedDuration);
    }
  };

  const resetRecording = () => {
    setRecordedBlob(null);
    setIsPreviewing(false);
    setDuration(0);
    chunksRef.current = [];
  };

  const handleConfirmRecording = () => {
    if (recordedBlob && onRecordingComplete) {
      onRecordingComplete(recordedBlob, duration);
      resetRecording();
    }
  };

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6 bg-card">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-card-foreground">
          Gravador de Vídeo
        </h2>

        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded-lg">
            {error}
          </div>
        )}

        {!isPreviewing ? (
          <>
            {/* Visualização ao vivo */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-sm font-semibold">
                    Gravando
                  </span>
                </div>
              )}
            </div>

            {/* Controles de gravação */}
            <div className="flex gap-3 justify-center">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Mic size={18} />
                  Iniciar Gravação
                </Button>
              ) : (
                <Button
                  onClick={stopRecording}
                  className="gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Square size={18} />
                  Parar Gravação
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Visualização da gravação */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video">
              <video
                src={recordedBlob ? URL.createObjectURL(recordedBlob) : ""}
                controls
                className="w-full h-full object-cover"
              />
            </div>

            {/* Informações da gravação */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Duração: <span className="font-semibold">{duration}s</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Tamanho: <span className="font-semibold">
                  {(recordedBlob?.size || 0) / 1024 / 1024}MB
                </span>
              </p>
            </div>

            {/* Controles de confirmação */}
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                onClick={handleConfirmRecording}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Play size={18} />
                Confirmar e Continuar
              </Button>
              <Button
                onClick={downloadRecording}
                variant="outline"
                className="gap-2"
              >
                <Download size={18} />
                Baixar Vídeo
              </Button>
              <Button
                onClick={resetRecording}
                variant="outline"
                className="gap-2"
              >
                Gravar Novamente
              </Button>
            </div>
          </>
        )}

        {/* Botão fechar */}
        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Fechar
          </Button>
        )}
      </div>
    </Card>
  );
};

export default VideoRecorder;

