# Northstar Homes AI Conversational Bot

This repository contains the solution for the Huvo AI Forward Deployed Engineer Assignment.

## Overview
A conversational AI bot for a fictional real-estate company, **Northstar Homes**. The bot is built using Node.js, Express, and vanilla HTML/CSS/JS. It interacts with users, handles real-estate inquiries about "Project Northstar One", manages objections, and handles site-visit bookings using the OpenAI API.

## Project Structure
- `server.js`: The Express server routing chat and analytics endpoints with fail-fast initialization.
- `src/facts.js`: Single source of truth for project prices and details (prevents hallucination).
- `src/promptBuilder.js`: Generates the strict System Prompt interpolated from the project facts.
- `src/chat.js`: Handles OpenAI API interaction, state management, and function calling.
- `src/booking.js`: Deterministic booking simulator (bookings requested on a "Monday" deliberately fail for reproducible testing).
- `src/analytics.js`: Extraction-only LLM call to strictly parse conversation history into JSON at the end of a session.
- `public/`: Contains the frontend assets (`index.html`, `style.css`, `script.js`), designed as a premium property dossier.
- `test_cases.md`: Details various conversation scenarios, edge cases, and expected behaviors.

## How to Run

1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your OpenAI API Key to the `.env` file:
     ```env
     OPENAI_API_KEY=your_openai_api_key_here
     ```
4. **Start the server:**
   ```bash
   node server.js
   ```
5. **Open the App:**
   - Navigate to `http://localhost:3000` in your web browser.

## Key Assumptions
- **AI Model:** Uses `gpt-4o-mini` via the OpenAI API for cost-effectiveness and speed.
- **Language Handling:** No backend translation layer is used; the OpenAI model natively handles English, Hindi, and Hinglish dynamically via prompt instruction.
- **Booking Simulation:** The `simulateBooking` function uses a deterministic blackout day ("Monday") to demonstrate failure handling reliably during testing.
- **Analytics Generation:** To extract analytics, the backend makes a separate, temperature-0 LLM call with a forced JSON schema when the session ends.

## Known Limitations
- The conversation history is stored purely in-memory. Sessions will vanish if the server restarts. This is an intentional trade-off to keep the architecture simple.
- The bot relies heavily on OpenAI. Any API outages or latency issues directly impact the bot's responsiveness (handled gracefully via timeout fallbacks).

## AI Tools Used
- Developed with the assistance of Google Gemini / Antigravity Agent for scaffolding the codebase and structuring the logic efficiently.
