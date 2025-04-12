<template>
    <a-flex justify="center" gap="small" class="tab_box_css">
        <div class="tab_css" :class="{ 'tab_active': !isEmail }" @click="isEmail = false">密码登录</div>
        <div>|</div>
        <div class="tab_css" :class="{ 'tab_active': isEmail }" @click="isEmail = true">邮箱登录</div>
    </a-flex>
    <el-form :model="form" v-if="!isEmail">
        <el-form-item>
            <el-input v-model="form.username">
                <template #prepend>账号</template>
                <template #append>
                    <el-popover placement="bottom-start" :width="100" trigger="click">
                        <template #default>
                            <div>请使用邮箱登陆自动注册</div>
                            <div style="color: #00aee0;cursor: pointer;" @click="isEmail = true">点我注册</div>
                        </template>
                        <template #reference>
                            <el-button>立即注册</el-button>
                        </template>
                    </el-popover>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-input v-model="form.password" type="password" :show-password="true">
                <template #prepend>密码</template>
                <template #append>
                    <el-popover placement="bottom-start" :width="100" trigger="click">
                        <template #default>
                            <div>请使用邮箱登录账号后修改密码</div>
                            <div style="color: #00aee0;cursor: pointer;" @click="isEmail = true">找回密码</div>
                        </template>
                        <template #reference>
                            <el-button>找回密码</el-button>
                        </template>
                    </el-popover>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="loginMethod" class="login_css" :disabled="form.username == '' || loading"
                :loading="loading">
                {{ loading ? loginStatusMessage : '登录' }}
            </el-button>
        </el-form-item>
    </el-form>
    <el-form :model="formEmail" v-else>
        <el-form-item>
            <el-input v-model="formEmail.email" placeholder="请输入邮箱账号">
                <template #prepend>邮箱</template>
                <template #append>
                    <el-select v-model="emailType" class="email-domain-select">
                        <el-option v-for="item in emailDomains" :key="item.value" :label="item.value"
                            :value="item.value"></el-option>
                    </el-select>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-input v-model="formEmail.code">
                <template #prepend>验证码</template>
                <template #append>
                    <el-button @click="getCode" :disabled="sendCodeInfo.state">
                        {{ sendCodeInfo.state ? `${sendCodeInfo.time}秒后重新获取` : '获取验证码' }}
                    </el-button>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="loginEmailMethod" class="login_css" :loading="loading"
                :disabled="loading">
                {{ loading ? loginStatusMessage : '登录/注册' }}
            </el-button>
        </el-form-item>
    </el-form>
    <a-flex justify="center" style="user-select: none;font-size: 0.8rem;">未注册过Bester的邮箱，我们将帮您自动注册账号</a-flex>
    <a-flex justify="center" style="user-select: none;font-size: 0.8rem;">
        登录或完成注册即代表你同意
        <strong style="color: #00aee0;padding: 0 5px;cursor: pointer;">用户协议</strong>
        和
        <strong style="color: #00aee0;padding: 0 5px;cursor: pointer;">隐私政策</strong>
    </a-flex>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { LoginEmailModel, LoginModel } from '../../model/login'
import AuthApi from '@/services/auth'
import { ElButton, ElPopover } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import Notification from '@/utils/notification'
import storage from '@/utils/storage'
import userStorage from '@/utils/userStorage'
const emits = defineEmits(["LoginSuccess"])

const isEmail = ref<boolean>(false)
const form = ref<LoginModel>({
    username: '',
    password: ''
})
const sendCodeInfo = ref({
    state: false,
    time: 0
})
// 添加loading状态变量
const loading = ref<boolean>(false)
// 添加登录状态消息
const loginStatusMessage = ref<string>('')

// 添加邮箱域名选择
const emailType = ref('@qq.com')
const emailDomains = [
    { label: '@qq.com', value: '@qq.com' },
    { label: '@163.com', value: '@163.com' },
    { label: '@gmail.com', value: '@gmail.com' },
    { label: '@126.com', value: '@126.com' },
    { label: '@outlook.com', value: '@outlook.com' }
]

const formEmail = ref<LoginEmailModel>({
    email: '',
    requestId: '',
    code: ''
})
//每秒定时器
const timer = ref()
const route = useRoute()
const router = useRouter()

//登录方法
const loginMethod = async () => {
    try {
        // 开始加载
        loading.value = true
        loginStatusMessage.value = '正在登录...'

        const res = await AuthApi.LOGIN_API(form.value);
        if (res.code !== 200) {
            loading.value = false
            loginStatusMessage.value = ''
            return Notification.warning(res.message, '鉴权系统', 2000, false)
        }
        const trackingId = res.data;
        startResultPolling(trackingId);
    } catch (error) {
        console.error('请求失败：', error);
        loading.value = false
        loginStatusMessage.value = ''
        Notification.error('登录请求失败', '鉴权系统', 2000, false)
    }
}
//持续轮询登录结果
function startResultPolling(trackingId: string) {
    loginStatusMessage.value = '登录中...'
    const poll = setInterval(async () => {
        try {
            const res = await AuthApi.GET_LOGIN_RESULT_API(trackingId);
            if (res.code !== 200) {
                if (res.message === "PENDING") {
                    loginStatusMessage.value = '正在处理登录请求...'
                    return;
                }
                clearInterval(poll);
                loading.value = false
                loginStatusMessage.value = ''
                Notification.error(res.message, '鉴权系统', 2000, false)
                return;
            }
            clearInterval(poll);
            loading.value = false
            loginStatusMessage.value = ''
            localStorage.setItem('token', res.data.token)
            console.log('信息',res.data.info);
            
            userStorage.setUserInfo(res.data.info)
            if (res.data.expireTime) {
                localStorage.setItem('tokenExpire', res.data.expireTime.toString())
            } else {
                const defaultExpireTime = new Date().getTime() + 24 * 60 * 60 * 1000
                localStorage.setItem('tokenExpire', defaultExpireTime.toString())
            }

            Notification.success('登录成功', '鉴权系统', 2000, false)

            // 触发全局登录成功事件
            window.dispatchEvent(new Event('userInfoUpdated'))

            // 检查是否有重定向地址
            const redirect = route.query.redirect as string
            if (redirect) {
                router.push(redirect)
            } else {
                // 检查会话存储中是否有重定向路径
                const savedRedirectPath = sessionStorage.getItem('redirectPath');
                if (savedRedirectPath) {
                    sessionStorage.removeItem('redirectPath'); // 使用后删除
                    router.push(savedRedirectPath);
                } else {
                    emits('LoginSuccess')
                }
            }
        } catch (error: any) {
            clearInterval(poll);
            loading.value = false
            loginStatusMessage.value = ''
            Notification.error(error.message, '鉴权系统', 2000, false)
        }
    }, 2000);
}
//邮箱登录方法
async function loginEmailMethod() {
    try {
        if (formEmail.value.email == '') return Notification.warning('请输入邮箱账号', '鉴权系统', 2000, false);
        if (formEmail.value.code == '') return Notification.warning('请输入验证码', '鉴权系统', 2000, false);

        // 拼接完整邮箱
        const fullEmail = `${formEmail.value.email}${emailType.value}`;

        loading.value = true;
        loginStatusMessage.value = '正在登录...';

        // 创建新的登录参数对象
        const loginParams = {
            email: fullEmail,
            requestId: storage.getStorage('requestId'),
            code: formEmail.value.code
        };

        let login_email_api = await AuthApi.LOGIN_EMAIL_API(loginParams);
        
        if(login_email_api.code != 200) {
            return Notification.error(login_email_api.message, '鉴权系统', 2000, false)
        }
        loading.value = false
        loginStatusMessage.value = ''
        localStorage.setItem('token', login_email_api.data.token)
        localStorage.setItem('userInfo', JSON.stringify(login_email_api.data.info))
        localStorage.removeItem('requestId')
        if (login_email_api.data.expireTime) {
            localStorage.setItem('tokenExpire', login_email_api.data.expireTime.toString())
        } else {
            const defaultExpireTime = new Date().getTime() + 24 * 60 * 60 * 1000
            localStorage.setItem('tokenExpire', defaultExpireTime.toString())
        }

        Notification.success('登录成功', '鉴权系统', 2000, false)

        // 触发全局登录成功事件
        window.dispatchEvent(new Event('userInfoUpdated'))

        formEmail.value = {
            email: '',
            requestId: '',
            code: ''
        }

        // 检查是否有重定向地址
        const redirect = route.query.redirect as string
        if (redirect) {
            router.push(redirect)
        } else {
            // 检查会话存储中是否有重定向路径
            const savedRedirectPath = sessionStorage.getItem('redirectPath');
            if (savedRedirectPath) {
                sessionStorage.removeItem('redirectPath'); // 使用后删除
                router.push(savedRedirectPath);
            } else {
                emits('LoginSuccess')
            }
        }
    } catch (error:any) {
        loading.value = false
        loginStatusMessage.value = ''
        Notification.error(error.message, '鉴权系统', 2000, false)
    }
}

async function getCode() {
    if (formEmail.value.email == '') return Notification.warning('请输入邮箱账号', '鉴权系统', 2000, false);

    // 拼接完整邮箱
    const fullEmail = `${formEmail.value.email}${emailType.value}`;

    try {
        // 发送验证码请求
        const res = await AuthApi.GET_CODE_API(fullEmail);
        
        if (res.code !== 200) {
            return Notification.error(res.message || '验证码发送失败', '鉴权系统', 2000, false);
        }

        // 存储requestId
        const requestId = res.data;
        storage.setStorage('requestId', requestId);
        
        // 开始轮询验证码发送状态
        let pollCount = 0;
        const maxPolls = 10; // 最多轮询10次
        const pollInterval = 1000; // 每秒轮询一次
        
        const pollTimer = setInterval(async () => {
            try {
                const stateRes = await AuthApi.GET_CODE_RESULT_API(requestId);
                
                if (stateRes.code === 200 && stateRes.data) {
                    // 验证码发送成功
                    clearInterval(pollTimer);
                    sendCodeInfo.value = {
                        state: true,
                        time: 60
                    };
                    Notification.success('验证码已发送，请注意查收', '鉴权系统', 2000, false);
                } else if (pollCount >= maxPolls) {
                    // 超过最大轮询次数
                    clearInterval(pollTimer);
                    storage.removeStorage('requestId');
                    Notification.error('验证码发送超时，请重试', '鉴权系统', 2000, false);
                }
                
                pollCount++;
            } catch (error) {
                clearInterval(pollTimer);
                Notification.error('验证码发送失败', '鉴权系统', 2000, false);
            }
        }, pollInterval);
        
    } catch (error) {
        Notification.error('验证码发送失败', '鉴权系统', 2000, false);
    }
}
//开启计时器
function startTimer() {
    timer.value = setInterval(() => {
        if (sendCodeInfo.value.time > 0) {
            sendCodeInfo.value.time--;
            if (sendCodeInfo.value.time == 0) sendCodeInfo.value.state = false;
        }
    }, 1000);
}
//停止计时器
function stopTimer() {
    clearInterval(timer.value)
}

onMounted(() => {
    startTimer()
})

onBeforeUnmount(() => {
    stopTimer()
})
</script>
<style lang="scss" scoped>
.el-form {
    margin: 1vh 1vw;
}

.tab_box_css {
    height: 3vw;
    font-size: 1rem;
    font-weight: bold;
    user-select: none;
}

.tab_css {
    cursor: pointer;
}

.tab_active {
    color: #00aee0;
}

.login_css {
    width: 80vw;
    margin: 0 auto;
    height: 4vh;
}

.test_btn {
    margin-top: 10px;
    width: 80vw;
    margin: 0 auto;
    height: 4vh;
}

.debug-info {
    margin-top: 20px;
    font-size: 0.8rem;
    color: #888;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 5px;
    text-align: left;
    word-break: break-all;
}

.el-button {
    border-radius: 0.5rem;
}

.el-progress {
    width: 80vw;
    margin: 0 auto;
}

.loading-message {
    text-align: center;
    font-size: 0.9rem;
    color: #909399;
    margin: 8px 0;
}

.email-domain-select {
    width: 10vw;
}
</style>