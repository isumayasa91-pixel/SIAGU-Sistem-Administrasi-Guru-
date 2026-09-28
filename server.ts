import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));

// Database storage file path on server
const DB_FILE = path.join(__dirname, 'siagu_db.json');

// Initialize Gemini API client on the server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// GET /api/data - Fetch central database state across all devices
app.get('/api/data', (req, res) => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const rawData = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(rawData);
      return res.json(parsed);
    }
  } catch (error) {
    console.error('[SIAGU Server] Error reading DB file:', error);
  }
  return res.json({ empty: true });
});

// POST /api/data - Sync and persist database state across all devices
app.post('/api/data', (req, res) => {
  try {
    const bodyData = req.body;
    if (!bodyData || typeof bodyData !== 'object') {
      return res.status(400).json({ error: 'Payload tidak valid.' });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(bodyData, null, 2));
    return res.json({ success: true, timestamp: new Date().toISOString() });
  } catch (error: any) {
    console.error('[SIAGU Server] Error saving DB file:', error);
    return res.status(500).json({ error: 'Gagal menyimpan data ke server DB.' });
  }
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
