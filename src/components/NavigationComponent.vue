<template>
    <a-flex justify="space-between" style="color: white;width: 80%;margin-top: 1vh;">
        <a-flex>
            <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" theme="dark" class="menu"
                @select="handleSelect" />
        </a-flex>
        <a-flex gap="small">
            <a-input-search v-model:value="searchValue" placeholder="" style="width: 16vw" @search="onSearch" />
            <a-popover placement="bottom" v-if="userInfo.id == 0">
                <template #title>
                    <span>登录后你可以：</span>
                </template>
                <template #content>
                    <a-flex wrap="wrap" gap="small" justify="center" style="font-size: 0.8rem;width: 18vw;">
                        <a-space size="small" v-for="p in LoginPopover" :key="p.label">
                            <component :is="renderIcon(p.icon)" />
                            <div>{{ p.label }}</div>
                        </a-space>
                        <el-button color="#00aee0" style="width: 12vw;"
                            @click="dialogLoginVisible = true">立即登录</el-button>
                        <a-flex>首次使用？<span style="color:#00aee0;cursor: pointer;"
                                @click="dialogLoginVisible = true">点我注册</span></a-flex>
                    </a-flex>
                </template>
                <a-avatar :src="userInfo.avatar" :size="35" class="login_css" @click="dialogLoginVisible = true">
                    {{ userInfo.name }}
                </a-avatar>
            </a-popover>
            <a-popover placement="bottom" v-else>
                <template #content>
                    <a-flex vertical wrap="wrap" gap="small" style="font-size: 0.8rem;width: 10vw;text-align: center;">
                        <div>用户信息：{{ userInfo.name }}</div>
                        <el-button color="#00aee0" style="width: 8vw;margin: 0 auto;" @click="logOut">退出登录</el-button>
                    </a-flex>
                </template>
                <a-avatar :src="userInfo.avatar" :size="35" class="login_css">
                    {{ userInfo.name }}
                </a-avatar>
            </a-popover>
        </a-flex>
    </a-flex>
    <el-dialog v-model="dialogLoginVisible" width="35vw" :close-on-click-modal="false" :align-center="true"
        style="border-radius: 0.5vw;">
        <loginPCView @LoginSuccess="dialogLoginVisible = false, LoadUserInfo()" />
    </el-dialog>
</template>
<script setup lang="ts">
import { onBeforeMount, onMounted, ref, h, onBeforeUnmount } from 'vue';
// import type { CSSProperties } from 'vue';
import * as icons from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';
import WebHeadApi from '../services/web-head'
import { ElButton, ElNotification } from 'element-plus';
// import LoginMobileView from '@/views/auth/loginMobile.vue'
import loginPCView from '@/views/auth/loginPC.vue';
import type { HeadUserInfoModal } from '../model/headInfo';
import AuthApi from '../services/auth';

const dialogLoginVisible = ref<boolean>(false);
const current = ref<string[]>([]);
const items = ref<MenuProps['items']>([]);
const searchValue = ref('');
const isMobile = ref<boolean>(window.innerWidth <= 768);
const userInfo = ref<HeadUserInfoModal>({
    id: 0,
    name: "登录",
    avatar: ''
});

const LoginPopover = [
    {
        label: '免费获取资源',
        icon: 'FileZipTwoTone',
    },
    {
        label: '多端共享资源',
        icon: 'CloudTwoTone',
    },
    {
        label: '发布技术招聘',
        icon: 'ContainerTwoTone',
    },
    {
        label: '发布评论/点赞',
        icon: 'LikeTwoTone',
    }
]
const renderIcon = (iconName: string | undefined) => {
    if (!iconName) return null
    // @ts-ignore
    if (!iconName || !icons[iconName]) {
        console.error(`无效的图标名称：${iconName}`);
        return null;
    }
    // @ts-ignore
    return h(icons[iconName]);
};
//切换路由方法
const handleSelect = ({ key }: { key: string }) => {
    current.value = [key];
    console.log('选中', current.value);
    let path = null;
    if (key.includes('submenu')) {
        // @ts-ignore
        items.value?.forEach(item => {
            // @ts-ignore
            item.children?.forEach(child => {
                if (child.key == key) {
                    path = child.path;
                }
            });
        });
    } else {
        // @ts-ignore
        path = items.value?.find(item => item.key == key).path;
    }
    //路由跳转
    console.log('路径=', path);
};
//搜索方法
const onSearch = (value: string) => {
    console.log('搜索内容', value);
}
//退出登陆方法
const logOut = async () => {
    let res = await AuthApi.LOG_OUT_API();    
    if (res.code != 200) return alert(res.message);
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    userInfo.value = {
        id: 0,
        avatar: "",
        name: "登录"
    }
    ElNotification({
        title: '鉴权系统',
        message: '您已退出登录',
        type: 'warning',
        duration: 2500,
    })
    LoadUserInfo()
}
const navigationInit = async () => {
    let res = await WebHeadApi.GET_HEAD_INFO_API();
    if (res.code == 400) alert(res.message);
    // console.log('res', res);
    items.value = []
    res.data.forEach(item => {
        const menuItem: any = {
            label: item.label,
            key: `menu-${item.key}`,
            icon: () => renderIcon(item.icon),
            path: item.path,
        };
        if (item.children && item.children.length > 0) {
            menuItem.children = item.children.map(child => ({
                label: child.label,
                key: `submenu-${child.key}`,
                path: child.path,
            }));
        }
        items.value?.push(menuItem);
    })
    current.value = []
    if (items.value.length > 0) {
        // @ts-ignore
        current.value.push(items.value[0].key)
    }
}
//监听窗口大小变化判断是否是手机端
function updateMobile() {
    isMobile.value = window.innerWidth <= 768
}
//加载用户信息
function LoadUserInfo() {
    let userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
        userInfo.value = JSON.parse(userInfoStr)
    }
}

onBeforeMount(() => {
    // console.log('before时间', new Date().toLocaleTimeString());
    navigationInit()
})
onMounted(() => {
    // console.log('mounted时间', new Date().toLocaleTimeString());
    window.addEventListener('resize', updateMobile)
    LoadUserInfo()
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateMobile)
})
</script>
<style lang="less" scoped>
.menu {
    border-radius: 2rem;
    overflow: hidden;
    height: 4vh;
    line-height: 4vh;
    font-weight: bold;
}

.login_css {
    background-color: #00aeec;
    font-weight: bold;
}

.login_css:hover {
    opacity: 0.9;
    cursor: pointer;
}
</style>