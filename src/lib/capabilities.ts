export const CAPABILITIES = {
  computerVision: "Computer Vision",
  machineLearning: "Machine Learning",
  imageProcessing: "Image Processing",
  poseEstimation: "Camera Pose Estimation",
  scientificResearch: "Scientific Research",
  softwareConsulting: "Software Consulting",
  systemsEngineering: "Systems Engineering",
  requirementsEngineering: "Requirements Engineering",
  cameraIntegration: "Camera Integration",
  industrialInspection: "Industrial Inspection",
  defenseAerospace: "Defense & Aerospace",
  webDevelopment: "Web Development",
  entrepreneurship: "Entrepreneurship",
  brandDesign: "Brand Design",
} as const;

export type CapabilityKey = keyof typeof CAPABILITIES;
