<template>
  <div class="user-verify">
    <van-nav-bar
      title="实名认证"
      left-arrow
      @click-left="goBack"
    />
    
    <div class="verify-container">
      <div class="verify-status" v-if="verifyStatus !== 'none'">
        <div class="status-icon">
          <van-icon :name="verifyStatus === 'passed' ? 'checked' : 'clock-o'" :class="verifyStatus" />
        </div>
        <div class="status-text">
          {{ verifyStatus === 'passed' ? '已通过实名认证' : '认证审核中，请耐心等待' }}
        </div>
        <div class="status-desc" v-if="verifyStatus === 'passed'">
          认证时间：{{ verifyTime }}
        </div>
        <div class="status-desc" v-else>
          预计审核时间：1-3个工作日
        </div>
      </div>
      
      <van-form @submit="onSubmit" v-else>
        <div class="form-header">
          <div class="form-title">身份信息认证</div>
          <div class="form-desc">请填写您的真实信息，认证后不可修改</div>
        </div>
        
        <van-cell-group inset>
          <van-field
            v-model="formData.realName"
            label="真实姓名"
            placeholder="请输入您的真实姓名"
            :rules="[{ required: true, message: '请输入真实姓名' }]"
          />
          
          <van-field
            v-model="formData.idCard"
            label="身份证号"
            placeholder="请输入您的身份证号码"
            :rules="[
              { required: true, message: '请输入身份证号码' },
              { pattern: /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '请输入正确的身份证号码' }
            ]"
          />
          
          <van-field
            v-model="formData.phone"
            type="tel"
            label="手机号码"
            placeholder="请输入您的手机号码"
            :rules="[
              { required: true, message: '请输入手机号码' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码' }
            ]"
          />
          
          <van-field
            v-model="formData.code"
            center
            clearable
            label="短信验证码"
            placeholder="请输入短信验证码"
            :rules="[{ required: true, message: '请输入短信验证码' }]"
          >
            <template #button>
              <van-button 
                size="small" 
                type="primary" 
                :disabled="isCounting" 
                @click="sendVerifyCode"
              >
                {{ isCounting ? `${countdown}秒后重发` : '发送验证码' }}
              </van-button>
            </template>
          </van-field>
        </van-cell-group>
        
        <div class="upload-section">
          <div class="upload-title">证件照片上传</div>
          <div class="upload-desc">请上传清晰的身份证正反面照片</div>
          
          <div class="upload-items">
            <div class="upload-item">
              <div class="upload-label">身份证正面</div>
              <van-uploader
                v-model="formData.idCardFront"
                :max-count="1"
                :after-read="afterFrontRead"
              />
            </div>
            
            <div class="upload-item">
              <div class="upload-label">身份证反面</div>
              <van-uploader
                v-model="formData.idCardBack"
                :max-count="1"
                :after-read="afterBackRead"
              />
            </div>
          </div>
        </div>
        
        <div class="agreement-section">
          <van-checkbox v-model="agreed" shape="square">
            我已阅读并同意
            <span class="agreement-link" @click.stop="showAgreement">《实名认证服务协议》</span>
          </van-checkbox>
        </div>
        
        <div class="submit-section">
          <van-button 
            round 
            block 
            type="primary" 
            native-type="submit"
            :disabled="!agreed || submitting"
            :loading="submitting"
          >
            提交认证
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';

const router = useRouter();

// 认证状态：none-未认证, pending-审核中, passed-已通过
const verifyStatus = ref('none'); 
const verifyTime = ref('2023-11-30 10:25:36');

// 表单数据
const formData = ref({
  realName: '',
  idCard: '',
  phone: '',
  code: '',
  idCardFront: [],
  idCardBack: []
});

// 倒计时相关
const isCounting = ref(false);
const countdown = ref(60);
let timer: number | null = null;

// 协议同意状态
const agreed = ref(false);

// 提交状态
const submitting = ref(false);

// 发送验证码
const sendVerifyCode = () => {
  if (!formData.value.phone) {
    showToast('请先输入手机号码');
    return;
  }
  
  if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    showToast('请输入正确的手机号码');
    return;
  }
  
  // 这里应该调用实际的API发送验证码
  showToast('验证码已发送');
  
  // 启动倒计时
  isCounting.value = true;
  countdown.value = 60;
  
  timer = window.setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer as number);
      isCounting.value = false;
    }
  }, 1000);
};

// 处理正面照片上传
const afterFrontRead = (file: any) => {
  // 这里可以添加文件格式、大小校验
  // 实际开发时，可能需要将文件上传到服务器
  console.log('上传身份证正面:', file);
};

// 处理反面照片上传
const afterBackRead = (file: any) => {
  // 这里可以添加文件格式、大小校验
  // 实际开发时，可能需要将文件上传到服务器
  console.log('上传身份证反面:', file);
};

// 显示协议内容
const showAgreement = () => {
  showDialog({
    title: '实名认证服务协议',
    message: `
      <p>1. 您承诺提供的所有证件和资料均真实有效。</p>
      <p>2. 您的个人信息将被严格保密，仅用于实名认证。</p>
      <p>3. 如提供虚假信息，您将承担相应的法律责任。</p>
      <p>4. 认证通过后，身份信息不可修改。</p>
    `,
    confirmButtonText: '我已阅读并同意'
  }).then(() => {
    agreed.value = true;
  });
};

// 提交表单
const onSubmit = async () => {
  if (!formData.value.idCardFront.length) {
    showToast('请上传身份证正面照片');
    return;
  }
  
  if (!formData.value.idCardBack.length) {
    showToast('请上传身份证反面照片');
    return;
  }
  
  submitting.value = true;
  
  try {
    // 这里应该调用实际的API提交认证信息
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    submitting.value = false;
    showToast('提交成功，审核结果将在1-3个工作日内通知您');
    
    // 模拟切换到审核中状态
    verifyStatus.value = 'pending';
  } catch (error) {
    console.error('提交失败:', error);
    showToast('提交失败，请重试');
    submitting.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style lang="scss" scoped>
.user-verify {
  min-height: 100vh;
  background-color: #f7f8fa;
  
  .verify-container {
    padding: 16px;
    
    .verify-status {
      background-color: #fff;
      border-radius: 8px;
      padding: 24px 16px;
      text-align: center;
      margin-bottom: 20px;
      
      .status-icon {
        font-size: 48px;
        margin-bottom: 16px;
        
        .van-icon {
          &.passed {
            color: #07c160;
          }
          
          &.pending {
            color: #ff976a;
          }
        }
      }
      
      .status-text {
        font-size: 18px;
        font-weight: 500;
        color: #323233;
        margin-bottom: 8px;
      }
      
      .status-desc {
        font-size: 14px;
        color: #969799;
      }
    }
    
    .form-header {
      margin-bottom: 16px;
      
      .form-title {
        font-size: 18px;
        font-weight: 600;
        color: #323233;
        margin-bottom: 6px;
      }
      
      .form-desc {
        font-size: 14px;
        color: #969799;
      }
    }
    
    .upload-section {
      margin: 20px 0;
      
      .upload-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 6px;
      }
      
      .upload-desc {
        font-size: 14px;
        color: #969799;
        margin-bottom: 12px;
      }
      
      .upload-items {
        display: flex;
        justify-content: space-between;
        
        .upload-item {
          width: 48%;
          
          .upload-label {
            font-size: 14px;
            margin-bottom: 8px;
          }
        }
      }
    }
    
    .agreement-section {
      margin: 20px 0;
      
      .agreement-link {
        color: #1989fa;
      }
    }
    
    .submit-section {
      margin: 24px 0;
    }
  }
}
</style> 