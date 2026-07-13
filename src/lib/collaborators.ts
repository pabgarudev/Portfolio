export const COLLABORATORS = {
  "jose-manuel-alcalde-llergo": {
    name: "José Manuel Alcalde-Llergo",
    role: "Ph.D. · Co-author",
    affiliation: "University of Córdoba & University of Tuscia",
    linkedin: "https://www.linkedin.com/in/josemanuelalcaldellergo/",
    photo: "/assets/collaborators/jose-manuel-alcalde-llergo.jpg",
  },
} as const;

export type CollaboratorId = keyof typeof COLLABORATORS;
