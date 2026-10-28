<script setup lang="ts">
import { computed } from 'vue'
import ChatSidebar from '../components/ChatSidebar.vue'
import ChatMessageList from '../components/ChatMessageList.vue'
import ChatComposer from '../components/ChatComposer.vue'
import { useChatStore } from '../stores/chat'

const chatStore = useChatStore()
const currentSession = computed(() => chatStore.currentSession)
</script>

<template>
  <div class="app-shell">
    <ChatSidebar />

    <main class="chat-panel">
      <header class="chat-header">
        <div>
          <span class="eyebrow">Current session</span>
          <h2>{{ currentSession?.title || 'New chat' }}</h2>
        </div>
      </header>

      <ChatMessageList />
      <ChatComposer />
    </main>
  </div>
</template>
