<script setup lang="ts">
import 'splitpanes/dist/splitpanes.css';
import '@/assets/styles/components/TheChat.scss';
import { Pane, Splitpanes } from 'splitpanes';
import { ref } from 'vue';
import LeftPanel from '@/components/LeftPanel.vue';
import RightPanel from '@/components/RightPanel.vue';
import type { IMessagesChat, IUserData } from '@/types';

const userSelectedData = ref<IUserData | null>(null);
const messagesChat = ref<IMessagesChat[] | null>(null);
const loadUserChats = ref();

const handleUserSelectedData = (data: IUserData): void => {
  userSelectedData.value = data;
};

const handleChatMessages = (data: IMessagesChat[]): void => {
  messagesChat.value = data;
};

const handleLoadUserChats = (): void => {
  loadUserChats.value?.loadUserChats();
};
</script>

<template>
  <div class="chat-container">
    <Splitpanes class="splitpanes">
      <Pane :size="20" :min-size="15" :max-size="30"
        ><LeftPanel
          @userSelectedData="handleUserSelectedData"
          @messagesChat="handleChatMessages"
          ref="loadUserChats"
      /></Pane>
      <Pane class="right-panel"
        ><RightPanel
          :userSelectedData="userSelectedData"
          :messagesChat="messagesChat"
          @loadUserChats="handleLoadUserChats"
        />
        /></Pane
      >
    </Splitpanes>
  </div>
</template>

<style lang="scss"></style>
