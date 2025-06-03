
export interface PromptData {
  subject: string;
  action: string;
  expression: string; // New
  setting: string;
  timeOfDay: string; // New
  cameraMovement: string; // Renamed from cameraShot, will have new options
  lighting: string;
  videoStyle: string; // Renamed from artisticStyle
  videoMood: string; // New
  soundMusic: string; // New
  spokenLines: string; // New
  additionalDetails: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export enum GeminiMode {
  GENERATE_PROMPT = 'generate_prompt', // Changed from ENHANCE
  VISUALIZE = 'visualize'
}

export interface GeneratedPrompts {
  indonesian: string;
  english: string;
}
