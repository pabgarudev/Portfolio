// Flip back to false if every real testimonial is ever removed again.
// While false, the section dims the placeholder cards and shows a
// "be the first" overlay instead of passing them off as real quotes.
export const HAS_REAL_TESTIMONIALS = true;

// `photo` is optional: set it to "/assets/testimonials/<file>.jpg" once a
// real photo exists, otherwise a generic avatar placeholder is shown.
export const TESTIMONIALS = [
  {
    quote:
      "I've had the luck of knowing Pablo since our Computer Engineering degree, and later working with him for a year at the University. He's a very proactive person who brings his personal touch to every project he takes part in, always achieving the expected results in a way that's very appealing to the end user. A perfect example is the Markie project, where he figured out how to integrate his research to create one of the virtual labs we were developing alongside another project. Over these years I've discovered he's the kind of person it's a pleasure to work with and someone you know you can count on, and on a personal level, I gained a great friend.",
    name: "José Manuel Alcalde-Llergo",
    role: "Ph.D. · Markie co-author",
    affiliation: "University of Córdoba & University of Tuscia",
    linkedin: "https://www.linkedin.com/in/josemanuelalcaldellergo/",
    photo: "/assets/collaborators/jose-manuel-alcalde-llergo.jpg",
  },
] as const;
