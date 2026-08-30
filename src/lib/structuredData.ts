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

interface CreativeWorkInput {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  url: string;
  image: string;
}

export function creativeWorkSchema(input: CreativeWorkInput) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    headline: input.headline,
    description: input.description,
    author: { "@type": "Person", name: input.author },
    datePublished: input.datePublished,
    url: input.url,
    image: input.image,
  };
}

interface BlogPostingInput {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  /** Falls back to datePublished when the post has no `updated` frontmatter. */
  dateModified?: string;
  url: string;
  /** Absolute URL. Google needs an image on the posting for article rich results. */
  image: string;
  /** Absolute URL of the author's canonical Person node (Layout's #person @id). */
  authorId?: string;
}

export function blogPostingSchema(input: BlogPostingInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.headline,
    description: input.description,
    author: input.authorId
      ? { "@type": "Person", "@id": input.authorId, name: input.author }
      : { "@type": "Person", name: input.author },
    publisher: input.authorId
      ? { "@type": "Person", "@id": input.authorId, name: input.author }
      : { "@type": "Person", name: input.author },
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    image: input.image,
    url: input.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": input.url },
  };
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

interface ItemListInput {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string }[];
}

export function itemListSchema(input: ItemListInput) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: input.url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
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
