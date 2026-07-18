interface ScholarlyArticleInput {
  headline: string;
  description: string;
  authors: string[];
  datePublished: string;
  url: string;
  journalName: string;
  doi: string;
  image: string;
}

export function scholarlyArticleSchema(input: ScholarlyArticleInput) {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: input.headline,
    description: input.description,
    author: input.authors.map((name) => ({ "@type": "Person", name })),
    datePublished: input.datePublished,
    url: input.url,
    identifier: `https://doi.org/${input.doi}`,
    isPartOf: {
      "@type": "Periodical",
      name: input.journalName,
    },
    image: input.image,
  };
}

interface ThesisInput {
  headline: string;
  description: string;
  author: string;
  advisors: string[];
  datePublished: string;
  url: string;
  school: string;
  image: string;
}

export function thesisSchema(input: ThesisInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Thesis",
    headline: input.headline,
    description: input.description,
    author: { "@type": "Person", name: input.author },
    contributor: input.advisors.map((name) => ({ "@type": "Person", name })),
    datePublished: input.datePublished,
    url: input.url,
    provider: {
      "@type": "CollegeOrUniversity",
      name: input.school,
    },
    image: input.image,
  };
}
