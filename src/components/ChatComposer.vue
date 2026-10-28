<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const text = ref('')

async function handleSubmit() {
  const trimmed = text.value.trim()
  if (!trimmed) return

  text.value = ''
  await chatStore.sendMessage(trimmed)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <div class="composer-wrap">
    <textarea
      v-model="text"
      class="composer-input"
      placeholder="Ask anything..."
      rows="1"
      @keydown="onKeydown"
    />

    <div class="composer-actions">
      <button class="secondary" :disabled="!chatStore.isStreaming" @click="chatStore.stopStreaming()">
        Stop
      </button>
      <button class="primary" :disabled="chatStore.isStreaming || !text.trim()" @click="handleSubmit">
        {{ chatStore.isStreaming ? 'Sending...' : 'Send' }}
      </button>
    </div>
  </div>
</template>
