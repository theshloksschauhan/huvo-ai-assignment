import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { buildSystemPrompt } from './promptBuilder.js';
import { simulateBooking } from './booking.js';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── In-memory session store ─────────────────────────────────────────────────
// Map<sessionId, SessionState>
const sessions = new Map();

function getOrCreateSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      history: [],           // OpenAI message format: { role, content }
      bookingState: null,    // null | { status, date, time, reason? }
      analytics: null        // null | { ...extracted fields }
    });
  }
  return sessions.get(sessionId);
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

// ── Tool definition for OpenAI function calling ────────────────────────────
const tools = [
  {
    type: 'function',
    function: {
      name: 'book_site_visit',
      description: 'Book a site visit for the customer once date, time, and contact number are confirmed by the customer.',
      parameters: {
        type: 'object',
        properties: {
          preferred_date: {
            type: 'string',
            description: 'The preferred date for the site visit (e.g., "this Saturday", "tomorrow", "Monday")'
          },
          preferred_time: {
            type: 'string',
            description: 'The preferred time for the site visit (e.g., "2 PM", "morning", "11:00")'
          },
          contact_number: {
            type: 'string',
            description: 'The customer contact number'
          }
        },
        required: ['preferred_date', 'preferred_time']
      }
    }
  }
];

// ── Main chat handler ──────────────────────────────────────────────────────
export async function chat(sessionId, userMessage) {
  const session = getOrCreateSession(sessionId);

  // Append the user message
  session.history.push({ role: 'user', content: userMessage });

  // Build the messages array: system prompt + full history
  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    ...session.history
  ];

  // First LLM call — may return text or a tool call
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    tools,
    tool_choice: 'auto',
    temperature: 0.7
  });

  const choice = response.choices[0];
  let assistantMessage = choice.message;

  // ── Handle tool call (booking) ──────────────────────────────────────────
  if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
    const toolCall = assistantMessage.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);

    // Run the deterministic booking simulator
    const bookingResult = simulateBooking(args.preferred_date, args.preferred_time);
    session.bookingState = bookingResult;

    console.log(`[Booking] ${JSON.stringify(bookingResult)}`);

    // Append the assistant's tool-call message to history
    session.history.push(assistantMessage);

    // Append the tool result so the model can write a natural-language response
    const toolResultContent = bookingResult.status === 'confirmed'
      ? `SUCCESS: Site visit booked for ${bookingResult.date} at ${bookingResult.time} at Sector 79, Gurugram.`
      : `FAILURE: The requested slot (${bookingResult.date}, ${bookingResult.time}) is unavailable. Suggest an alternate day/time.`;

    session.history.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: toolResultContent
    });

    // Second LLM call — model writes the user-facing confirmation/apology
    const followUp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        ...session.history
      ],
      temperature: 0.7
    });

    assistantMessage = followUp.choices[0].message;
    session.history.push({ role: 'assistant', content: assistantMessage.content });

    return {
      text: assistantMessage.content,
      bookingCard: {
        status: bookingResult.status,
        date: bookingResult.date,
        time: bookingResult.time
      }
    };
  }

  // ── Regular text reply (no tool call) ───────────────────────────────────
  session.history.push({ role: 'assistant', content: assistantMessage.content });

  return { text: assistantMessage.content };
}
