import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { parseSSEStream, sendChatStream } from '../api/chat'
import type { ChatMessage, ChatSession } from '../types/chat'

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<ChatSession[]>([
    {
      id: 'demo-session-1',
      title: 'Welcome',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: 'Say hello to the AI assistant.'
    }
  ])

  const messages = ref<Record<string, ChatMessage[]>>({
    'demo-session-1': [
      {
        id: 'demo-msg-1',
        sessionId: 'demo-session-1',
        role: 'assistant',
        content: 'Hello! I am your AI assistant. Ask me anything.',
        status: 'done',
        createdAt: new Date().toISOString()
      }
    ]
  })

  const currentSessionId = ref<string>('demo-session-1')
  const isStreaming = ref(false)

  const currentMessages = computed(() => {
    return messages.value[currentSessionId.value] || []
  })

  const currentSession = computed(() => {
    return sessions.value.find(session => session.id === currentSessionId.value) || null
  })

  function createSession() {
    const newId = makeId('session')
    const session: ChatSession = {
      id: newId,
      title: 'New chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastMessage: 'Start a conversation'
    }

    sessions.value.unshift(session)
    messages.value[newId] = []
    currentSessionId.value = newId
    return newId
  }

  function switchSession(sessionId: string) {
    currentSessionId.value = sessionId
  }

  async function sendMessage(content: string) {
    const trimmed = content.trim()
    if (!trimmed) return

    let sessionId = currentSessionId.value
    if (!sessionId) {
      sessionId = createSession()
    }

    const userMessage: ChatMessage = {
      id: makeId('msg'),
      sessionId,
      role: 'user',
      content: trimmed,
      status: 'done',
      createdAt: new Date().toISOString()
    }

    const assistantMessage: ChatMessage = {
      id: makeId('msg'),
      sessionId,
      role: 'assistant',
      content: '',
      status: 'streaming',
      createdAt: new Date().toISOString()
    }

    if (!messages.value[sessionId]) {
      messages.value[sessionId] = []
    }

    messages.value[sessionId].push(userMessage)
    messages.value[sessionId].push(assistantMessage)

    const targetSession = sessions.value.find(item => item.id === sessionId)
    if (targetSession) {
      targetSession.title = trimmed.slice(0, 30) || 'New chat'
      targetSession.updatedAt = new Date().toISOString()
      targetSession.lastMessage = trimmed
    }

    isStreaming.value = true

    try {
      const response = await sendChatStream({
        sessionId,
        message: trimmed,
        model: 'gpt-4o-mini'
      })

      await parseSSEStream(response, (event) => {
        if (event.event === 'message_start') {
          assistantMessage.status = 'streaming'
          return
        }

        if (event.event === 'message_delta') {
          const delta = typeof event.payload === 'string' ? event.payload : event.payload?.content || ''
          assistantMessage.content += delta
          assistantMessage.status = 'streaming'
          return
        }

        if (event.event === 'message_end') {
          assistantMessage.status = 'done'
          const target = sessions.value.find(item => item.id === sessionId)
          if (target) {
            target.lastMessage = assistantMessage.content || trimmed
            target.updatedAt = new Date().toISOString()
          }
          return
        }

        if (event.event === 'error') {
          assistantMessage.status = 'error'
          assistantMessage.content = String(event.payload?.message || 'Something went wrong')
        }
      })
    } catch (error) {
      assistantMessage.status = 'error'
      assistantMessage.content = error instanceof Error ? error.message : 'Failed to fetch response'
    } finally {
      isStreaming.value = false
    }
  }

  function retryLastAssistantMessage() {
    const sessionMessages = currentMessages.value
    if (!sessionMessages.length) return

    const lastUserMessage = [...sessionMessages].reverse().find(item => item.role === 'user')
    if (!lastUserMessage) return

    sendMessage(lastUserMessage.content)
  }

  function stopStreaming() {
    isStreaming.value = false
  }

  return {
    sessions,
    messages,
    currentSessionId,
    isStreaming,
    currentMessages,
    currentSession,
    createSession,
    switchSession,
    sendMessage,
    retryLastAssistantMessage,
    stopStreaming
  }
})
