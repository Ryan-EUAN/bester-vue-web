<template>
    <div class="websocket-demo">
        <h2>WebSocket 演示</h2>
        <input v-model="inputMessage" placeholder="输入消息" />
        <button @click="sendMessage">发送</button>
        <div class="messages">
            <div v-for="(msg, index) in messages" :key="index">{{ msg }}</div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { webSocketService } from '@/utils/websocket';

const messages = ref([]);
const inputMessage = ref('');

// 初始化WebSocket
onMounted(() => {
    webSocketService.connect('ws://localhost:80/ws');
    webSocketService.addMessageListener(handleMessage);
});

// 清理
onBeforeUnmount(() => {
    webSocketService.disconnect();
});

// 处理接收消息
const handleMessage = (data) => {
    const res = JSON.parse(data);
    messages.value.push(res.content);
};

// 发送消息
const sendMessage = () => {
    if (inputMessage.value.trim()) {
        webSocketService.sendMessage({
            type: 'text',
            content: inputMessage.value.trim()
        });
        inputMessage.value = '';
    }
};
</script>

<style scoped>
.messages {
    margin-top: 20px;
    border: 1px solid #eee;
    padding: 10px;
    height: 300px;
    overflow-y: auto;
}
</style>