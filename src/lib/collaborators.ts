import type { ImageMetadata } from "astro";

import joseManuelPhoto from "../assets/collaborators/jose-manuel-alcalde-llergo.jpg";
import franciscoJosePhoto from "../assets/collaborators/francisco-jose-romero-ramirez.jpg";
import enriquePhoto from "../assets/collaborators/enrique-yeguas-bolivar.jpg";
import rafaelPhoto from "../assets/collaborators/rafael-muñoz-salinas.jpg";
import manuelPhoto from "../assets/collaborators/manuel-j-marin-jimenez.jpg";

interface Collaborator {
  name: string;
  role: string;
  affiliation: string;
  linkedin: string;
  photo: ImageMetadata;
}

export const COLLABORATORS = {
  "jose-manuel-alcalde-llergo": {
    name: "José Manuel Alcalde-Llergo",
    role: "Ph.D. · Co-author",
    affiliation: "University of Córdoba & University of Tuscia",
    linkedin: "https://www.linkedin.com/in/josemanuelalcaldellergo/",
    photo: joseManuelPhoto,
  },
  "francisco-jose-romero-ramirez": {
    name: "Francisco José Romero Ramírez",
    role: "Ph.D. · Co-author",
    affiliation: "University of Córdoba",
    linkedin: "https://www.linkedin.com/in/fjromeroramirez/",
    photo: franciscoJosePhoto,
  },
  "enrique-yeguas-bolivar": {
    name: "Enrique Yeguas-Bolívar",
    role: "Ph.D. · Co-author",
    affiliation: "University of Córdoba",
    linkedin: "https://www.linkedin.com/in/eyeguas/",
    photo: enriquePhoto,
  },
  "rafael-munoz-salinas": {
    name: "Rafael Muñoz-Salinas",
    role: "Ph.D. · Thesis Director",
    affiliation: "University of Córdoba",
    linkedin: "https://www.linkedin.com/in/rafael-mu%C3%B1oz-salinas-8607452a/",
    photo: rafaelPhoto,
  },
  "manuel-j-marin-jimenez": {
    name: "Manuel J. Marín-Jiménez",
    role: "Ph.D. · Thesis Co-Director",
    affiliation: "University of Córdoba",
    linkedin: "https://www.linkedin.com/in/mjmarin/",
    photo: manuelPhoto,
  },
} as const satisfies Record<string, Collaborator>;

export type CollaboratorId = keyof typeof COLLABORATORS;
