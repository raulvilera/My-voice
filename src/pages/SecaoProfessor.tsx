// src/pages/SecaoProfessor.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // ou useTRPC
import { trpc } from '@/lib/trpc'; // seu cliente tRPC
import { VideoRecorder } from '@/components/VideoRecorder';
import { VideoEditor } from '@/components/VideoEditor';
import { VideoPlayer } from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

export function SecaoProfessor() {
  const { secaoId } = useParams<{ secaoId: string }>();
  const id = Number(secaoId);
  const queryClient = useQueryClient();

  // Estado para controlar os modais/fluxo de gravação
  const [showRecorder, setShowRecorder] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);

  // Buscar todos os vídeos da seção (como professor)
  const { data: videos, isLoading } = trpc.videos.listBySecao.useQuery(
    { secaoId: id },
    { enabled: !!id }
  );

  // Mutation para criar vídeo
  const createMutation = trpc.videos.create.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos.listBySecao', { secaoId: id }] });
      setRecordedBlob(null);
      setShowRecorder(false);
    },
  });

  // Mutation para atualizar vídeo
  const updateMutation = trpc.videos.update.useMutation({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos.listBySecao', { secaoId: id }] }),
  });

  // Mutation para deletar
  const deleteMutation = trpc.videos.delete.useMutation({
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['videos.listBySecao', { secaoId: id }] }),
  });

  // Callback quando a gravação for concluída
  const handleRecordingComplete = (blob: Blob, duration: number) => {
    setRecordedBlob(blob);
    setRecordedDuration(duration);
    setShowRecorder(false); // fecha o recoder, abre o editor
  };

  // Callback do editor (salvar metadados + upload)
  const handleSaveEditedVideo = async (editedBlob: Blob, metadata: any) => {
    await createMutation.mutateAsync({
      secaoId: id,
      titulo: metadata.titulo,
      descricao: metadata.descricao,
      videoBlob: editedBlob,
      duracao: recordedDuration,
      // legenda pode ser enviada como parte da descrição ou campo separado (ajuste o schema se necessário)
    });
  };

  // Alternar publicação (publicado: 0 ou 1)
  const togglePublish = (video: any) => {
    updateMutation.mutate({
      videoId: video.id,
      publicado: video.publicado === 1 ? 0 : 1,
    });
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Aulas</h1>
        <Button onClick={() => setShowRecorder(true)}>🎥 Gravar Nova Aula</Button>
      </div>

      {/* Gravador de vídeo */}
      {showRecorder && (
        <VideoRecorder
          onRecordingComplete={handleRecordingComplete}
          onClose={() => setShowRecorder(false)}
        />
      )}

      {/* Editor (exibido após gravação) */}
      {recordedBlob && (
        <VideoEditor
          videoBlob={recordedBlob}
          onSave={handleSaveEditedVideo}
          onCancel={() => setRecordedBlob(null)}
        />
      )}

      {/* Lista de vídeos existentes */}
      <div className="grid gap-6">
        {videos?.map((video) => (
          <Card key={video.id} className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Mini player ou thumbnail */}
              <div className="w-full md:w-1/3">
                <VideoPlayer videoUrl={video.videoUrl} titulo={video.titulo} />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold">{video.titulo}</h3>
                <p className="text-muted-foreground">{video.descricao}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span>Visualizações: {video.visualizacoes}</span>
                  <span>•</span>
                  <span>
                    Status: {video.publicado === 1 ? '📢 Publicado' : '✏️ Rascunho'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Abrir modal de edição de metadados (pode reutilizar o VideoEditor apenas para metadados)
                      const novoTitulo = prompt('Novo título', video.titulo);
                      if (novoTitulo) {
                        updateMutation.mutate({ videoId: video.id, titulo: novoTitulo });
                      }
                    }}
                  >
                    <Pencil size={16} /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePublish(video)}
                  >
                    {video.publicado === 1 ? <EyeOff size={16} /> : <Eye size={16} />}
                    {video.publicado === 1 ? ' Despublicar' : ' Publicar'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Excluir vídeo permanentemente?')) {
                        deleteMutation.mutate({ videoId: video.id });
                      }
                    }}
                  >
                    <Trash2 size={16} /> Excluir
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
