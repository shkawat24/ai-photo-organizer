/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { Photo, FaceProfile } from '../types';

/**
 * Clean profile and group names to make them safe for OS directory names
 */
export function sanitizeFolderName(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim() || 'Unnamed_Face_Group';
}

/**
 * Compresses an uploaded File down to maximum 400px width/height and outputs raw base64.
 * This guarantees speed, low tokens, and avoids hitting HTTP upload/API limit caps.
 */
export function resizeImageForGemini(file: File): Promise<{ base64Data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = file.type || 'image/jpeg';
          const base64Data = canvas.toDataURL(mimeType);
          resolve({ base64Data, mimeType });
        } else {
          reject(new Error("Canvas context is null."));
        }
      };
      img.onerror = () => reject(new Error("Failed to load image as Image element."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("File reading error."));
    reader.readAsDataURL(file);
  });
}

/**
 * Fetches and compresses a remote demo image URL into smaller base64 data.
 * Cross-origin needs to be allowed.
 */
export function resizeDemoImageForGemini(url: string, mimeType: string = 'image/jpeg'): Promise<{ base64Data: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Prevent canvas taint for Unsplash resources
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 400;
      const MAX_HEIGHT = 400;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve({ base64Data: canvas.toDataURL(mimeType), mimeType });
      } else {
        reject(new Error("Canvas context is null."));
      }
    };
    img.onerror = (e) => reject(new Error("Failed to fetch/load cross-origin demo photo element."));
    img.src = url;
  });
}

/**
 * Groups and packs all photos into categorized folders, compiling them into a single ZIP blob.
 */
export async function packageOrganizedZip(photos: Photo[], profiles: FaceProfile[]): Promise<Blob> {
  const zip = new JSZip();
  
  for (const photo of photos) {
    if (photo.faces.length === 0) {
      // Unclassified photo - place in Uncategorized folder
      await addPhotoToZipFolder(zip, "Uncategorized", photo);
    } else {
      for (const face of photo.faces) {
        const profile = profiles.find(p => p.id === face.profileId);
        const folderName = profile ? sanitizeFolderName(profile.name) : "Other_Identified_Faces";
        await addPhotoToZipFolder(zip, folderName, photo);
      }
    }
  }
  
  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Adds a photo (either local file or remote demo image URL) to a ZIP directory.
 */
async function addPhotoToZipFolder(zip: JSZip, folderName: string, photo: Photo) {
  try {
    if (photo.isDemo) {
      const resp = await fetch(photo.srcUrl);
      const buffer = await resp.arrayBuffer();
      zip.folder(folderName)?.file(photo.name, buffer);
    } else if (photo.file) {
      const buffer = await photo.file.arrayBuffer();
      zip.folder(folderName)?.file(photo.name, buffer);
    }
  } catch (err) {
    console.error(`Failed to pack photo ${photo.name} into ${folderName}:`, err);
  }
}
