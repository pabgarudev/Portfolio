import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: "Pablo García Ruiz - Blog",
    description: "My notes on computer vision engineering, research, and the roles I've held along the way.",
    site: context.site,
    // Readers that group or filter by feed language expect this on the
    // channel; @astrojs/rss has no first-class field for it, so it goes in
    // as raw channel-level XML.
    customData: "<language>en-us</language>",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.id}/`,
      // Each frontmatter tag becomes its own <category>, so readers can
      // filter the feed the same way the blog index groups posts.
      categories: post.data.tags,
    })),
  });
}
