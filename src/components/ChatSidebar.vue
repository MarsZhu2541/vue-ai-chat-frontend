<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()

const sessions = computed(() => chatStore.sessions)

function formatTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div>
        <h1>AI Chat</h1>
      </div>
      <button class="new-chat" @click="chatStore.createSession()">+ New</button>
    </div>

    <div class="session-list">
      <button
        v-for="session in sessions"
        :key="session.id"
        class="session-item"
        :class="{ active: session.id === chatStore.currentSessionId }"
        @click="chatStore.switchSession(session.id)"
      >
        <div class="session-meta">
          <span class="session-title">{{ session.title }}</span>
          <span class="session-time">{{ formatTime(session.updatedAt) }}</span>
        </div>
        <span class="session-preview">{{ session.lastMessage }}</span>
      </button>
    </div>
  </aside>
</template>
