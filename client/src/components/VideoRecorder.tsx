interface VideoRecorderProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  onClose?: () => void;
}
