export interface Tech {
  name: string;
  icon: string;
  bg: string;
  text: string;
}

export const TECH = {
  cpp: { name: "C++", icon: "/assets/tech/cpp.png", bg: "#e0f0fc", text: "#062f4a" },
  opencv: { name: "OpenCV", icon: "/assets/tech/opencv.png", bg: "#ffffff", text: "#000000" },
  cmake: { name: "CMake", icon: "/assets/tech/cmake.png", bg: "#ffffff", text: "#000000" },
  ogre: { name: "OGRE / Ovis", icon: "/assets/tech/ogre.png", bg: "#eef3e4", text: "#3f5423" },
  qt: { name: "Qt Creator", icon: "/assets/tech/qt.png", bg: "#e6f7e6", text: "#0a3d0a" },
  blender: { name: "Blender", icon: "/assets/tech/blender.png", bg: "#ffe8cc", text: "#4a2400" },
  godot: { name: "Godot", icon: "/assets/tech/godot.png", bg: "#e5f0fb", text: "#0b3866" },

  // Not used on any project page yet, kept ready for future web/design projects.
  python: { name: "Python", icon: "/assets/tech/python.svg", bg: "#f5f0dc", text: "#2b5b84" },
  typescript: { name: "TypeScript", icon: "/assets/tech/typescript.svg", bg: "#e3edfc", text: "#0b5394" },
  react: { name: "React", icon: "/assets/tech/react.svg", bg: "#e6f9fd", text: "#0f6b8c" },
  astro: { name: "Astro", icon: "/assets/tech/astro.svg", bg: "#f3e9fb", text: "#3a1a5c" },
  git: { name: "Git", icon: "/assets/tech/git.svg", bg: "#fbeae6", text: "#8a2a17" },
  figma: { name: "Figma", icon: "/assets/tech/figma.svg", bg: "#ffffff", text: "#000000" },
  tailwind: { name: "Tailwind CSS", icon: "/assets/tech/tailwindcss.svg", bg: "#e3f6fd", text: "#075985" },
  vercel: { name: "Vercel", icon: "/assets/tech/vercel.svg", bg: "#ffffff", text: "#000000" },
} as const satisfies Record<string, Tech>;

export type TechKey = keyof typeof TECH;
