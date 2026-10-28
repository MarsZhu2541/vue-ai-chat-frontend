import type { ChatRequest, StreamEvent } from '../types/chat'

export async function sendChatStream(payload: ChatRequest) {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`
    },
    body: JSON.stringify(payload)
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || 'Failed to send message')
  }

  return response
}

export async function parseSSEStream(
  response: Response,
  onEvent: (event: StreamEvent) => void
) {
  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('ReadableStream is not supported in this browser')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  const read = async () => {
    const { value, done } = await reader.read()
    if (done) {
      return
    }

    buffer += decoder.decode(value, { stream: true })
    const parts = buffer.split('\n\n')
    buffer = parts.pop() || ''

    for (const part of parts) {
      const lines = part.split('\n')
      const eventLine = lines.find(line => line.startsWith('event:'))
      const dataLine = lines.find(line => line.startsWith('data:'))

      if (!eventLine || !dataLine) continue

      const event = eventLine.replace('event:', '').trim()
      const rawData = dataLine.replace('data:', '').trim()

      if (!rawData || rawData === '[DONE]') continue

      try {
        onEvent({
          event,
          payload: JSON.parse(rawData)
        })
      } catch {
        onEvent({
          event,
          payload: rawData
        })
      }
    }

    await read()
  }

  await read()
}
