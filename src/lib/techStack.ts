import type { ImageMetadata } from "astro";

import cpp from "../assets/tech/cpp.png";
import opencv from "../assets/tech/opencv.png";
import cmake from "../assets/tech/cmake.png";
import ogre from "../assets/tech/ogre.png";
import qt from "../assets/tech/qt.png";
import blender from "../assets/tech/blender.png";
import godot from "../assets/tech/godot.png";
import python from "../assets/tech/python.svg";
import typescript from "../assets/tech/typescript.svg";
import react from "../assets/tech/react.svg";
import astro from "../assets/tech/astro.svg";
import git from "../assets/tech/git.svg";
import figma from "../assets/tech/figma.svg";
import tailwind from "../assets/tech/tailwindcss.svg";
import vercel from "../assets/tech/vercel.svg";
import nextjs from "../assets/tech/nextjs.svg";
import shopify from "../assets/tech/shopify.svg";
import printful from "../assets/tech/printful.svg";

export interface Tech {
  name: string;
  icon: ImageMetadata;
  bg: string;
  text: string;
}

export const TECH = {
  cpp: { name: "C++", icon: cpp, bg: "#e0f0fc", text: "#062f4a" },
  opencv: { name: "OpenCV", icon: opencv, bg: "#ffffff", text: "#000000" },
  cmake: { name: "CMake", icon: cmake, bg: "#ffffff", text: "#000000" },
  ogre: { name: "OGRE / Ovis", icon: ogre, bg: "#eef3e4", text: "#3f5423" },
  qt: { name: "Qt Creator", icon: qt, bg: "#e6f7e6", text: "#0a3d0a" },
  blender: { name: "Blender", icon: blender, bg: "#ffe8cc", text: "#4a2400" },
  godot: { name: "Godot", icon: godot, bg: "#e5f0fb", text: "#0b3866" },

  // Not used on any project page yet, kept ready for future web/design projects.
  python: { name: "Python", icon: python, bg: "#f5f0dc", text: "#2b5b84" },
  typescript: { name: "TypeScript", icon: typescript, bg: "#e3edfc", text: "#0b5394" },
  react: { name: "React", icon: react, bg: "#e6f9fd", text: "#0f6b8c" },
  astro: { name: "Astro", icon: astro, bg: "#f3e9fb", text: "#3a1a5c" },
  git: { name: "Git", icon: git, bg: "#fbeae6", text: "#8a2a17" },
  figma: { name: "Figma", icon: figma, bg: "#ffffff", text: "#000000" },
  tailwind: { name: "Tailwind CSS", icon: tailwind, bg: "#e3f6fd", text: "#075985" },
  vercel: { name: "Vercel", icon: vercel, bg: "#ffffff", text: "#000000" },
  nextjs: { name: "Next.js", icon: nextjs, bg: "#ffffff", text: "#000000" },
  shopify: { name: "Shopify", icon: shopify, bg: "#e6f4d9", text: "#3f6c1f" },
  printful: { name: "Printful", icon: printful, bg: "#e6f7f6", text: "#0f3d3a" },
} as const satisfies Record<string, Tech>;

export type TechKey = keyof typeof TECH;
