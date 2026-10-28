# vue-ai-chat-frontend

Vue 3 AI chat frontend demo with streaming chat UI.

## Features

- Clean chat interface
- Session list
- Streaming assistant responses via SSE
- Stop and retry flows
- Works with a backend API at `/api/chat/stream`

## Run locally

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

## Backend contract

The frontend expects a streaming endpoint at:

```http
POST /api/chat/stream
Content-Type: application/json
```

Request body:

```json
{
  "sessionId": "optional-session-id",
  "message": "Hello there",
  "model": "gpt-4o-mini"
}
```

Server-Sent Events response example:

```text
event: message_start
data: {"messageId":"msg_001","role":"assistant"}

event: message_delta
data: {"messageId":"msg_001","content":"Hello!"}

event: message_end
data: {"messageId":"msg_001","status":"done"}
```

## Notes

This project is intentionally minimal and focused only on the chat experience, so it can be extended later with agent management, knowledge base, and tool execution pages.
