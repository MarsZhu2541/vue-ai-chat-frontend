export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  status: 'pending' | 'streaming' | 'done' | 'error'
  createdAt: string
}

export interface ChatSession {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  lastMessage: string
}

export interface ChatRequest {
  sessionId?: string
  message: string
  model?: string
}

export interface StreamEvent {
  event: string
  payload: any
}
