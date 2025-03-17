<template>
    <div class="verify-form">
        <a-card title="手机认证" class="verify-card">
            <template v-if="verifyForm.phoneVerified">
                <a-result status="success" title="手机已认证" :sub-title="verifyForm.phone">
                    <template #extra>
                        <a-button type="primary" @click="handleChangePhone">
                            更换手机号
                        </a-button>
                    </template>
                </a-result>
            </template>
            <template v-else>
                <a-form :model="phoneForm" layout="vertical">
                    <a-form-item label="手机号" name="phone" :rules="[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                    ]">
                        <a-input-group compact>
                            <a-input v-model:value="phoneForm.phone" style="width: 70%" placeholder="请输入手机号" />
                            <a-button type="primary" :disabled="!!countdown" @click="sendCode">
                                {{ countdown ? `${countdown}s` : '获取验证码' }}
                            </a-button>
                        </a-input-group>
                    </a-form-item>
                    <a-form-item label="验证码" name="code" :rules="[
                        { required: true, message: '请输入验证码' },
                        { len: 6, message: '请输入6位验证码' }
                    ]">
                        <a-input v-model:value="phoneForm.code" placeholder="请输入验证码" />
                    </a-form-item>
                    <a-form-item>
                        <a-button type="primary" @click="verifyPhone">
                            验证手机号
                        </a-button>
                    </a-form-item>
                </a-form>
            </template>
        </a-card>

        <a-card title="实名认证" class="verify-card">
            <template v-if="verifyForm.identityVerified">
                <a-result status="success" title="实名认证已完成" :sub-title="verifyForm.realName" />
            </template>
            <template v-else>
                <a-form :model="identityForm" layout="vertical">
                    <a-form-item label="真实姓名" name="realName" :rules="[{ required: true, message: '请输入真实姓名' }]">
                        <a-input v-model:value="identityForm.realName" placeholder="请输入真实姓名" />
                    </a-form-item>
                    <a-form-item label="身份证号" name="idCard" :rules="[
                        { required: true, message: '请输入身份证号' },
                        { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号' }
                    ]">
                        <a-input v-model:value="identityForm.idCard" placeholder="请输入身份证号" />
                    </a-form-item>
                    <a-form-item>
                        <a-button type="primary" @click="verifyIdentity">
                            提交认证
                        </a-button>
                    </a-form-item>
                </a-form>
            </template>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import type { VerifyForm } from '@/types/personal';
import PersonalApi from '@/services/personal';

const verifyForm = ref<VerifyForm>({
    phone: '',
    phoneVerified: false,
    realName: '',
    idCard: '',
    identityVerified: false
});

const phoneForm = ref({
    phone: '',
    code: ''
});

const identityForm = ref({
    realName: '',
    idCard: ''
});

const countdown = ref<number>(0);

// 发送验证码
const sendCode = async () => {
    return message.warning('短信验证码功能还在开发中');
    try {
        const res = await PersonalApi.SEND_VERIFY_CODE_API(phoneForm.value.phone);
        if (res.code === 200) {
            message.success('验证码已发送');
            countdown.value = 60;
            const timer = setInterval(() => {
                countdown.value--;
                if (countdown.value <= 0) {
                    clearInterval(timer);
                }
            }, 1000);
        }
    } catch (error) {
        message.error('发送验证码失败');
    }
};

// 验证手机号
const verifyPhone = async () => {
    return message.warning('短信验证码功能还在开发中');
    try {
        const res = await PersonalApi.VERIFY_PHONE_API(phoneForm.value);
        if (res.code === 200) {
            message.success('手机验证成功');
            verifyForm.value.phoneVerified = true;
            verifyForm.value.phone = phoneForm.value.phone;
        }
    } catch (error) {
        message.error('手机验证失败');
    }
};

// 实名认证
const verifyIdentity = async () => {
    try {
        const res = await PersonalApi.VERIFY_IDENTITY_API(identityForm.value);
        if (res.code === 200) {
            message.success('实名认证成功');
            verifyForm.value.identityVerified = true;
            verifyForm.value.realName = identityForm.value.realName;
        }
    } catch (error) {
        message.error('实名认证失败');
    }
};

// 更换手机号
const handleChangePhone = () => {
    verifyForm.value.phoneVerified = false;
    phoneForm.value = {
        phone: '',
        code: ''
    };
};

// 获取认证信息
const getVerifyInfo = async () => {
    try {
        const res = await PersonalApi.GET_VERIFY_INFO_API();
        if (res.code === 200) {
            verifyForm.value = res.data;
        }
    } catch (error) {
        message.error('获取认证信息失败');
    }
};

onMounted(() => {
    getVerifyInfo();
});
</script>

<style lang="less" scoped>
.verify-form {
    .verify-card {
        margin-bottom: 20px;
    }
}
</style>