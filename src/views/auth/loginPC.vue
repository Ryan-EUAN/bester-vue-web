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
            <el-button type="primary" @click="loginMethod" class="login_css"
                :disabled="form.username == ''">登录</el-button>
        </el-form-item>
    </el-form>
    <el-form :model="formEmail" v-else>
        <el-form-item>
            <el-input v-model="formEmail.email" placeholder="请输入邮箱">
                <template #prepend>邮箱</template>
                <template #append>
                    @qq.com
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-input v-model="formEmail.code" type="password" :show-password="true">
                <template #prepend>验证码</template>
                <template #append>
                    <el-button @click="getCode" :disabled="sendCodeInfo.state">
                        {{ sendCodeInfo.state ? `${sendCodeInfo.time}秒后重新获取` : '获取验证码' }}
                    </el-button>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="loginEmailMethod" class="login_css">登录/注册</el-button>
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
import AuthApi from '../../services/auth'
import { ElButton, ElNotification, ElPopover } from 'element-plus'

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

const formEmail = ref<LoginEmailModel>({
    email: '',
    code: ''
})
//每秒定时器
const timer = ref()
//登录方法
const loginMethod = async () => {
    let login_api = await AuthApi.LOGIN_API(form.value)
    localStorage.setItem('token', login_api.data.token)
    localStorage.setItem('userInfo', JSON.stringify(login_api.data.info))
    ElNotification({
        title: '鉴权系统',
        message: '登录成功',
        type: 'success',
        duration: 2000,
    })
    emits('LoginSuccess')
}

async function loginEmailMethod() {
    let login_email_api = await AuthApi.LOGIN_EMAIL_API(formEmail.value);
    localStorage.setItem('token', login_email_api.data.token)
    localStorage.setItem('userInfo', JSON.stringify(login_email_api.data.info))
    ElNotification({
        title: '鉴权系统',
        message: '登录成功',
        type: 'success',
        duration: 2000,
    })
    formEmail.value = {
        email: '',
        code: ''
    }
    emits('LoginSuccess')
}

function getCode() {
    if (formEmail.value.email == '') {
        ElNotification({
            title: '鉴权系统',
            message: '请输入邮箱',
            type: 'warning',
            duration: 2000,
        })
        return;
    }
    //发送验证码
    AuthApi.GET_CODE_API(formEmail.value.email).then(res => {
        if (res.code != 200) return ElNotification({
            title: '鉴权系统',
            message: res.message,
            type: 'error',
        })
        sendCodeInfo.value = {
            state: true,
            time: 60
        }
        ElNotification({
            title: '鉴权系统',
            message: '验证码已发送，请注意查收',
            type: 'success',
            duration: 2000,
        })
    })
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
    margin: 1vw 3vw;
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

.el-button {
    border-radius: 0.5rem;
}
</style>