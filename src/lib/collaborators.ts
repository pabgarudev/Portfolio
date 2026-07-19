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
  "enrique-yeguas-bolivar": {
    name: "Enrique Yeguas-Bolívar",
    role: "Ph.D. · Co-author",
    affiliation: "University of Córdoba",
    linkedin: "https://www.linkedin.com/in/eyeguas/",
    photo: "/assets/collaborators/enrique-yeguas-bolivar.jpg",
  },
  "rafael-munoz-salinas": {
    name: "Rafael Muñoz-Salinas",
    role: "Ph.D. · Thesis Director",
    affiliation: "University of Córdoba",
    linkedin: "https://www.linkedin.com/in/rafael-mu%C3%B1oz-salinas-8607452a/",
    photo: "/assets/collaborators/rafael-muñoz-salinas.jpg",
  },
  "manuel-j-marin-jimenez": {
    name: "Manuel J. Marín-Jiménez",
    role: "Ph.D. · Thesis Co-Director",
    affiliation: "University of Córdoba",
    linkedin: "https://www.linkedin.com/in/mjmarin/",
    photo: "/assets/collaborators/manuel-j-marin-jimenez.jpg",
  },
} as const;

export type CollaboratorId = keyof typeof COLLABORATORS;
