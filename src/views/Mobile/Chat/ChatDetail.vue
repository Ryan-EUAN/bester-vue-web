<template>
  <div class="chat-detail" @click="onPageClick">
    <van-nav-bar :title="chatUser.name" left-arrow @click-left="goBack">
      <template #right>
        <van-icon name="more-o" size="18" @click="showUserOptions" />
      </template>
    </van-nav-bar>

    <!-- 聊天内容区域 -->
    <div class="chat-content" ref="chatContentRef">
      <van-pull-refresh v-model="refreshing" @refresh="loadMoreHistory">
        <van-empty v-if="messages.length === 0" description="暂无聊天记录" />

        <div v-else class="message-list">
          <div class="time-divider" v-if="messages.length > 0">{{ formatDate(messages[0].time) }}</div>

          <div v-for="(message, index) in messages" :key="message.id" class="message-wrapper">
            <!-- 显示日期分割线 -->
            <div v-if="index > 0 && shouldShowDateDivider(messages[index - 1].time, message.time)" class="time-divider">
              {{ formatDate(message.time) }}
            </div>

            <!-- 消息气泡 -->
            <div class="message-bubble" :class="message.from === 'self' ? 'self' : 'other'">
              <!-- 头像 (只在对方消息时显示) -->
              <van-image v-if="message.from !== 'self'" round width="40" height="40" :src="chatUser.avatar"
                class="avatar" />

              <!-- 消息内容 -->
              <div class="message-container">
                <div class="message-content" :class="message.from === 'self' ? 'self' : 'other'">
                  <div v-if="message.type === 'text'" class="text-message">{{ message.content }}</div>
                  <div v-else-if="message.type === 'image'" class="image-message">
                    <van-image :src="message.content" fit="cover" @click="previewImage(message.content)" />
                  </div>
                </div>

                <!-- 发送状态 (仅自己发送的消息显示) -->
                <div v-if="message.from === 'self'" class="message-status">
                  <van-loading v-if="message.status === 'sending'" size="12px" />
                  <van-icon v-else-if="message.status === 'failed'" name="warning-o" color="#ee0a24" size="14px"
                    @click="resendMessage(message)" />
                  <span v-else-if="message.status === 'sent'" class="sent-time">{{ formatTime(message.time) }}</span>
                </div>
              </div>

              <!-- 自己的头像 -->
              <van-image v-if="message.from === 'self'" round width="40" height="40" :src="userAvatar" class="avatar" />
            </div>
          </div>
        </div>
      </van-pull-refresh>
    </div>

    <!-- 底部输入区域 -->
    <div class="chat-footer">
      <div class="input-area">
        <van-icon name="smile-o" size="24" class="emoji-btn" @click="toggleEmojiPanel" />
        <van-field v-model="inputMessage" type="text" placeholder="请输入消息" class="message-input"
          @keypress.enter="sendMessage" maxlength="500" @focus="showEmojiPanel = false" />
        <van-icon name="photograph" size="24" class="image-btn" @click="chooseImage" />
        <van-button type="primary" size="small" class="send-btn" :disabled="!inputMessage.trim()"
          @click="sendMessage">发送</van-button>
      </div>

      <!-- 表情面板 -->
      <transition name="slide-up">
        <div v-if="showEmojiPanel" class="emoji-panel">
          <div class="emoji-container">
            <span v-for="emoji in emojiList" :key="emoji" class="emoji-item" @click="addEmoji(emoji)">
              {{ emoji }}
            </span>
          </div>
        </div>
      </transition>
    </div>

    <!-- 用户选项弹出菜单 -->
    <van-action-sheet v-model:show="showOptions" :actions="userActions" cancel-text="取消" @select="onSelectUserAction" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';

const route = useRoute();
const router = useRouter();
const userId = route.params.userId as string;

// 聊天区域引用，用于滚动
const chatContentRef = ref<HTMLElement | null>(null);

// 用户信息
const userAvatar = ref('https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'); // 当前登录用户头像
const chatUser = ref({
  id: userId,
  name: `用户${userId}`,
  avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
});

// 聊天消息
interface ChatMessage {
  id: string;
  from: 'self' | 'other';
  type: 'text' | 'image';
  content: string;
  time: Date;
  status: 'sending' | 'sent' | 'failed';
}

const messages = ref<ChatMessage[]>([]);
const inputMessage = ref('');
const refreshing = ref(false);
const showEmojiPanel = ref(false);
const showOptions = ref(false);

// 表情列表
const emojiList = [
  '😄', '😆', '😊', '😃', '😏', '😍', '😘', '😚', '😳', '😌',
  '😁', '😉', '😜', '😝', '😀', '😗', '😙', '😛', '😴', '😟',
  '😦', '😧', '😮', '😬', '😕', '😯', '😑', '😒', '😅', '😓',
  '😥', '😩', '😔', '😞', '😖', '😨', '😰', '😣', '😢', '😭'
];

// 用户操作选项
const userActions = [
  { name: '查看主页', color: '#07c160' },
  { name: '举报用户', color: '#ee0a24' },
  { name: '清空聊天记录', color: '#1989fa' },
  { name: '拉黑', color: '#ee0a24' }
];

// 加载用户信息
const loadUserInfo = () => {
  // 这里应该调用实际的API获取聊天对象的用户信息
  // 模拟用户信息
  setTimeout(() => {
    chatUser.value = {
      id: userId,
      name: `用户${userId}`,
      avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
    };
  }, 500);
};

// 加载聊天记录
const loadChatHistory = () => {
  // 这里应该调用实际的API获取聊天记录
  // 模拟聊天记录
  setTimeout(() => {
    const mockMessages: ChatMessage[] = [];

    // 添加一些模拟消息
    const now = new Date();

    mockMessages.push({
      id: '1',
      from: 'other',
      type: 'text',
      content: '你好，最近怎么样？',
      time: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 一天前
      status: 'sent'
    });

    mockMessages.push({
      id: '2',
      from: 'self',
      type: 'text',
      content: '我很好，谢谢关心！你呢？',
      time: new Date(now.getTime() - 23 * 60 * 60 * 1000),
      status: 'sent'
    });

    mockMessages.push({
      id: '3',
      from: 'other',
      type: 'text',
      content: '我也不错，最近在忙什么？',
      time: new Date(now.getTime() - 22 * 60 * 60 * 1000),
      status: 'sent'
    });

    mockMessages.push({
      id: '4',
      from: 'self',
      type: 'text',
      content: '在开发一个新项目，很有挑战性',
      time: new Date(now.getTime() - 10 * 60 * 1000), // 10分钟前
      status: 'sent'
    });

    mockMessages.push({
      id: '5',
      from: 'other',
      type: 'image',
      content: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      time: new Date(now.getTime() - 5 * 60 * 1000), // 5分钟前
      status: 'sent'
    });

    mockMessages.push({
      id: '6',
      from: 'self',
      type: 'text',
      content: '好可爱的猫咪！',
      time: new Date(now.getTime() - 2 * 60 * 1000), // 2分钟前
      status: 'sent'
    });

    messages.value = mockMessages;

    // 滚动到底部
    scrollToBottom();
  }, 1000);
};

// 加载更多历史记录
const loadMoreHistory = () => {
  // 这里应该调用实际的API加载更多历史记录
  // 模拟加载更多
  setTimeout(() => {
    const firstMessageTime = messages.value.length > 0 ? messages.value[0].time : new Date();
    const mockOlderMessages: ChatMessage[] = [];

    for (let i = 1; i <= 5; i++) {
      mockOlderMessages.push({
        id: `older-${i}`,
        from: i % 2 === 0 ? 'self' : 'other',
        type: 'text',
        content: `这是更早的消息 ${i}`,
        time: new Date(firstMessageTime.getTime() - i * 3600 * 1000), // 每条早1小时
        status: 'sent'
      });
    }

    messages.value = [...mockOlderMessages, ...messages.value];
    refreshing.value = false;

    // 保持当前滚动位置
    nextTick(() => {
      if (chatContentRef.value) {
        chatContentRef.value.scrollTop = 50; // 滚动到新加载内容的底部
      }
    });
  }, 1000);
};

// 发送消息
const sendMessage = () => {
  if (!inputMessage.value.trim()) return;

  const newMessage: ChatMessage = {
    id: `msg-${Date.now()}`,
    from: 'self',
    type: 'text',
    content: inputMessage.value,
    time: new Date(),
    status: 'sending'
  };

  messages.value.push(newMessage);

  // 清空输入框并滚动到底部
  inputMessage.value = '';
  scrollToBottom();

  // 模拟发送过程
  setTimeout(() => {
    const msgIndex = messages.value.findIndex(msg => msg.id === newMessage.id);
    if (msgIndex !== -1) {
      messages.value[msgIndex].status = 'sent';
    }

    // 模拟对方回复
    setTimeout(() => {
      messages.value.push({
        id: `reply-${Date.now()}`,
        from: 'other',
        type: 'text',
        content: '好的，我知道了！',
        time: new Date(),
        status: 'sent'
      });

      scrollToBottom();
    }, 2000);
  }, 1000);
};

// 重发消息
const resendMessage = (message: ChatMessage) => {
  const msgIndex = messages.value.findIndex(msg => msg.id === message.id);
  if (msgIndex !== -1) {
    messages.value[msgIndex].status = 'sending';

    // 模拟重发
    setTimeout(() => {
      messages.value[msgIndex].status = 'sent';
    }, 1000);
  }
};

// 选择图片
const chooseImage = () => {
  // 这里应该调用实际的图片选择API
  showToast('选择图片功能需要原生支持');

  // 模拟选择图片
  setTimeout(() => {
    const newImageMessage: ChatMessage = {
      id: `img-${Date.now()}`,
      from: 'self',
      type: 'image',
      content: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      time: new Date(),
      status: 'sending'
    };

    messages.value.push(newImageMessage);
    scrollToBottom();

    // 模拟发送过程
    setTimeout(() => {
      const msgIndex = messages.value.findIndex(msg => msg.id === newImageMessage.id);
      if (msgIndex !== -1) {
        messages.value[msgIndex].status = 'sent';
      }
    }, 1500);
  }, 1000);
};

// 预览图片
const previewImage = (url: string) => {
  // 使用vant的图片预览
  // 不需要这些未使用的变量
  // const imageUrls = messages.value
  //   .filter(msg => msg.type === 'image')
  //   .map(msg => msg.content);
  // const startPosition = imageUrls.indexOf(url);
  console.log('图片路径', url);

  // 这里应该调用图片预览组件
  showToast('图片预览功能');
};

// 切换表情面板
const toggleEmojiPanel = () => {
  showEmojiPanel.value = !showEmojiPanel.value;
};

// 页面点击事件，用于隐藏表情面板
const onPageClick = (e: MouseEvent) => {
  // 如果点击的不是表情按钮或表情面板内部元素，则隐藏表情面板
  const target = e.target as HTMLElement;
  if (showEmojiPanel.value &&
    !target.classList.contains('emoji-btn') &&
    !target.closest('.emoji-panel')) {
    showEmojiPanel.value = false;
  }
};

// 添加表情
const addEmoji = (emoji: string) => {
  inputMessage.value += emoji;
};

// 显示用户选项
const showUserOptions = () => {
  showOptions.value = true;
};

// 处理用户选项
const onSelectUserAction = (action: { name: string }) => {
  if (action.name === '查看主页') {
    router.push(`/user/${userId}`);
  } else if (action.name === '清空聊天记录') {
    showDialog({
      title: '确认清空',
      message: '确定要清空与该用户的所有聊天记录吗？',
      showCancelButton: true,
    }).then(() => {
      messages.value = [];
      showToast('已清空聊天记录');
    });
  } else if (action.name === '举报用户') {
    showDialog({
      title: '举报用户',
      message: '确定要举报该用户吗？',
      showCancelButton: true,
    }).then(() => {
      showToast('举报已提交');
    });
  } else if (action.name === '拉黑') {
    showDialog({
      title: '拉黑用户',
      message: '拉黑后将不再收到该用户的消息，确定继续吗？',
      showCancelButton: true,
    }).then(() => {
      showToast('已将用户加入黑名单');
      router.back();
    });
  }
};

// 日期格式化
const formatDate = (date: Date) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  const dateTime = date.getTime();

  if (dateTime >= todayStart) {
    return '今天';
  } else if (dateTime >= yesterdayStart) {
    return '昨天';
  } else {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
};

// 时间格式化
const formatTime = (date: Date) => {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 是否显示日期分割线
const shouldShowDateDivider = (prevTime: Date, currentTime: Date) => {
  // 如果日期不同，显示分割线
  return prevTime.getDate() !== currentTime.getDate();
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContentRef.value) {
      chatContentRef.value.scrollTop = chatContentRef.value.scrollHeight;
    }
  });
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 监听新消息，滚动到底部
watch(() => messages.value.length, () => {
  scrollToBottom();
});

onMounted(() => {
  loadUserInfo();
  loadChatHistory();
});
</script>

<style lang="scss" scoped>
.chat-detail {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f7f8fa;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 50px;
  /* 预留底部菜单栏高度 */
  //   z-index: 10; /* 确保聊天页面在菜单栏上方 */

  .chat-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px 12px;
    padding-bottom: 16px;
    margin-bottom: 56px;
    /* 预留底部输入框的高度 */

    /* 添加一个很大的底部内边距，确保内容可以滚到底部且不被输入框遮挡 */
    &::after {
      content: '';
      display: block;
      height: 20px;
      /* 底部额外空间 */
    }

    .message-list {
      .time-divider {
        text-align: center;
        margin: 16px 0;
        font-size: 12px;
        color: #969799;

        &::before,
        &::after {
          content: '';
          display: inline-block;
          width: 20%;
          height: 1px;
          background-color: #ebedf0;
          margin: 0 8px;
          vertical-align: middle;
        }
      }

      .message-wrapper {
        margin-bottom: 16px;

        .message-bubble {
          display: flex;
          align-items: flex-start;

          &.self {
            flex-direction: row-reverse;
          }

          .avatar {
            margin: 0 8px;
            flex-shrink: 0;
          }

          .message-container {
            max-width: 70%;

            .message-content {
              padding: 10px 12px;
              border-radius: 8px;
              word-break: break-word;

              &.other {
                background-color: #fff;
                color: #323233;
              }

              &.self {
                background-color: #07c160;
                color: #fff;
              }

              .text-message {
                font-size: 15px;
                line-height: 1.4;
              }

              .image-message {
                .van-image {
                  width: 100%;
                  max-width: 200px;
                  border-radius: 4px;
                  overflow: hidden;
                }
              }
            }

            .message-status {
              text-align: right;
              font-size: 11px;
              color: #969799;
              margin-top: 4px;

              .sent-time {
                margin-right: 4px;
              }
            }
          }
        }
      }
    }
  }

  .chat-footer {
    position: fixed;
    bottom: 50px;
    /* 距离底部50px，刚好在底部菜单栏上方 */
    left: 0;
    right: 0;
    background-color: #fff;
    border-top: 1px solid #ebedf0;
    padding: 8px 12px;
    z-index: 11;
    /* 确保在聊天页面上方 */

    .input-area {
      display: flex;
      align-items: center;

      .emoji-btn,
      .image-btn {
        flex-shrink: 0;
        padding: 8px;
        color: #646566;
      }

      .message-input {
        flex: 1;
        margin: 0 8px;

        &:deep(.van-field__control) {
          min-height: 36px;
          line-height: 20px;
        }
      }

      .send-btn {
        flex-shrink: 0;
      }
    }

    .emoji-panel {
      position: absolute;
      bottom: 56px;
      /* 输入区域的高度 */
      left: 0;
      right: 0;
      height: 180px;
      padding: 12px;
      background-color: #fff;
      border-top: 1px solid #ebedf0;
      overflow-y: auto;
      z-index: 12;
      /* 确保在输入框上方 */
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);

      .emoji-container {
        display: flex;
        flex-wrap: wrap;

        .emoji-item {
          font-size: 22px;
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;

          &:hover {
            background-color: #f2f3f5;
            border-radius: 4px;
          }
        }
      }
    }
  }
}

// 表情面板过渡动画
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>