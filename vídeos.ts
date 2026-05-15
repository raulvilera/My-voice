// ... importações existentes ...

export const videosRouter = router({
  listBySecao: protectedProcedure
    .input(z.object({ secaoId: z.number() }))
    .query(async ({ input, ctx }) => {
      const videosList = await getVideosBySecaoId(input.secaoId);
      // Professores (admin) veem todos; alunos apenas publicados
      if (ctx.user.role === 'admin') {
        return videosList;
      }
      return videosList.filter((v) => v.publicado === 1);
    }),

  // ... demais procedimentos (getById, create, update, delete, getVideoUrl, listMyVideos) permanecem iguais ...
});
