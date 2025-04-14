<template>
  <div class="edit-profile">
    <van-nav-bar title="编辑资料" left-arrow @click-left="goBack" />
    <div class="edit-form">
      <van-cell-group inset>
        <van-cell title="头像">
          <template #right-icon>
            <van-image round width="50" height="50" :src="userInfo.avatar" @click="showAvatarActionSheet" />
          </template>
        </van-cell>
        <van-field v-model="userInfo.username" label="用户名" placeholder="请输入用户名" maxlength="20"
          :rules="[{ required: true, message: '请填写用户名' }]" />
        <van-field v-model="userInfo.signature" rows="3" autosize label="个人简介" type="textarea" maxlength="100"
          placeholder="请输入个人简介" show-word-limit />
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
        <van-cell title="所在地" is-link @click="showAreaPicker">
          <template #value>
            <span>{{ formatResidence || '请选择所在地' }}</span>
          </template>
        </van-cell>
      </van-cell-group>

      <div class="submit-btn">
        <van-button type="primary" block round @click="saveProfile">保存</van-button>
      </div>
    </div>

    <!-- 性别选择器 -->
    <van-popup v-model:show="showGender" position="bottom">
      <van-picker :columns="genderOptions" @confirm="onConfirmGender" @cancel="showGender = false" show-toolbar
        title="选择性别" />
    </van-popup>

    <!-- 日期选择器 -->
    <van-popup v-model:show="showDate" position="bottom">
      <van-date-picker title="选择生日" :min-date="minDate" :max-date="maxDate" @confirm="onConfirmDate"
        @cancel="showDate = false" />
    </van-popup>

    <!-- 头像操作菜单 -->
    <van-action-sheet v-model:show="showAvatarSheet" :actions="avatarActions" cancel-text="取消"
      @select="onSelectAvatarAction" />

    <!-- 地区选择器 -->
    <van-popup v-model:show="showArea" position="bottom">
      <van-cascader v-model="areaActiveId" title="请选择所在地" :options="formattedRegionOptions" @close="showArea = false"
        @finish="onConfirmArea" />
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showLoadingToast, closeToast } from 'vant';
import PersonalService from '@/services/personal';
import type { ProfileData } from '@/types/personal';
import { regionOptions } from '@/utils/constants';

const router = useRouter();

// 用户信息
const userInfo = ref<ProfileData>({
  avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  username: '',
  realName: '',
  gender: 0,
  birthday: '',
  birthplace: [],
  residence: [],
  phone: '',
  qq: '',
  email: '',
  signature: '',
  name: ''
});

// 性别选择
const showGender = ref(false);
const genderOptions = [
  { text: '女', value: 0 },
  { text: '男', value: 1 }
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

// 地区选择相关
const showArea = ref(false);
const areaActiveId = ref('');

// 根据 Vant 的 Cascader 组件格式要求，处理地区数据
const formattedRegionOptions = regionOptions.map(province => {
  return {
    text: province.label,
    value: province.value,
    children: province.children.map(city => {
      return {
        text: city.label,
        value: city.value,
        children: city.children.map(district => {
          return {
            text: district.label,
            value: district.value
          };
        })
      };
    })
  };
});

// 查找地区名称的函数
const findRegionName = (code: string) => {
  if (!code) return '';

  const codes = code.split(',');
  // 查找省
  const province = regionOptions.find(item => item.value === codes[0]);
  if (!province) return '';

  // 查找市
  if (codes.length < 2) return province.label;
  const city = province.children.find(item => item.value === codes[1]);
  if (!city) return province.label;

  // 查找区/县
  if (codes.length < 3) return `${province.label} ${city.label}`;
  const district = city.children.find(item => item.value === codes[2]);
  if (!district) return `${province.label} ${city.label}`;

  return `${province.label} ${city.label} ${district.label}`;
};

// 格式化显示所在地
const formatResidence = computed(() => {
  // 将地区代码转换为中文名称
  if (typeof userInfo.value.residence === 'string') {
    return findRegionName(userInfo.value.residence);
  }

  return findRegionName(userInfo.value.residence.join(','));
});

// 打开地区选择器
const showAreaPicker = () => {
  areaActiveId.value = userInfo.value.residence[0];
  showArea.value = true;
};

// 确认地区选择
const onConfirmArea = ({ selectedOptions }: { selectedOptions: Array<{ value: string, text: string }> }) => {
  // 将选择的地区代码转为逗号分隔的字符串
  const codeArray = selectedOptions.map(option => option.value);
  // 保存为逗号分隔的字符串，与后端数据格式匹配
  userInfo.value.residence = codeArray;
  showArea.value = false;
};

// 获取用户信息
const loadUserInfo = async () => {
  try {
    showLoadingToast({
      message: '加载中...',
      forbidClick: true,
    });
    const res = await PersonalService.GET_PROFILE_API();
    if (res.code === 200) {
      userInfo.value = res.data;
    } else {
      showToast(res.message || '获取用户信息失败');
    }
  } catch (error) {
    showToast('获取用户信息失败');
    console.error(error);
  } finally {
    closeToast();
  }
};

// 保存资料
const saveProfile = async () => {
  if (!userInfo.value.username) {
    showToast('请填写用户名');
    return;
  }

  try {
    showLoadingToast({
      message: '保存中...',
      forbidClick: true,
    });

    // 确保数据格式正确，后端期望字符串格式的residence
    const profileData = { ...userInfo.value };
    const res = await PersonalService.UPDATE_PROFILE_API(profileData);
    if (res.code === 200) {
      showToast('保存成功');
      setTimeout(() => {
        router.back();
      }, 1000);
    } else {
      showToast(res.message || '保存失败');
    }
  } catch (error) {
    showToast('保存失败');
    console.error(error);
  } finally {
    closeToast();
  }
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