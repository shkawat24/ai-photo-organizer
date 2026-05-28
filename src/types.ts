/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FaceProfile {
  id: string; // e.g., "p_1"
  name: string; // e.g., "Person A (Father)"
  description: string; // Textual visual description of key face features so Gemini can recognise them in other pictures.
  gender: string; // "Male" | "Female" | "Unsure"
  ageGroup: string; // "Child" | "Teen" | "Adult" | "Senior"
  hairColor: string; // "Brown" | "Black" | "Blonde" | "Grey/White" | "Bald" | "Other"
  expression: string; // "Smiling" | "Neutral" | "Focused" | "Surprised" | "Other"
  accessories: string; // "Glasses" | "Hat" | "Beard" | "None" | "Other"
  representativeLocalUrl?: string; // local photo URL to show as thumbnail
  representativeBase64?: string; // thumbnail base64 image data
}

export interface PhotoFace {
  profileId: string;
  confidence: number; // 0-100
  boundingBox?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] normalized coordinates 0-1000
}

export interface Photo {
  id: string;
  name: string;
  path: string; // Relative virtual path on disk
  size: number; // File size in bytes
  type: string; // MIME type
  srcUrl: string; // Local URL.createObjectURL or static URL for preview
  file?: any; // Native browser File reference for packaging later
  isDemo: boolean;
  faces: PhotoFace[];
  status: 'pending' | 'scanning' | 'done' | 'error';
  errorMessage?: string;
}

export interface ScanLog {
  id: string;
  timestamp: string; // HH:mm:ss format
  message: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'system';
}

export interface SystemStats {
  totalScanned: number;
  totalImages: number;
  recognizedFaces: number;
  totalCategories: number;
}
