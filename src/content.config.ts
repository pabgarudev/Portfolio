import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    year: z.number(),
    category: z.enum(["paper", "workshop", "thesis", "design"]),
    firstAuthor: z.boolean().optional(),
    tags: z.array(z.string()).default([]),
    heroImage: z.string(),
    github: z.string().url().optional(),
    techStack: z.array(z.object({ name: z.string(), icon: z.string() })).default([]),
    citations: z.array(z.string()).default([]),
    bibtex: z.string().optional(),
    paperUrl: z.string().url().optional(),
    license: z.object({ name: z.string(), url: z.string().url() }).optional(),
    contact: z
      .object({
        email: z.string().optional(),
        github: z.string().url().optional(),
        youtube: z.string().url().optional(),
      })
      .optional(),
    relatedProjects: z.array(z.object({ title: z.string(), href: z.string() })).default([]),
    mascot: z.record(z.string(), z.string()).default({}),
  }),
});

export const collections = { projects };
