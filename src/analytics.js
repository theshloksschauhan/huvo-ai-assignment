import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * generateAnalytics — Single extraction-only LLM call at conversation end.
 *
 * Takes the full conversation history, sends it with a strict extraction prompt,
 * forces JSON output via response_format, and returns a parsed analytics object.
 */
export async function generateAnalytics(history) {
  const extractionPrompt = `You are a data extraction engine. You will be given a sales conversation transcript between an AI assistant (Ria) and a prospective real-estate buyer.

Your job: extract structured analytics from this conversation. Output ONLY valid JSON matching the schema below. No preamble, no markdown fences, no explanation — just the JSON object.

Schema:
{
  "customer_name": "string or null if not shared",
  "language_used": "English | Hindi | Hinglish | Mixed",
  "configuration_interest": "2 BHK | 3 BHK | Both | null",
  "budget_range": "string or null if not shared",
  "interest_level": "High | Medium | Low | Opt-Out",
  "objections_raised": ["array of strings, empty if none"],
  "site_visit_status": "Booked | Pending | Failed | Not Discussed | null",
  "site_visit_datetime": "string or null",
  "follow_up_required": true/false,
  "follow_up_reason": "string or null",
  "escalation_required": true/false,
  "opted_out": true/false,
  "conversation_summary": "1-2 sentence summary of the conversation outcome"
}`;

  // Build messages: extraction system prompt + the entire conversation as context
  const messages = [
    { role: 'system', content: extractionPrompt },
    {
      role: 'user',
      content: 'Here is the full conversation transcript:\n\n' +
        history
          .filter(m => m.role === 'user' || m.role === 'assistant')
          .map(m => `${m.role === 'user' ? 'CUSTOMER' : 'RIA'}: ${m.content}`)
          .join('\n')
    }
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0
    });

    let raw = response.choices[0].message.content;

    // Strip accidental markdown fences if present
    raw = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    return JSON.parse(raw);
  } catch (err) {
    console.error('Analytics generation failed:', err.message);

    // On parse/API failure: return a partial object rather than crashing
    return {
      analytics_generation_failed: true,
      error: err.message,
      interest_level: null,
      conversation_summary: "Analytics could not be generated for this session."
    };
  }
}
