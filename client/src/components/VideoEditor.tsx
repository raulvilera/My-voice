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

