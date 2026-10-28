<script setup lang="ts">
import { computed } from 'vue'
import { useChatStore } from '../stores/chat'
import ChatMessageItem from './ChatMessageItem.vue'

const chatStore = useChatStore()
const messages = computed(() => chatStore.currentMessages)
</script>

<template>
  <div class="message-list">
    <ChatMessageItem v-for="message in messages" :key="message.id" :message="message" />
  </div>
</template>
