export const COLLABORATORS = {
  "jose-manuel-alcalde-llergo": {
    name: "José Manuel Alcalde-Llergo",
    role: "Ph.D. · Co-author",
    affiliation: "University of Córdoba & University of Tuscia",
    linkedin: "https://www.linkedin.com/in/josemanuelalcaldellergo/",
    photo: "/assets/collaborators/jose-manuel-alcalde-llergo.jpg",
  },
  "francisco-jose-romero-ramirez": {
    name: "Francisco José Romero Ramírez",
    role: "Ph.D. · Co-author",
    affiliation: "University of Córdoba",
    linkedin: "https://www.linkedin.com/in/fjromeroramirez/",
    photo: "/assets/collaborators/francisco-jose-romero-ramirez.jpg",
  },
} as const;

export type CollaboratorId = keyof typeof COLLABORATORS;
