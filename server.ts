/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Body parser with comfortable size limit for base64 compressed images
app.use(express.json({ limit: '15mb' }));

// Lazy initializer for Google Gen AI client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set. Please set it in Settings > Secrets.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

// Face analysis API endpoint
app.post('/api/analyze-image', async (req, res) => {
  try {
    const { base64Data, mimeType, knownProfiles } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'Missing image image data (base64Data).' });
    }

    const ai = getGeminiClient();

    // Prepare prompt
    const knownProfilesText = knownProfiles && knownProfiles.length > 0 
      ? JSON.stringify(knownProfiles, null, 2)
      : '[]';

    const systemInstruction = `You are a high-performance computer vision biometric classifier. 
Your goal is to detect human faces in the provided photo, analyze facial features, and group them with absolute precision.
You will be provided with:
1. An image.
2. A JSON list of existing "known" FaceProfiles.

We correspond existing profiles to establish consistency across multiple images.
For EACH prominent face in the image:
- Analyze its biometric features: estimated age, gender, hair shape/color, expression, and distinct characteristics (like shape of face, nose, eyebrows, eyes, mustache/beard, glasses, or jewelry).
- Evaluate if it highly matches any profile in the database of existing "known" FaceProfiles. Face matching should be conservative: only match if the traits correspond strongly.
- If it matches, report the profile's ID under 'matchedProfileId'.
- If it does NOT match any known profile, report 'suggestNewProfile: true' and output 'newProfileDescription'. 'newProfileDescription' MUST be a highly detailed, concise visual summary of only the face traits (e.g., "Caucasian senior male, prominent white beard, thick glasses, gentle wrinkles around blue eyes") so that future runs can use your description to match the exact same person.
- Determine a bounding box [ymin, xmin, ymax, xmax] normalized to a 1000-based grid (i.e. values 0-1000 representing fraction of width/height).
- Guess traits: 'gender' (Male, Female, Unsure), 'ageGroup' (Child, Teen, Adult, Senior), 'hairColor' (Black, Brown, Blonde, Grey/White, Bald, Other), 'expression' (Smiling, Neutral, Focused, Surprised, Other), 'accessories' (Glasses, Hat, Beard, None, Other).
- Output a confidence percentage (0-100) for your classification.

Return your analysis as a strict JSON object structure:
{
  "faces": [
    {
      "matchedProfileId": "profile_id_string_or_null",
      "suggestNewProfile": true_or_false,
      "guesstimatedAttributes": {
        "gender": "Male" | "Female" | "Unsure",
        "ageGroup": "Child" | "Teen" | "Adult" | "Senior",
        "hairColor": "Black" | "Brown" | "Blonde" | "Grey/White" | "Bald" | "Other",
        "expression": "Smiling" | "Neutral" | "Focused" | "Surprised" | "Other",
        "accessories": "Glasses" | "Hat" | "Beard" | "None" | "Other"
      },
      "newProfileDescription": "highly specific visual face description used for future reference",
      "confidence": 92, // estimated match/face validity confidence out of 100
      "boundingBox": [ymin, xmin, ymax, xmax] // numbers between 0 and 1000
    }
  ]
}

Output nothing else but this raw JSON block. If there are absolutely no human faces, return:
{ "faces": [] }`;

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/jpeg',
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Analyze the face(s) in this photo.
Here is the JSON list of known, already identified FaceProfiles. See if this image matches any of them:
${knownProfilesText}

If one of the characters in the image matches a description above, map it to their ID. Otherwise, suggest a new profile with a detailed visual description so that subsequent images of this person can be matched to this profile!`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2, // low temperature for precise classification
      },
    });

    const outputText = response.text || '{ "faces": [] }';
    const parsed = JSON.parse(outputText.trim());
    return res.json(parsed);

  } catch (error: any) {
    console.error('Face analysis error:', error);
    return res.status(500).json({ error: error.message || 'Internal analysis failure' });
  }
});

// Main server routing setup
async function start() {
  // Mount Vite development server when not in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Windows Face Organizer Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start Express server:', err);
});
