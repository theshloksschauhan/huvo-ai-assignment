import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { chat, getSession } from './src/chat.js';
import { generateAnalytics } from './src/analytics.js';
import { PROJECT_FACTS } from './src/facts.js';

dotenv.config();

// ── Fail fast if API key is missing ─────────────────────────────────────────
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.error('\n❌  OPENAI_API_KEY is missing or still set to the placeholder.');
  console.error('   Copy .env.example to .env and add your real API key.\n');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── GET /api/facts — serve project facts to the frontend ────────────────────
app.get('/api/facts', (_req, res) => {
  res.json(PROJECT_FACTS);
});

// ── POST /api/chat — main turn handler ──────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    // Reject empty or whitespace-only messages before spending an API call
    if (!sessionId || !message || !message.trim()) {
      return res.status(400).json({ error: 'sessionId and a non-empty message are required.' });
    }

    const reply = await chat(sessionId, message.trim());
    res.json({ reply });
  } catch (error) {
    console.error('Error in /api/chat:', error.message);

    // Graceful in-character fallback so the demo video doesn't show a raw error
    res.json({
      reply: {
        text: 'Ria abhi thoda busy hai — ek second mein try karte hain. Please send your message again.'
      }
    });
  }
});

// ── POST /api/end — end session and generate analytics ──────────────────────
app.post('/api/end', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required.' });
    }

    const session = getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found. It may have expired.' });
    }

    // If analytics were already generated for this session, return cached
    if (session.analytics) {
      return res.json(session.analytics);
    }

    const analytics = await generateAnalytics(session.history);
    session.analytics = analytics;
    res.json(analytics);
  } catch (error) {
    console.error('Error in /api/end:', error.message);
    res.status(500).json({
      analytics_generation_failed: true,
      error: 'Failed to generate analytics.'
    });
  }
});

// ── GET /api/analytics/:sessionId — re-fetch analytics for ended session ────
app.get('/api/analytics/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId);
  if (!session || !session.analytics) {
    return res.status(404).json({ error: 'No analytics found for this session.' });
  }
  res.json(session.analytics);
});

app.listen(PORT, () => {
  console.log(`\n✅  Server running at http://localhost:${PORT}`);
  console.log(`   Project: ${PROJECT_FACTS.project} — ${PROJECT_FACTS.location}\n`);
});
