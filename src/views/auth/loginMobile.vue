<template>
    <el-form :model="form">
        <el-form-item>
            <el-input :placeholder="formDesc.email" v-model="form.email">
                <template #append>
                    <el-select v-model="emailType" style="width: 30vw">
                        <el-option label="qq.com" value="qq.com" />
                        <el-option label="163.com" value="163.com" />
                        <el-option label="gmail.com" value="gmail.com" />
                        <el-option label="sina.com" value="sina.com" />
                        <el-option label="126.com" value="126.com" />
                    </el-select>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-input :placeholder="formDesc.code" v-model="form.code">
                <template #append>
                    <el-button @click="getVerificationCode" :disabled="obtainingCode > 0">
                        {{ formDesc.code_btn }}
                    </el-button>
                </template>
            </el-input>
        </el-form-item>
        <el-form-item>
            <div style="font-weight: bold;">
                <span style="color: red;margin-right: 2vw;">*</span>
                登录福利，享优惠70元
            </div>
            <el-button type="warning" disabled round @click=""
                style="width: 80vw;margin: 0 auto;height: 5vh;">登录</el-button>
        </el-form-item>
        <el-form-item>
            <div style="margin: 0 auto;">未注册用户邮箱验证后自动登录</div>
            <div style="margin: 0 auto;">注册即同意《<strong>服务条款</strong>》与《<strong>隐私政策</strong>》</div>
        </el-form-item>
    </el-form>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import type { LoginMobileModel } from '../../model/login'

const form = ref<LoginMobileModel>({
    email: '',
    code: ''
})
const formDesc = ref({
    email: '请输入邮箱',
    code: '请输入六位验证码',
    code_btn: '获取验证码'
})
const emailType = ref('qq.com')
//验证码倒计时
const obtainingCode = ref<number>(0)
//每秒定时器
const timer = ref()
//获取验证码的方法
function getVerificationCode() {
    if (obtainingCode.value > 0) return;
    obtainingCode.value = 60
    formDesc.value.code_btn = obtainingCode.value + '秒后重试'
}
//开启计时器
function startTimer() {
    timer.value = setInterval(() => {
        if (obtainingCode.value > 0) {
            obtainingCode.value--;
            formDesc.value.code_btn = obtainingCode.value == 0 ? '获取验证码' : obtainingCode.value + '秒后重试'
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
</style>