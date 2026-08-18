# Northstar Homes AI Developer Toolkit

Welcome to the Developer Toolkit for the Northstar Homes AI Conversational Bot. This document serves as a comprehensive guide for any engineer taking over or contributing to the project. It outlines the architectural decisions, the exact workflow for making modifications, and the best practices to maintain the zero hallucination guardrails.

## 1. Architecture Overview

The backend is built on Node.js and Express. It strictly separates the business logic, the static property data, and the generative AI models. The flow is designed to be highly deterministic:

*   **State Management:** Conversations are stored in memory using a JavaScript Map keyed by a unique session ID.
*   **Prompt Generation:** The system prompt is dynamically assembled at runtime by injecting static project facts.
*   **Tool Calling:** The AI invokes explicit functions (like site visit bookings) which are routed through a backend simulator before responding to the user.
*   **Analytics Extraction:** A separate, low temperature AI call parses the final transcript into structured JSON.

## 2. Modifying Project Facts

To prevent the AI from inventing prices or specifications, all property data is hardcoded in a single file.

**File Location:** `src/facts.js`

If Northstar Homes changes their pricing or adds a new configuration (for example, a 4 BHK), you must update this file. Do not attempt to instruct the AI about price changes directly in the prompt. By updating `facts.js`, the new data is automatically injected into the system prompt across all sessions.

## 3. Adjusting the System Prompt

The instructions governing the persona, language handling, and objection management are managed in the prompt builder.

**File Location:** `src/promptBuilder.js`

When adjusting the prompt:
*   Maintain the strict boundaries regarding unknown information. The AI must deflect questions it cannot answer.
*   Do not add static project facts here; always import them from `facts.js`.
*   If you need to change how the bot handles uninterested customers or escalations, modify the specific behavioral bullet points in this file.

## 4. Managing Booking Logic

The AI uses OpenAI function calling to trigger site visits. The backend intercepts these requests and runs them through a simulator.

**File Location:** `src/booking.js`

Currently, the simulator is designed to fail predictably if a user requests a booking on a Monday. 
If you wish to connect this to a real CRM or calendar API:
1.  Remove the deterministic Monday failure logic.
2.  Implement your API call (for example, a REST call to Salesforce or Google Calendar) inside the `simulateBooking` function.
3.  Ensure the function returns a clear success or failure status so the AI can relay the correct message to the user.

## 5. Accessing Analytics

At the end of a session, the system generates a structured summary of the lead.

**File Location:** `src/analytics.js`

The extraction prompt forces the AI to output valid JSON. If you need to capture a new data point (for example, the customer's occupation):
1.  Open `analytics.js`.
2.  Update the JSON schema string inside the `extractionPrompt` variable to include your new field.
3.  The model will automatically begin extracting this new field from the conversation transcripts.

## 6. Frontend Modifications

The user interface is a custom, responsive web application.

**File Locations:** 
*   Layout: `public/index.html`
*   Styling: `public/style.css`
*   Logic: `public/script.js`

The frontend communicates with the backend via REST endpoints (`/api/chat` and `/api/end`). If you add new AI tool calls that require visual components (such as displaying a floor plan image), you will need to update `script.js` to parse the new payload and append the appropriate HTML elements to the chat container.

***

By following this toolkit, you ensure that the AI remains reliable, safe for the brand, and easy to extend.
