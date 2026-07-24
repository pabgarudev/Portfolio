// Flip back to false if every real testimonial is ever removed again.
// While false, the section dims the placeholder cards and shows a
// "be the first" overlay instead of passing them off as real quotes.
export const HAS_REAL_TESTIMONIALS = true;

// `photo` is optional: set it to "/assets/testimonials/<file>.jpg" once a
// real photo exists, otherwise a generic avatar placeholder is shown.
interface Testimonial {
  quote: string;
  name: string;
  role: string;
  affiliation?: string;
  linkedin?: string;
  photo?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I've had the luck of knowing Pablo since our Computer Engineering degree, and later working with him for a year at the University. He's a very proactive person who brings his personal touch to every project he takes part in, always achieving the expected results in a way that's very appealing to the end user. A perfect example is the Markie project, where he figured out how to integrate his research to create one of the virtual labs we were developing alongside another project. Over these years I've discovered he's the kind of person it's a pleasure to work with and someone you know you can count on, and on a personal level, I gained a great friend.",
    name: "José Manuel Alcalde-Llergo",
    role: "Ph.D. · Markie co-author",
    affiliation: "University of Córdoba & University of Tuscia",
    linkedin: "https://www.linkedin.com/in/josemanuelalcaldellergo/",
    photo: "/assets/collaborators/jose-manuel-alcalde-llergo.jpg",
  },
  {
    quote:
      "I've known Pablo for years now, not just in the academic and professional sense but on a personal level too. We started our degree together, and later went through both our PhD thesis and the same lab side by side. He's the kind of person who throws himself fully into everything he does, with a work ethic and a curiosity that's contagious to anyone working alongside him. He has a knack for finding creative solutions where others get stuck, and he's always ready to lend a hand even when it's not really his problem. Beyond being an excellent researcher, he's a colleague you can always count on, both professionally and personally, and over the years I've been lucky to also gain a great friend.",
    name: "Maria Isabel Jimenez Velasco",
    role: "Ph.D. · Same lab colleague",
    affiliation: "University of Córdoba",
    linkedin: "https://www.linkedin.com/in/isabel-jim%C3%A9nez-velasco-06b93a351/",
    photo: "/assets/collaborators/maria-isabel-jimenez-velasco.jpg",
  },
];
