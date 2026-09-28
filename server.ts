import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini API client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Server-side AI API endpoint for SIAGU Teacher Assistant
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt wajib diisi.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi di lingkungan server.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: systemInstruction
        ? {
            systemInstruction:
              systemInstruction +
              '\n\nGunakan Bahasa Indonesia formal, sopan, terstruktur dengan format Markdown yang rapi dan profesional sesuai standar Kurikulum Merdeka Kemendikbudristek.',
          }
        : {
            systemInstruction:
              'Anda adalah Asisten Guru Ahli Kurikulum Merdeka Indonesia (SIAGU AI Assistant). Berikan jawaban terstruktur, praktis, serta langsung dapat digunakan oleh guru dalam administrasi kelas.',
          },
    });

    return res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in Gemini generation:', error);
    return res.status(500).json({
      error:
        error?.message ||
        'Terjadi kesalahan saat memproses permintaan AI Asisten Guru.',
    });
  }
});

// Development vs Production Middlewares
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, port: 3000 },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[SIAGU Server] Running at http://0.0.0.0:${PORT}`);
});
