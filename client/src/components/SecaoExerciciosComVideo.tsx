interface SecaoExerciciosProps {
  section: {
    titulo: string;
    grupos: Grupo[];
  };
  secaoId: number;
  aulaId: number;
}
<SecaoExerciciosComVideo
  section={section}
  secaoId={secaoId}
  aulaId={aulaId}
/>
