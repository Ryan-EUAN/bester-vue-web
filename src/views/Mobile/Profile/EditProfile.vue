<template>
  <div class="edit-profile">
    <van-nav-bar
      title="编辑资料"
      left-arrow
      @click-left="goBack"
    />
    <div class="edit-form">
      <van-cell-group inset>
        <van-cell title="头像">
          <template #right-icon>
            <van-image
              round
              width="50"
              height="50"
              :src="userInfo.avatar"
              @click="showAvatarActionSheet"
            />
          </template>
        </van-cell>
        <van-field
          v-model="userInfo.name"
          label="用户名"
          placeholder="请输入用户名"
          maxlength="20"
          :rules="[{ required: true, message: '请填写用户名' }]"
        />
        <van-field
          v-model="userInfo.bio"
          rows="3"
          autosize
          label="个人简介"
          type="textarea"
          maxlength="100"
          placeholder="请输入个人简介"
          show-word-limit
        />
        <van-cell title="性别" is-link @click="showGenderPicker">
          <template #value>
            <span>{{ genderText }}</span>
          </template>
        </van-cell>
        <van-cell title="生日" is-link @click="showDatePicker">
          <template #value>
            <span>{{ userInfo.birthday || '未设置' }}</span>
          </template>
        </van-cell>
        <van-field
          v-model="userInfo.location"
          label="所在地"
          placeholder="请输入所在地"
        />
      </van-cell-group>
      
      <div class="submit-btn">
        <van-button type="primary" block round @click="saveProfile">保存</van-button>
      </div>
    </div>

    <!-- 性别选择器 -->
    <van-popup v-model:show="showGender" position="bottom">
      <van-picker
        :columns="genderOptions"
        @confirm="onConfirmGender"
        @cancel="showGender = false"
        show-toolbar
        title="选择性别"
      />
    </van-popup>
    
    <!-- 日期选择器 -->
    <van-popup v-model:show="showDate" position="bottom">
      <van-date-picker
        title="选择生日"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onConfirmDate"
        @cancel="showDate = false"
      />
    </van-popup>
    
    <!-- 头像操作菜单 -->
    <van-action-sheet
      v-model:show="showAvatarSheet"
      :actions="avatarActions"
      cancel-text="取消"
      @select="onSelectAvatarAction"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showDialog } from 'vant';

const router = useRouter();

// 用户信息
const userInfo = ref({
  avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  name: '',
  bio: '',
  gender: 0, // 0: 未设置, 1: 男, 2: 女
  birthday: '',
  location: ''
});

// 性别选择
const showGender = ref(false);
const genderOptions = [
  { text: '未设置', value: 0 },
  { text: '男', value: 1 },
  { text: '女', value: 2 }
];

const genderText = computed(() => {
  const option = genderOptions.find(option => option.value === userInfo.value.gender);
  return option ? option.text : '未设置';
});

const showGenderPicker = () => {
  showGender.value = true;
};

const onConfirmGender = (value: { text: string, value: number }) => {
  userInfo.value.gender = value.value;
  showGender.value = false;
};

// 日期选择
const showDate = ref(false);
const currentDate = ref<Date>(new Date());
const minDate = new Date(1950, 0, 1);
const maxDate = new Date();

const showDatePicker = () => {
  // 如果已有日期，转换为Date对象
  if (userInfo.value.birthday) {
    try {
      const parts = userInfo.value.birthday.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        currentDate.value = new Date(year, month, day);
      }
    } catch (e) {
      currentDate.value = new Date();
    }
  }
  showDate.value = true;
};

const onConfirmDate = ({ selectedValues }: any) => {
  const year = selectedValues[0];
  const month = selectedValues[1].toString().padStart(2, '0');
  const day = selectedValues[2].toString().padStart(2, '0');
  userInfo.value.birthday = `${year}-${month}-${day}`;
  showDate.value = false;
};

// 头像操作
const showAvatarSheet = ref(false);
const avatarActions = [
  { name: '拍照', color: '#07c160' },
  { name: '从相册选择', color: '#1989fa' }
];

const showAvatarActionSheet = () => {
  showAvatarSheet.value = true;
};

const onSelectAvatarAction = (action: { name: string }) => {
  // 这里应该调用实际的相机或相册API
  showToast(`您选择了${action.name}，此功能实际开发中需要调用原生API`);
};

// 获取用户信息
const loadUserInfo = () => {
  // 这里应该调用实际的API获取用户信息
  // 模拟数据
  setTimeout(() => {
    userInfo.value = {
      avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      name: '测试用户',
      bio: '这是一段个人简介，用于展示在个人主页上。',
      gender: 1,
      birthday: '1990-01-01',
      location: '北京市'
    };
  }, 500);
};

// 保存资料
const saveProfile = () => {
  if (!userInfo.value.name) {
    showToast('请填写用户名');
    return;
  }
  
  // 这里应该调用实际的API保存用户资料
  showToast('保存成功');
  setTimeout(() => {
    router.back();
  }, 1000);
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  loadUserInfo();
});
</script>

<style lang="scss" scoped>
.edit-profile {
  min-height: 100vh;
  background-color: #f7f8fa;
  
  .edit-form {
    padding: 16px;
    
    .submit-btn {
      margin-top: 24px;
    }
  }
}
</style> 