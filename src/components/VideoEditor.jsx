import { useState, useRef, useEffect } from 'react';
import { 
  Music, Volume2, Save, X, Loader2, Play, 
  Pause, CheckCircle, Headphones, Info
} from 'lucide-react';
import styles from './VideoEditor.module.css';

export default function VideoEditor({ videoBlob, onSave, onCancel }) {
  const [videoUrl, setVideoUrl] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [videoVolume, setVideoVolume] = useState(1);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const [rendering, setRendering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      setVideoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [videoBlob]);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioFile]);

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (file) setAudioFile(file);
  };

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current.pause();
      if (audioRef.current) audioRef.current.pause();
    } else {
      videoRef.current.play();
      if (audioRef.current) {
        audioRef.current.currentTime = videoRef.current.currentTime;
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleRender = async () => {
    setRendering(true);
    setProgress(0);

    const video = videoRef.current;
    const audio = audioRef.current;
    
    // Configura AudioContext para mixagem
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    const dest = ctx.createMediaStreamDestination();
    
    // Fonte do vídeo
    const videoSource = ctx.createMediaElementSource(video);
    const videoGain = ctx.createGain();
    videoGain.gain.value = videoVolume;
    videoSource.connect(videoGain);
    videoGain.connect(dest);

    // Fonte do áudio extra (se houver)
    if (audio) {
      const audioSource = ctx.createMediaElementSource(audio);
      const audioGain = ctx.createGain();
      audioGain.gain.value = audioVolume;
      audioSource.connect(audioGain);
      audioGain.connect(dest);
    }

    // Configura Canvas para captura de vídeo
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const canvasCtx = canvas.getContext('2d');
    
    const videoStream = canvas.captureStream(30); // 30 FPS
    const combinedStream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...dest.stream.getAudioTracks()
    ]);

    const recorder = new MediaRecorder(combinedStream, {
      mimeType: 'video/webm;codecs=vp9,opus'
    });

    const chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const resultBlob = new Blob(chunks, { type: 'video/webm' });
      ctx.close();
      onSave(resultBlob, { titulo: 'Aula Editada' });
      setRendering(false);
    };

    // Inicia processo de "re-gravação" em tempo real
    video.currentTime = 0;
    if (audio) audio.currentTime = 0;
    
    recorder.start();
    video.play();
    if (audio) audio.play();

    const duration = video.duration;
    
    const drawFrame = () => {
      if (video.paused || video.ended) return;
      canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setProgress((video.currentTime / duration) * 100);
      requestAnimationFrame(drawFrame);
    };

    video.onplay = drawFrame;
    video.onended = () => {
      recorder.stop();
      video.onended = null;
    };
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>Editor de Vídeo e Áudio</h3>
      </div>

      <div className={styles.previewSection}>
        <div className={styles.videoWrapper}>
          <video 
            ref={videoRef} 
            src={videoUrl} 
            className={styles.previewVideo}
            onEnded={() => setIsPlaying(false)}
          />
          
          {rendering && (
            <div className={styles.renderingOverlay}>
              <Loader2 className={styles.spin} size={48} color="#8b5cf6" />
              <p>Renderizando vídeo final...</p>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: `${progress}%` }} />
              </div>
              <span style={{fontSize: '0.8rem'}}>{Math.round(progress)}%</span>
            </div>
          )}

          <button className={styles.playOverlay} onClick={togglePlay}>
            {isPlaying ? <Pause size={40} /> : <Play size={40} />}
          </button>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <h4><Volume2 size={18} /> Volume do Vídeo</h4>
          <div className={styles.volumeControl}>
            <input 
              type="range" 
              min="0" max="1" step="0.1" 
              value={videoVolume} 
              onChange={(e) => setVideoVolume(parseFloat(e.target.value))}
              className={styles.slider}
            />
            <span>{Math.round(videoVolume * 100)}%</span>
          </div>
        </div>

        <div className={styles.controlGroup}>
          <h4><Music size={18} /> Trilha Sonora</h4>
          {!audioFile ? (
            <label className={styles.fileInputLabel}>
              <Music size={18} /> Selecionar Áudio
              <input type="file" accept="audio/*" onChange={handleAudioUpload} style={{display: 'none'}} />
            </label>
          ) : (
            <div className={styles.audioSelected}>
              <div className={styles.audioInfo}>
                <CheckCircle size={16} /> {audioFile.name}
              </div>
              <div className={styles.volumeControl}>
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={audioVolume} 
                  onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                  className={styles.slider}
                />
                <span>{Math.round(audioVolume * 100)}%</span>
              </div>
              <button className={styles.btnChange} onClick={() => setAudioFile(null)}>Trocar</button>
            </div>
          )}
        </div>
      </div>

      {audioFile && (
        <audio ref={audioRef} src={audioUrl} style={{display: 'none'}} />
      )}

      <div className={styles.tips}>
        <Info size={16} />
        <p>Ajuste os volumes e adicione uma trilha sonora para deixar sua aula mais dinâmica.</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnCancel} onClick={onCancel} disabled={rendering}>
          <X size={18} /> Cancelar
        </button>
        <button className={styles.btnSave} onClick={handleRender} disabled={rendering}>
          {rendering ? <Loader2 className={`${styles.spin} ${styles.icon}`} size={18} /> : <Save size={18} />}
          {rendering ? 'Renderizando...' : 'Finalizar Edição'}
        </button>
      </div>
    </div>
  );
}
