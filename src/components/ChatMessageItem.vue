<script setup lang="ts">
import type { ChatMessage } from '../types/chat'

defineProps<{
  message: ChatMessage
}>()

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="message-row" :class="message.role">
    <div class="avatar">
      {{ message.role === 'user' ? 'U' : 'AI' }}
    </div>

    <div class="message-bubble">
      <div class="message-header">
        <span>{{ message.role === 'user' ? 'You' : 'Assistant' }}</span>
        <span>{{ formatTime(message.createdAt) }}</span>
      </div>

      <div v-if="message.status === 'error'" class="message-error">
        {{ message.content }}
      </div>
      <div v-else class="message-content">
        {{ message.content || 'Thinking...' }}
      </div>
    </div>
  </div>
</template>
