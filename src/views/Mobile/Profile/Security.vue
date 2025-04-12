<template>
  <div class="user-security">
    <van-nav-bar
      title="账号与安全"
      left-arrow
      @click-left="goBack"
    />
    
    <div class="security-container">
      <van-cell-group inset title="登录信息">
        <van-cell 
          title="手机号码" 
          :value="maskedPhone" 
          is-link
          @click="handlePhone"
        />
        <van-cell 
          title="登录密码" 
          value="已设置" 
          is-link 
          @click="handlePassword"
        />
        <van-cell 
          title="邮箱绑定" 
          :value="securityInfo.hasBindEmail ? maskedEmail : '未绑定'" 
          is-link
          @click="handleEmail"
        />
      </van-cell-group>
      
      <van-cell-group inset title="账号保护">
        <van-cell 
          title="实名认证" 
          :value="securityInfo.isVerified ? '已认证' : '未认证'" 
          is-link
          @click="handleVerify"
        />
        <van-cell 
          title="安全问题" 
          :value="securityInfo.hasSecurityQuestion ? '已设置' : '未设置'" 
          is-link
          @click="handleSecurityQuestion"
        />
        <van-cell center title="登录保护">
          <template #right-icon>
            <van-switch 
              v-model="securityInfo.loginProtection" 
              size="24"
              @change="toggleLoginProtection"
            />
          </template>
        </van-cell>
      </van-cell-group>
      
      <van-cell-group inset title="账号操作">
        <van-cell 
          title="退出登录" 
          is-link
          @click="showLogoutDialog"
          title-class="highlight-text"
        />
        <van-cell 
          title="切换账号" 
          is-link
          @click="showSwitchAccountDialog"
        />
      </van-cell-group>
      
      <van-cell-group inset title="账号管理">
        <van-cell 
          title="注销账号" 
          is-link
          @click="showDeleteAccountDialog"
        />
      </van-cell-group>
    </div>
    
    <!-- 修改手机号弹窗 -->
    <van-dialog
      v-model:show="showPhoneDialog"
      title="修改手机号"
      show-cancel-button
      @confirm="savePhone"
    >
      <div class="dialog-content">
        <van-field
          v-model="newPhone"
          label="新手机号"
          placeholder="请输入新手机号"
          maxlength="11"
        />
        <van-field
          v-model="phoneVerifyCode"
          center
          clearable
          label="验证码"
          placeholder="请输入验证码"
        >
          <template #button>
            <van-button size="small" type="primary" @click="sendPhoneCode">
              {{ phoneCodeText }}
            </van-button>
          </template>
        </van-field>
      </div>
    </van-dialog>
    
    <!-- 修改密码弹窗 -->
    <van-dialog
      v-model:show="showPasswordDialog"
      title="修改密码"
      show-cancel-button
      @confirm="savePassword"
    >
      <div class="dialog-content">
        <van-field
          v-model="oldPassword"
          type="password"
          label="原密码"
          placeholder="请输入原密码"
        />
        <van-field
          v-model="newPassword"
          type="password"
          label="新密码"
          placeholder="请输入新密码"
        />
        <van-field
          v-model="confirmPassword"
          type="password"
          label="确认密码"
          placeholder="请再次输入新密码"
        />
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';
import AuthApi from '@/services/auth';
import userStorage from '@/utils/userStorage';

const router = useRouter();

// 安全信息
const securityInfo = reactive({
  phone: '13800138000',
  email: 'example@example.com',
  isVerified: true,
  hasBindEmail: true,
  hasSecurityQuestion: false,
  loginProtection: true
});

// 手机号显示
const maskedPhone = computed(() => {
  const phone = securityInfo.phone;
  if (!phone) return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
});

// 邮箱显示
const maskedEmail = computed(() => {
  const email = securityInfo.email;
  if (!email) return '';
  const [username, domain] = email.split('@');
  if (username.length <= 2) {
    return email.replace(/(.{1})(.*)(@.*)/, '$1***$3');
  }
  return email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
});

// 修改手机号
const showPhoneDialog = ref(false);
const newPhone = ref('');
const phoneVerifyCode = ref('');
const phoneCodeText = ref('获取验证码');
const phoneCodeTimer = ref<number | null>(null);

const handlePhone = () => {
  showPhoneDialog.value = true;
  newPhone.value = '';
  phoneVerifyCode.value = '';
};

const sendPhoneCode = () => {
  if (!newPhone.value || newPhone.value.length !== 11) {
    showToast('请输入正确的手机号');
    return;
  }
  
  // 这里应该调用实际的API发送验证码
  showToast('验证码已发送');
  
  // 倒计时
  let count = 60;
  phoneCodeText.value = `${count}秒后重发`;
  
  if (phoneCodeTimer.value) {
    clearInterval(phoneCodeTimer.value);
  }
  
  phoneCodeTimer.value = setInterval(() => {
    count--;
    if (count > 0) {
      phoneCodeText.value = `${count}秒后重发`;
    } else {
      phoneCodeText.value = '获取验证码';
      clearInterval(phoneCodeTimer.value as number);
      phoneCodeTimer.value = null;
    }
  }, 1000) as unknown as number;
};

const savePhone = () => {
  if (!newPhone.value || !phoneVerifyCode.value) {
    showToast('请填写完整信息');
    return false;
  }
  
  // 这里应该调用实际的API修改手机号
  securityInfo.phone = newPhone.value;
  showToast('手机号修改成功');
  return true;
};

// 修改密码
const showPasswordDialog = ref(false);
const oldPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const handlePassword = () => {
  showPasswordDialog.value = true;
  oldPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
};

const savePassword = () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    showToast('请填写完整信息');
    return false;
  }
  
  if (newPassword.value !== confirmPassword.value) {
    showToast('两次输入的密码不一致');
    return false;
  }
  
  // 这里应该调用实际的API修改密码
  showToast('密码修改成功');
  return true;
};

// 邮箱绑定
const handleEmail = () => {
  if (securityInfo.hasBindEmail) {
    router.push('/user/email/update');
  } else {
    router.push('/user/email/bind');
  }
};

// 实名认证
const handleVerify = () => {
  router.push('/user/verify');
};

// 安全问题
const handleSecurityQuestion = () => {
  router.push('/user/security-question');
};

// 登录保护
const toggleLoginProtection = (value: boolean) => {
  // 这里应该调用实际的API修改登录保护设置
  showToast(`登录保护已${value ? '开启' : '关闭'}`);
};

// 切换账号
const showSwitchAccountDialog = () => {
  showDialog({
    title: '切换账号',
    message: '确定要切换到其他账号吗？',
    showCancelButton: true,
  }).then(() => {
    // 执行切换账号逻辑
    logout();
    // 跳转到登录页
    router.replace('/auth/loginMobile');
  });
};

// 退出登录
const showLogoutDialog = () => {
  showDialog({
    title: '退出登录',
    message: '确定要退出当前账号吗？',
    showCancelButton: true,
  }).then(() => {
    // 执行退出登录逻辑
    logout();
    // 跳转到首页
    router.replace('/home');
  });
};

// 退出登录操作
const logout = async () => {
  try {
    // 调用退出登录接口
    const res = await AuthApi.LOG_OUT_API();
    if (res.code === 200) {
      // 清除本地存储中的登录信息
      userStorage.logOut();
      
      // 显示提示
      showToast('已退出登录');
    } else {
      showToast('退出登录失败：' + (res.message || '未知错误'));
    }
  } catch (error) {
    console.error('退出登录出错', error);
    // 即使接口调用失败，也清除本地存储
    userStorage.logOut();
    showToast('已退出登录');
  }
};

// 显示账号注销确认框
const showDeleteAccountDialog = () => {
  showDialog({
    title: '注销账号',
    message: '注销账号后，所有数据将被删除且无法恢复，确定要继续吗？',
    showCancelButton: true,
    confirmButtonText: '确认注销',
    confirmButtonColor: '#ee0a24'
  }).then(() => {
    // 这里应该调用实际的API注销账号
    showToast('账号注销申请已提交');
    setTimeout(() => {
      // 清除登录信息
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('tokenExpire');
      
      // 跳转到登录页
      router.replace('/auth/loginMobile');
    }, 1500);
  });
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.user-security {
  min-height: 100vh;
  background-color: #f7f8fa;
  
  .security-container {
    padding: 12px 0;
  }
  
  .dialog-content {
    padding: 16px;
  }
  
  .highlight-text {
    color: #ff5252;
    font-weight: bold;
  }
}
</style> 