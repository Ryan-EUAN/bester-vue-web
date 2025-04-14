<template>
  <div class="user-help">
    <van-nav-bar title="帮助与反馈" left-arrow @click-left="goBack" />

    <div class="help-content">
      <van-cell-group inset title="常见问题">
        <van-cell v-for="item in faqList" :key="item.id" :title="item.question" is-link @click="showAnswer(item)" />
      </van-cell-group>

      <van-cell-group inset title="联系我们" class="contact-group">
        <van-cell title="在线客服" is-link @click="contactService">
          <template #right-icon>
            <van-icon name="service-o" class="custom-icon" />
          </template>
        </van-cell>
        <van-cell title="意见反馈" is-link @click="feedback">
          <template #right-icon>
            <van-icon name="edit" class="custom-icon" />
          </template>
        </van-cell>
        <van-cell title="关于我们" is-link @click="aboutUs">
          <template #right-icon>
            <van-icon name="info-o" class="custom-icon" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- FAQ答案弹出层 -->
    <van-popup v-model:show="showFaqPopup" round position="bottom" :style="popupStyle">
      <div class="faq-popup-content">
        <div class="faq-title">{{ currentFaq.question }}</div>
        <div class="faq-answer">{{ currentFaq.answer }}</div>
        <van-button block round type="primary" class="close-btn" @click="showFaqPopup = false">关闭</van-button>
      </div>
    </van-popup>

    <!-- 反馈弹出层 -->
    <van-popup v-model:show="showFeedbackPopup" round position="bottom" :style="{ maxHeight: '80%' }">
      <div class="feedback-popup">
        <div class="popup-header">
          <div class="popup-title">意见反馈</div>
          <van-icon name="cross" @click="showFeedbackPopup = false" />
        </div>

        <div class="feedback-form">
          <van-field v-model="feedbackForm.type" is-link readonly label="反馈类型" placeholder="请选择反馈类型"
            @click="showFeedbackTypePopup = true" />

          <van-field v-model="feedbackForm.content" label="反馈内容" type="textarea" placeholder="请详细描述您遇到的问题或建议" rows="4"
            autosize maxlength="500" show-word-limit />

          <div class="upload-images">
            <div class="upload-title">上传截图 (选填)</div>
            <van-uploader v-model="feedbackForm.images" multiple :max-count="3" :after-read="afterReadImage" />
          </div>

          <van-field v-model="feedbackForm.contact" label="联系方式" placeholder="请留下您的手机号或邮箱（选填）" />

          <div class="submit-btn">
            <van-button block type="primary" round @click="submitFeedback">提交反馈</van-button>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 反馈类型选择器 -->
    <van-popup v-model:show="showFeedbackTypePopup" round position="bottom">
      <van-picker :columns="feedbackTypes" @confirm="onSelectFeedbackType" @cancel="showFeedbackTypePopup = false"
        show-toolbar title="选择反馈类型" />
    </van-popup>

    <!-- 关于我们弹出层 -->
    <van-popup v-model:show="showAboutPopup" round position="bottom" :style="{ maxHeight: '80%' }">
      <div class="about-popup">
        <div class="popup-header">
          <div class="popup-title">关于我们</div>
          <van-icon name="cross" @click="showAboutPopup = false" />
        </div>

        <div class="about-content">
          <div class="app-info">
            <van-image width="80" height="80" :src="appLogo" class="app-logo" />
            <div class="app-name">Bester论坛</div>
            <div class="app-version">版本：1.0.0</div>
          </div>

          <div class="about-section">
            <div class="section-title">项目简介</div>
            <div class="section-content">
              Bester论坛致力于分享知识与经验，创造更有价值的社交体验。
            </div>
          </div>

          <div class="about-section">
            <div class="section-title">联系方式</div>
            <div class="section-content">
              <!-- <div class="contact-item">
                <van-icon name="phone-o" />
                <span>客服电话：400-123-4567</span>
              </div> -->
              <div class="contact-item">
                <van-icon name="envelop-o" />
                <span>邮箱：euan0721@163.com</span>
              </div>
              <!-- <div class="contact-item">
                <van-icon name="location-o" />
                <span>地址：北京市海淀区科技园</span>
              </div> -->
            </div>
          </div>

          <div class="about-section">
            <div class="section-title">版权信息</div>
            <div class="section-content">
              © 2025 Bester论坛 版权所有
            </div>
          </div>
        </div>
      </div>
    </van-popup>

    <!-- 在线客服弹出层 -->
    <van-popup v-model:show="showServicePopup" round position="bottom" :style="{ maxHeight: '80%' }">
      <div class="service-popup">
        <div class="popup-header">
          <div class="popup-title">在线客服</div>
          <van-icon name="cross" @click="showServicePopup = false" />
        </div>

        <div class="service-content">
          <div class="service-options">
            <div class="option-item" @click="startCustomerService">
              <van-icon name="chat-o" class="option-icon" />
              <div class="option-text">在线咨询</div>
            </div>
            <div class="option-item" @click="callCustomerService">
              <van-icon name="phone-o" class="option-icon" />
              <div class="option-text">电话咨询</div>
            </div>
          </div>

          <div class="service-time">
            <div class="service-title">服务时间</div>
            <div class="service-desc">周一至周五：9:00-18:00</div>
            <div class="service-desc">周六至周日：10:00-16:00</div>
          </div>

          <div class="common-questions">
            <div class="common-title">热门问题</div>
            <van-cell v-for="item in hotQuestions" :key="item.id" :title="item.question" is-link
              @click="showAnswer(item)" />
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';

const router = useRouter();
const showFaqPopup = ref(false);
const showFeedbackPopup = ref(false);
const showFeedbackTypePopup = ref(false);
const showAboutPopup = ref(false);
const showServicePopup = ref(false);

const appLogo = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg';

// 根据内容动态设置弹出层高度
const popupStyle = computed(() => {
  return {
    maxHeight: '80%', // 最大高度不超过屏幕的80%
    paddingBottom: '20px'
  }
});

// 常见问题列表
const faqList = [
  {
    id: 0,
    question: '项目会上线吗？',
    answer: '项目仅用于个人学校，不对外正式上线。'
  },
  {
    id: 1,
    question: '如何修改个人资料？',
    answer: '您可以在"我的"-"编辑资料"中修改您的个人信息，包括头像、用户名、简介等内容。'
  },
  {
    id: 2,
    question: '如何发布内容？',
    answer: '点击底部导航栏中的"+"按钮，选择您要发布的内容类型，填写相关信息后点击发布即可。'
  },
  {
    id: 3,
    question: '如何关注其他用户？',
    answer: '您可以在其他用户的个人主页点击"关注"按钮，或者在推荐用户列表中点击关注。'
  },
  {
    id: 4,
    question: '如何修改密码？',
    answer: '您可以在"我的"-"账号与安全"-"修改密码"中进行密码修改操作。'
  },
  {
    id: 5,
    question: '忘记密码怎么办？',
    answer: '您可以在登录页面点击"忘记密码"，然后按照提示通过手机号或邮箱进行密码重置。'
  },
  {
    id: 6,
    question: '如何举报不良内容？',
    answer: '您可以在帖子详情页面点击右上角的更多选项，选择"举报"，然后选择举报原因并提交。'
  },
  {
    id: 7,
    question: '如何注销账号？',
    answer: '您可以在"我的"-"账号与安全"-"注销账号"中申请注销。注销前请确保已了解账号注销的相关风险和影响。'
  },
  {
    id: 8,
    question: '黑名单在哪里？',
    answer: '您可以在"我的"-"隐私设置"-"黑名单"中查看黑名单用户。'
  }
];

// 热门问题，用于在线客服页面
const hotQuestions = [
  {
    id: 1,
    question: '账号无法登录怎么办？',
    answer: '请先检查网络连接是否正常，然后确认账号密码是否正确。如果仍无法登录，可以尝试找回密码或联系客服解决。'
  },
  {
    id: 2,
    question: '如何注销账号？',
    answer: '您可以在"我的"-"账号与安全"-"注销账号"中申请注销。注销前请确保已了解账号注销的相关风险和影响。'
  },
  {
    id: 3,
    question: '如何购买会员？',
    answer: '您可以在"我的"-"会员中心"中查看会员权益并选择购买。我们提供月度、季度和年度多种套餐供您选择。'
  }
];

// 当前FAQ数据
const currentFaq = reactive({
  id: 0,
  question: '',
  answer: ''
});

// 显示FAQ答案
const showAnswer = (item: any) => {
  currentFaq.id = item.id;
  currentFaq.question = item.question;
  currentFaq.answer = item.answer;
  showFaqPopup.value = true;
};

// 意见反馈表单
const feedbackForm = reactive({
  type: '',
  content: '',
  images: [],
  contact: ''
});

// 反馈类型列表
const feedbackTypes = [
  { text: '功能建议' },
  { text: '内容举报' },
  { text: '账号问题' },
  { text: '体验问题' },
  { text: '其他问题' }
];

// 选择反馈类型
const onSelectFeedbackType = (value: { text: string }) => {
  feedbackForm.type = value.text;
  showFeedbackTypePopup.value = false;
};

// 上传图片后处理
const afterReadImage = (file: any) => {
  // 这里应该实现图片上传到服务器的逻辑
  console.log('上传图片', file);
  // 实际开发中应该调用API上传图片
};

// 提交反馈
const submitFeedback = () => {
  if (!feedbackForm.type) {
    showToast('请选择反馈类型');
    return;
  }

  if (!feedbackForm.content || feedbackForm.content.trim().length === 0) {
    showToast('请填写反馈内容');
    return;
  }

  // 这里应该实现提交反馈的逻辑
  console.log('提交反馈', feedbackForm);
  // 实际开发中应该调用API提交反馈

  showToast('反馈提交成功，感谢您的建议！');
  showFeedbackPopup.value = false;

  // 清空表单
  feedbackForm.type = '';
  feedbackForm.content = '';
  feedbackForm.images = [];
  feedbackForm.contact = '';
};

// 联系客服
const contactService = () => {
  showServicePopup.value = true;
};

// 开始在线咨询
const startCustomerService = () => {
  showToast('正在连接客服...');
  // 实际开发中应该跳转到客服聊天窗口
  setTimeout(() => {
    showServicePopup.value = false;
    router.push('/chat/service');
  }, 1000);
};

// 电话咨询
const callCustomerService = () => {
  showToast('正在拨打客服电话...');
  // 实际开发中应该调用原生方法拨打电话
  window.location.href = 'tel:4001234567';
};

// 意见反馈
const feedback = () => {
  showFeedbackPopup.value = true;
};

// 关于我们
const aboutUs = () => {
  showAboutPopup.value = true;
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.user-help {
  min-height: 100vh;
  background-color: #f7f8fa;

  .help-content {
    padding: 16px 0;
    padding-bottom: 60px;
    /* 为底部导航栏留出空间 */

    .contact-group {
      margin-top: 20px;
    }
  }

  .custom-icon {
    font-size: 18px;
    color: #1989fa;
  }

  .faq-popup-content {
    padding: 24px 16px;

    .faq-title {
      font-size: 18px;
      font-weight: 600;
      color: #323233;
      margin-bottom: 16px;
    }

    .faq-answer {
      font-size: 15px;
      color: #646566;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .close-btn {
      margin-top: 16px;
    }
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #f2f3f5;

    .popup-title {
      font-size: 16px;
      font-weight: 600;
      color: #323233;
    }

    .van-icon {
      font-size: 20px;
      color: #969799;
    }
  }

  .feedback-popup {
    .feedback-form {
      padding: 16px;

      .upload-images {
        padding: 10px 16px;

        .upload-title {
          font-size: 14px;
          color: #646566;
          margin-bottom: 8px;
        }
      }

      .submit-btn {
        margin-top: 24px;
      }
    }
  }

  .about-popup {
    .about-content {
      padding: 0 16px 24px;

      .app-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 24px 0;

        .app-logo {
          margin-bottom: 12px;
          border-radius: 16px;
          overflow: hidden;
        }

        .app-name {
          font-size: 18px;
          font-weight: 600;
          color: #323233;
          margin-bottom: 4px;
        }

        .app-version {
          font-size: 14px;
          color: #969799;
        }
      }

      .about-section {
        margin-bottom: 20px;

        .section-title {
          font-size: 16px;
          font-weight: 500;
          color: #323233;
          margin-bottom: 8px;
        }

        .section-content {
          font-size: 14px;
          color: #646566;
          line-height: 1.6;

          .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;

            .van-icon {
              margin-right: 8px;
              font-size: 16px;
              color: #1989fa;
            }
          }
        }
      }
    }
  }

  .service-popup {
    .service-content {
      padding: 16px;

      .service-options {
        display: flex;
        justify-content: space-around;
        padding: 16px 0 24px;

        .option-item {
          display: flex;
          flex-direction: column;
          align-items: center;

          .option-icon {
            font-size: 28px;
            color: #1989fa;
            margin-bottom: 8px;
            background-color: #ecf5ff;
            padding: 12px;
            border-radius: 50%;
          }

          .option-text {
            font-size: 14px;
            color: #323233;
          }
        }
      }

      .service-time {
        background-color: #f7f8fa;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 24px;

        .service-title {
          font-size: 14px;
          font-weight: 500;
          color: #323233;
          margin-bottom: 8px;
        }

        .service-desc {
          font-size: 13px;
          color: #646566;
          line-height: 1.5;
        }
      }

      .common-questions {
        .common-title {
          font-size: 14px;
          font-weight: 500;
          color: #323233;
          margin-bottom: 8px;
        }
      }
    }
  }
}
</style>