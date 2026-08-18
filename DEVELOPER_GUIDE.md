# Northstar Homes AI Developer Guide

## System Overview
This project is engineered to act as a highly reliable, zero-hallucination real estate sales concierge. Rather than relying on a massive, static block of text for the AI to memorize, the system is broken down into modular components that orchestrate the conversation, manage state, and strictly enforce business rules. The architecture ensures that the AI only speaks based on verified data and gracefully handles edge cases like API failures or unsupported questions.

## Managing Project Knowledge
The most critical aspect of maintaining this project is understanding the single source of truth for all property data. You will find a dedicated configuration file named facts.js in the source directory. This file exports a single object containing the project name, location, configurations, and pricing. 

If the business decides to raise the starting price of a 3 BHK apartment, you must never edit the system prompt directly. Instead, you simply update the value inside the facts.js file. By keeping data separate from instructions, the system guarantees that the AI will never hallucinate outdated pricing or offer unauthorized discounts.

## The Prompt Engine
The core intelligence of the agent is generated dynamically by the promptBuilder.js module. When a session begins, this module imports the data from the facts file and injects it directly into a highly structured set of behavioral instructions. 

This engine instructs the agent on exactly how to behave. It dictates that the agent must implicitly qualify leads without interrogating them, mirror the user's language whether it is English, Hindi, or Hinglish, and politely decline to answer questions about amenities or dates that are not explicitly defined in the facts.

## Conversation State and Memory
Because the AI model itself is stateless, the backend must remember the conversation. The chat.js module maintains an in-memory vault mapping unique session IDs to their respective conversation histories. 

Every time a user sends a message, the server retrieves their entire conversation history, appends the new message, and sends the full transcript to the AI. This ensures the agent perfectly remembers if a user mentioned their budget ten messages ago. Note that because this memory is stored in the server's RAM, restarting the server will wipe all active sessions. In a production environment, this in-memory map would be replaced by a persistent database like Redis or PostgreSQL.

## Deterministic Tool Calling
A major feature of this project is its ability to simulate site visit bookings using native tool calling. When the AI determines that a user is ready to book, it triggers a backend function located in the booking.js module. 

To ensure the system can be rigorously tested, this module includes a deterministic failure condition. Any booking requested for a Monday will intentionally be rejected by the backend. The server then feeds this rejection back to the AI, which must apologize and offer to reschedule without breaking character. If you need to test how the agent handles a booking failure, simply ask to book a visit on a Monday.

## Analytics Extraction
A sales agent is only valuable if it captures actionable data for the human sales team. When a user ends the conversation, the application does not rely on the chat model to guess the outcome. Instead, the analytics.js module takes the entire conversation transcript and makes a secondary, completely separate request to the AI. 

This secondary request is configured with a temperature of zero to eliminate creativity and uses a forced schema to extract strict JSON data. It reads the transcript and outputs structured analytics including the user's budget, chosen configuration, and overall interest level, which is then displayed on the frontend.
