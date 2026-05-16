import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getVideosBySecaoId,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  incrementVideoViews,
} from "../db";
import { storagePut, storageGet } from "../storage";

/**
 * Procedure que restringe acesso apenas a admins
 */
const professorProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Apenas administradores podem acessar esta funcionalidade",
    });
  }
  return next({ ctx });
});

export const videosRouter = router({
  /**
   * Listar videos de uma secao (publico para alunos, professores podem ver todos)
   */
  listBySecao: protectedProcedure
    .input(z.object({ secaoId: z.number() }))
    .query(async ({ input }) => {
      const videosList = await getVideosBySecaoId(input.secaoId);
      // Filtrar apenas videos publicados para alunos
      return videosList.filter((v) => v.publicado === 1);
    }),

  /**
   * Obter detalhes de um video especifico
   */
  getById: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .query(async ({ input, ctx }) => {
      const video = await getVideoById(input.videoId);
      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video nao encontrado",
        });
      }

      // Verificar permissao: alunos so podem ver videos publicados
      if (
        ctx.user.role === "user" &&
        video.publicado === 0
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Este video nao esta disponivel",
        });
      }

      // Incrementar visualizacoes
      await incrementVideoViews(video.id);

      return video;
    }),

  /**
   * Criar um novo video (apenas admins)
   * Recebe dados do video e faz upload para storage
   */
  create: professorProcedure
    .input(
      z.object({
        secaoId: z.number(),
        titulo: z.string().min(1, "Titulo e obrigatorio"),
        descricao: z.string().optional(),
        videoBlob: z.instanceof(Blob),
        duracao: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Upload do video para storage
        const arrayBuffer = await input.videoBlob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fileName = `videos/${ctx.user.id}/${Date.now()}-${input.titulo.replace(/\s+/g, "-")}.mp4`;
        const { url: videoUrl, key: videoKey } = await storagePut(
          fileName,
          buffer,
          "video/mp4"
        );

        // Criar registro no banco de dados
        await createVideo({
          secaoId: input.secaoId,
          professorId: ctx.user.id,
          titulo: input.titulo,
          descricao: input.descricao,
          videoUrl,
          videoKey,
          duracao: input.duracao,
          publicado: 0, // Comeca como rascunho
        });

        return {
          success: true,
          videoUrl,
        };
      } catch (error) {
        console.error("Erro ao criar video:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao fazer upload do video",
        });
      }
    }),

  /**
   * Atualizar metadados de um video (apenas o professor que criou ou admin)
   */
  update: professorProcedure
    .input(
      z.object({
        videoId: z.number(),
        titulo: z.string().optional(),
        descricao: z.string().optional(),
        duracao: z.number().optional(),
        publicado: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const video = await getVideoById(input.videoId);
      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video nao encontrado",
        });
      }

      // Verificar permissao: apenas o criador ou admin pode editar
      if (
        ctx.user.role !== "admin" &&
        video.professorId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Voce nao tem permissao para editar este video",
        });
      }

      const updateData: Record<string, any> = {};
      if (input.titulo) updateData.titulo = input.titulo;
      if (input.descricao) updateData.descricao = input.descricao;
      if (input.duracao) updateData.duracao = input.duracao;
      if (input.publicado !== undefined) updateData.publicado = input.publicado;

      await updateVideo(input.videoId, updateData);

      return { success: true };
    }),

  /**
   * Deletar um video (apenas o professor que criou ou admin)
   */
  delete: professorProcedure
    .input(z.object({ videoId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const video = await getVideoById(input.videoId);
      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video nao encontrado",
        });
      }

      // Verificar permissao
      if (
        ctx.user.role !== "admin" &&
        video.professorId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Voce nao tem permissao para deletar este video",
        });
      }

      await deleteVideo(input.videoId);

      return { success: true };
    }),

  /**
   * Obter URL de presigned para download/visualizacao do video
   */
  getVideoUrl: protectedProcedure
    .input(z.object({ videoId: z.number() }))
    .query(async ({ input, ctx }) => {
      const video = await getVideoById(input.videoId);
      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Video nao encontrado",
        });
      }

      // Verificar permissao
      if (
        ctx.user.role === "user" &&
        video.publicado === 0
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Este video nao esta disponivel",
        });
      }

      // Obter URL presigned para o video
      const { url } = await storageGet(video.videoKey);

      return { url };
    }),

  /**
   * Listar todos os videos de um professor (para gerenciamento)
   */
  listMyVideos: professorProcedure.query(async ({ ctx }) => {
    // Retorna lista vazia para simplificar
    // Em producao, fazer query ao banco de dados
    return [];
  }),
});

