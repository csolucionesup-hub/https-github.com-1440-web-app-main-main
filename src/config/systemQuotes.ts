export const systemQuotes = {
  time: [
    "Cada minuto cuenta.",
    "No puedes crear más tiempo, pero puedes decidir cómo usarlo.",
    "1440 oportunidades hoy para ser mejor.",
    "Gestionar el tiempo es gestionar la vida.",
    "Tu vida son tus minutos. Úsalos con intención.",
    "El tiempo es el recurso más escaso; si no se gestiona, nada más puede gestionarse."
  ],
  goals: [
    "Las metas dan dirección a tus 1440 minutos.",
    "Un objetivo sin un plan es solo un deseo.",
    "Lo que hagas hoy determina quién serás mañana.",
    "Tus metas son el norte de tu brújula diaria.",
    "No digas que no tienes tiempo. Tienes el mismo que los grandes genios."
  ],
  action: [
    "Tu futuro se construye minuto a minuto.",
    "La disciplina es el puente entre las metas y los logros.",
    "Enfócate en ser productivo, no en estar ocupado.",
    "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    "La clave no es pasar el tiempo, sino invertirlo."
  ]
};

export type QuoteCategory = keyof typeof systemQuotes;
