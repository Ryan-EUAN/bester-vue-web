<template>
    <div class="profile-form">
        <a-form :model="profileForm" :rules="rules" :label-col="{ span: 4 }" :wrapper-col="{ span: 16 }" ref="formRef">
            <a-form-item label="用户名">
                <a-input v-model:value="profileForm.username" disabled />
            </a-form-item>
            <a-form-item label="真实姓名">
                <a-input placeholder="未实名认证" disabled v-if="!profileForm.realName" />
                <a-input v-model:value="profileForm.realName" disabled v-else />
            </a-form-item>
            <a-form-item label="昵称">
                <a-input v-model:value="profileForm.name" />
            </a-form-item>
            <a-form-item label="性别" name="gender">
                <a-radio-group v-model:value="profileForm.gender">
                    <a-radio :value="1">男</a-radio>
                    <a-radio :value="0">女</a-radio>
                </a-radio-group>
            </a-form-item>
            <a-form-item label="生日" name="birthdayDate">
                <a-date-picker v-model:value="profileForm.birthdayDate" :disabledDate="disabledDate" format="YYYY年MM月DD日"
                    :locale="locale" @change="handleDateChange" />
            </a-form-item>
            <a-form-item label="出生地" name="birthplace">
                <a-cascader v-model:value="profileForm.birthplace" :options="regionOptions" placeholder="请选择出生地" />
            </a-form-item>
            <a-form-item label="居住地" name="residence">
                <a-cascader v-model:value="profileForm.residence" :options="regionOptions" placeholder="请选择居住地" />
            </a-form-item>
            <a-form-item label="手机" name="phone">
                <a-input placeholder="未绑定手机" disabled v-if="!profileForm.phone" />
                <a-input v-model:value="profileForm.phone" disabled v-else />
            </a-form-item>
            <a-form-item label="QQ" name="qq" :rules="[
                { pattern: /^\d{5,11}$/, message: '请输入正确的QQ号' }
            ]">
                <a-input v-model:value="profileForm.qq" />
            </a-form-item>
            <a-form-item label="Email" name="email" :rules="[
                { type: 'email', message: '请输入正确的邮箱地址' }
            ]">
                <a-input v-model:value="profileForm.email" />
            </a-form-item>
            <a-form-item label="个性签名" name="signature">
                <a-textarea v-model:value="profileForm.signature" :rows="4" :maxLength="200" show-count />
            </a-form-item>
            <a-form-item :wrapper-col="{ offset: 4 }">
                <a-button type="primary" @click="handleSubmit">保存修改</a-button>
            </a-form-item>
        </a-form>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message, FormInstance } from 'ant-design-vue';
import PersonalApi from '@/services/personal';
import type { ProfileData } from '@/types/personal';
import { regionOptions } from '@/utils/constants';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';

// 扩展ProfileData类型，添加birthdayDate字段用于日期选择器
interface ProfileFormState extends ProfileData {
    birthdayDate: Dayjs | null;
}

const profileForm = ref<ProfileFormState>({
    username: '',
    realName: '',
    name: '',
    gender: 1,
    birthday: '',
    birthdayDate: null, // 新增字段用于日期选择器
    birthplace: [],
    residence: [],
    phone: '',
    qq: '',
    email: '',
    signature: '',
    avatar: ''
});

// 表单验证规则
const rules = {
    gender: [{ required: true, message: '请选择性别' }],
    birthdayDate: [{ required: true, message: '请选择生日' }],
    birthplace: [{ required: true, message: '请选择出生地' }],
    residence: [{ required: true, message: '请选择居住地' }]
};

// 禁用未来日期
const disabledDate = (current: dayjs.Dayjs) => {
    return current && current > dayjs().endOf('day');
};

// 表单实例引用
const formRef = ref<FormInstance>();

// 处理日期选择
const handleDateChange = (date: Dayjs | null) => {
    profileForm.value.birthdayDate = date;
    profileForm.value.birthday = date ? date.format('YYYY-MM-DD') : null;
};

// 获取个人资料
const getProfile = async () => {
    try {
        const res = await PersonalApi.GET_PROFILE_API();
        if (res.code === 200) {
            profileForm.value = {
                ...res.data,
                birthdayDate: res.data.birthday ? dayjs(res.data.birthday) : null
            };
        }
    } catch (error) {
        message.error('获取个人资料失败');
    }
};

// 处理表单提交
const handleSubmit = async () => {
    try {
        await formRef.value?.validate();
        const formData = {
            ...profileForm.value,
            birthday: profileForm.value.birthday
        };
        const res = await PersonalApi.UPDATE_PROFILE_API(formData);
        if (res.code === 200) {
            message.success('保存成功');
        }
    } catch (error) {
        console.error('表单验证失败:', error);
        message.error('保存失败');
    }
};

onMounted(() => {
    getProfile();
    dayjs.locale('zh-cn');
});
</script>

<style lang="less" scoped>
.profile-form {
    padding: 20px;
    background: #fff;
    border-radius: 8px;
}
</style>