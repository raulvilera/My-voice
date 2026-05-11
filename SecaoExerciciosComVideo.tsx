const isTeacher = user?.role === "admin";

{isTeacher && (
  <Button onClick={() => setShowRecorder(true)}>
    Gravar Vídeo
  </Button>
)}

