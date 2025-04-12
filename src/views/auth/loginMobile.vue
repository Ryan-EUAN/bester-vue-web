<template>
    <div class="login-container">
        <!-- 顶部导航栏 -->
        <van-nav-bar
            title="登录"
            left-arrow
            @click-left="goBack"
            :border="false"
            class="custom-nav"
        />
        
        <!-- 登录表单 -->
        <div class="login-form">
            <!-- Logo -->
            <div class="logo-container">
                <van-image
                    round
                    width="90"
                    height="90"
                    :src="DEFAULT_AVATAR"
                    class="logo"
                />
                <div class="welcome-text">欢迎登录Bester社区</div>
                <div class="welcome-desc">专业的游戏交流社区平台</div>
            </div>
            
            <!-- 切换登录方式 -->
            <van-tabs v-model:active="activeTab" animated class="custom-tabs">
                <!-- 短信登录 -->
                <van-tab title="短信登录">
                    <div class="login-form-content">
                        <van-form @submit="onSmsSubmit">
                            <van-cell-group inset class="form-group">
                                <van-field
                                    v-model="smsForm.phone"
                                    placeholder="请输入手机号"
                                    :rules="[{ required: true, message: '请填写手机号' }]"
                                    class="custom-field"
                                >
                                    <template #left-icon>
                                        <van-icon name="phone-o" class="field-icon" />
                                    </template>
                                </van-field>
                                <div class="field-divider"></div>
                                <van-field
                                    v-model="smsForm.code"
                                    placeholder="请输入验证码"
                                    :rules="[{ required: true, message: '请填写验证码' }]"
                                    class="custom-field"
                                >
                                    <template #left-icon>
                                        <van-icon name="shield-o" class="field-icon" />
                                    </template>
                                    <template #button>
                                        <van-button 
                                            size="small" 
                                            class="code-btn"
                                            :disabled="countdown > 0"
                                            @click="sendSmsCode"
                                        >
                                            {{ countdown > 0 ? `${countdown}秒` : '获取验证码' }}
                                        </van-button>
                                    </template>
                                </van-field>
                            </van-cell-group>
                            <div class="submit-btn-wrap">
                                <van-button round block type="primary" native-type="submit" :loading="submitLoading" class="submit-btn">
                                    登录 / 注册
                                </van-button>
                            </div>
                        </van-form>
                    </div>
                </van-tab>
                
                <!-- 密码登录 -->
                <van-tab title="密码登录">
                    <div class="login-form-content">
                        <van-form @submit="onPasswordSubmit">
                            <van-cell-group inset class="form-group">
                                <van-field
                                    v-model="passwordForm.username"
                                    placeholder="请输入用户名/手机号/邮箱"
                                    :rules="[{ required: true, message: '请填写用户名' }]"
                                    class="custom-field"
                                >
                                    <template #left-icon>
                                        <van-icon name="user-o" class="field-icon" />
                                    </template>
                                </van-field>
                                <div class="field-divider"></div>
                                <van-field
                                    v-model="passwordForm.password"
                                    type="password"
                                    placeholder="请输入密码"
                                    :rules="[{ required: true, message: '请填写密码' }]"
                                    class="custom-field"
                                >
                                    <template #left-icon>
                                        <van-icon name="lock" class="field-icon" />
                                    </template>
                                </van-field>
                            </van-cell-group>
                            <div class="forgot-password">
                                <span>忘记密码?</span>
                            </div>
                            <div class="submit-btn-wrap">
                                <van-button round block type="primary" native-type="submit" :loading="submitLoading" class="submit-btn">
                                    登录
                                </van-button>
                            </div>
                        </van-form>
                    </div>
                </van-tab>
            </van-tabs>
            
            <!-- 其他登录方式 -->
            <div class="other-login">
                <div class="divider"><span>其他方式登录</span></div>
                <div class="social-login">
                    <div v-for="item in socialLoginOptions" :key="item.type" 
                         class="social-btn" @click="handleSocialLogin(item.type)">
                        <van-icon :name="item.icon" size="28" color="#fff" 
                                 :class="['social-icon', item.type]" />
                        <span>{{ item.text }}</span>
                    </div>
                </div>
            </div>
            
            <!-- 协议提示 -->
            <div class="agreement">
                登录即代表您已同意
                <span class="link">《服务条款》</span>和
                <span class="link">《隐私政策》</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import authApi from '@/services/auth';
import type { LoginModel } from '@/model/login';

const router = useRouter();
const activeTab = ref(0);
const submitLoading = ref(false);
const countdown = ref(0);
let timer: number | null = null;

// 默认头像
const DEFAULT_AVATAR = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg';

// 表单数据
const smsForm = ref({ phone: '', code: '' });
const passwordForm = ref<LoginModel>({ username: '', password: '' });

// 社交登录选项
const socialLoginOptions = [
    { type: 'wechat', icon: 'wechat', text: '微信' },
    { type: 'qq', icon: 'qq', text: 'QQ' }
];

// 返回上一页
const goBack = () => router.back();

// 处理社交媒体登录
const handleSocialLogin = (type: string) => {
    showToast(`抱歉，本站正在接入${type === 'wechat' ? '微信' : 'QQ'}登录`);
};

// 发送短信验证码
const sendSmsCode = () => showToast('很抱歉，本站暂时关闭短信登录');

// 登录成功处理函数
const handleLoginSuccess = (res: any) => {
    if (!res.data) {
        showToast('登录返回数据格式错误');
        return;
    }

    try {
        // 存储token
        localStorage.setItem('token', res.data.token);
        
        // 确保info数据存在且有效后再存储
        const userInfo = res.data.info;
        if (userInfo) {
            // 使用userStorage函数存储用户信息，与PC端保持一致
            console.log('保存用户信息', userInfo);
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
        
        // 设置token过期时间
        if (res.data.expireTime) {
            localStorage.setItem('tokenExpire', res.data.expireTime.toString());
        } else {
            // 默认7天过期
            const expireTime = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
            localStorage.setItem('tokenExpire', expireTime.toString());
        }
        
        showToast('登录成功');
        
        // 触发全局事件，保持与PC端一致
        window.dispatchEvent(new Event('userInfoUpdated'));
        // 兼容旧版本事件，确保PopupComponent可以正确处理
        window.dispatchEvent(new CustomEvent('loginSuccess'));
        
        // 返回上一页
        setTimeout(() => router.back(), 1500);
    } catch (error) {
        console.error('存储用户信息失败:', error);
        showToast('登录处理异常，请重试');
    }
};

// 密码登录提交
const onPasswordSubmit = async () => {
    try {
        submitLoading.value = true;
        const res = await authApi.LOGIN_API(passwordForm.value);
        
        if (res.code === 200) {
            // 获取跟踪ID，开始轮询登录结果
            const trackingId = res.data;
            startResultPolling(trackingId);
        } else {
            showToast(res.message || '登录失败');
            submitLoading.value = false;
        }
    } catch (error) {
        console.error('登录失败:', error);
        showToast('登录失败，请重试');
        submitLoading.value = false;
    }
};

// 持续轮询登录结果
function startResultPolling(trackingId: string) {
    let pollCount = 0;
    const maxPolls = 15; // 最多轮询15次
    
    const poll = setInterval(async () => {
        try {
            const res = await authApi.GET_LOGIN_RESULT_API(trackingId);
            
            if (res.code !== 200) {
                if (res.message === "PENDING" && pollCount < maxPolls) {
                    pollCount++;
                    return; // 继续等待
                }
                
                // 超时或失败
                clearInterval(poll);
                submitLoading.value = false;
                showToast(res.message || '登录处理超时');
                return;
            }
            
            // 登录成功，停止轮询
            clearInterval(poll);
            handleLoginSuccess(res);
            submitLoading.value = false;
        } catch (error) {
            clearInterval(poll);
            console.error('登录结果查询失败:', error);
            showToast('登录处理失败，请重试');
            submitLoading.value = false;
        }
    }, 2000); // 每2秒查询一次
}

// 短信登录提交
const onSmsSubmit = async () => {
    try {
        submitLoading.value = true;
        showToast('很抱歉，本站暂时关闭短信登录');
        submitLoading.value = false;
        
        // 以下是真实实现，目前不启用
        /*
        const res = await authApi.APP_SMS_LOGIN_API({
            phone: smsForm.value.phone,
            code: smsForm.value.code
        });
        
        if (res.code === 200) {
            handleLoginSuccess(res);
        } else {
            showToast(res.message || '登录失败');
        }
        */
    } catch (error) {
        console.error('登录失败:', error);
        showToast('登录失败，请重试');
        submitLoading.value = false;
    }
};

// 组件卸载时清除定时器
onUnmounted(() => {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
});
</script>

<style lang="scss" scoped>
.login-container {
    min-height: 100vh;
    background-color: #f7f8fa;
    
    .custom-nav {
        background: transparent;
        
        :deep(.van-nav-bar__title) {
            color: #333;
            font-size: 18px;
            font-weight: 500;
        }
        
        :deep(.van-icon) {
            color: #333;
        }
    }
    
    .login-form {
        padding: 0 20px 40px;
        
        .logo-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px 0 30px;
            
            .logo {
                margin-bottom: 16px;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            }
            
            .welcome-text {
                font-size: 22px;
                color: #333;
                font-weight: 600;
                margin-bottom: 6px;
            }
            
            .welcome-desc {
                font-size: 14px;
                color: #999;
            }
        }
    }
    
    .custom-tabs {
        :deep(.van-tabs__wrap) {
            padding: 0 30px;
        }
        
        :deep(.van-tabs__nav) {
            background: transparent;
        }
        
        :deep(.van-tab) {
            font-size: 16px;
            color: #666;
            
            &.van-tab--active {
                font-weight: 500;
                color: #1989fa;
            }
        }
        
        :deep(.van-tabs__line) {
            width: 20px !important;
            background-color: #1989fa;
            border-radius: 2px;
        }
    }
    
    .login-form-content {
        margin-top: 24px;
        
        .form-group {
            margin: 0 10px;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
            
            :deep(.van-cell) {
                padding: 16px;
            }
        }
        
        .custom-field {
            :deep(.van-field__label) {
                width: 0;
            }
            
            :deep(.van-field__value) {
                padding-left: 10px;
            }
            
            .field-icon {
                font-size: 18px;
                color: #1989fa;
            }
        }
        
        .field-divider {
            height: 1px;
            background-color: #f2f2f2;
            margin: 0 16px;
        }
        
        .code-btn {
            height: 36px;
            padding: 0 12px;
            font-size: 14px;
            border-radius: 18px;
            background: #1989fa;
            color: white;
            border: none;
            
            &:disabled {
                opacity: 0.6;
                background: #1989fa;
                color: white;
            }
        }
        
        .forgot-password {
            text-align: right;
            padding: 10px 12px;
            font-size: 14px;
            color: #1989fa;
        }
        
        .submit-btn-wrap {
            margin: 24px 12px;
            
            .submit-btn {
                height: 44px;
                font-size: 16px;
                font-weight: 500;
                background: linear-gradient(to right, #1989fa, #39a9fc);
                border: none;
                box-shadow: 0 4px 12px rgba(25, 137, 250, 0.3);
            }
        }
    }
    
    .other-login {
        margin: 30px 0 20px;
        
        .divider {
            display: flex;
            align-items: center;
            color: #999;
            font-size: 14px;
            margin-bottom: 24px;
            
            &::before,
            &::after {
                content: '';
                height: 1px;
                flex: 1;
                background-color: #ebedf0;
            }
            
            span {
                padding: 0 16px;
            }
        }
        
        .social-login {
            display: flex;
            justify-content: center;
            gap: 40px;
            
            .social-btn {
                display: flex;
                flex-direction: column;
                align-items: center;
                cursor: pointer;
                
                span {
                    margin-top: 8px;
                    font-size: 14px;
                    color: #666;
                }
                
                .social-icon {
                    width: 50px;
                    height: 50px;
                    border-radius: 25px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    
                    &.wechat {
                        background: linear-gradient(135deg, #50b674, #07c160);
                    }
                    
                    &.qq {
                        background: linear-gradient(135deg, #1da1f2, #1989fa);
                    }
                }
            }
        }
    }
    
    .agreement {
        text-align: center;
        font-size: 12px;
        color: #999;
        margin-top: 24px;
        
        .link {
            color: #1989fa;
        }
    }
}
</style>