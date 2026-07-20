// Flip to true once at least one real testimonial has replaced the
// placeholder data below. While false, the section dims the placeholder
// cards and shows a "be the first" overlay instead of passing them off
// as real quotes.
export const HAS_REAL_TESTIMONIALS = false;

// PLACEHOLDER DATA — swap these out for real testimonials/recommendations
// (e.g. pulled from LinkedIn recommendations or written by former
// managers/collaborators) before treating this section as final.
// `photo` is optional: set it to "/assets/testimonials/<file>.jpg" once a
// real photo exists, otherwise a generic avatar placeholder is shown.
export const TESTIMONIALS = [
  {
    quote: "Placeholder — replace with a real quote from a manager, colleague, or collaborator.",
    name: "Full Name",
    role: "Job Title · Company",
    photo: "",
  },
  {
    quote: "Placeholder — replace with a real quote from a manager, colleague, or collaborator.",
    name: "Full Name",
    role: "Job Title · Company",
    photo: "",
  },
  {
    quote: "Placeholder — replace with a real quote from a manager, colleague, or collaborator.",
    name: "Full Name",
    role: "Job Title · Company",
    photo: "",
  },
  {
    quote: "Placeholder — replace with a real quote from a manager, colleague, or collaborator.",
    name: "Full Name",
    role: "Job Title · Company",
    photo: "",
  },
  {
    quote: "Placeholder — replace with a real quote from a manager, colleague, or collaborator.",
    name: "Full Name",
    role: "Job Title · Company",
    photo: "",
  },
] as const;
