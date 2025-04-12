<template>
    <a-flex justify="space-between" class="nav-container">
        <a-flex>
            <a-menu v-model:selectedKeys="current" mode="horizontal" :items="items" theme="dark" class="menu"
                @click="handleSelect" />
        </a-flex>
        <a-flex gap="small">
            <a-input-search v-model:value="searchValue" placeholder="" class="search-input" @search="onSearch" />
            <a-popover placement="bottom" v-if="userInfo.id == 0">
                <template #title>
                    <span class="popover-title">登录后你可以：</span>
                </template>
                <template #content>
                    <a-flex wrap="wrap" gap="small" justify="center" class="login-popover">
                        <a-space size="small" v-for="p in LoginPopover" :key="p.label">
                            <component :is="renderIcon(p.icon)" />
                            <div>{{ p.label }}</div>
                        </a-space>
                        <el-button color="#00aee0" class="login-btn" @click="$emit('openLogin')">立即登录</el-button>
                        <a-flex class="register-text">首次使用？<span @click="$emit('openLogin')">点我注册</span></a-flex>
                    </a-flex>
                </template>
                <a-avatar :src="userInfo.avatar" size="2.5vw" class="login-avatar" @click="$emit('openLogin')">
                    {{ userInfo.name }}
                </a-avatar>
            </a-popover>
            <a-popover placement="bottom" v-else>
                <template #content>
                    <a-card class="user-card" :bordered="false">
                        <div class="avatar-wrapper">
                            <a-avatar :size="50" :src="userInfo.avatar || '/default-avatar.png'" />
                        </div>
                        <a-space direction="vertical" class="card-content">
                            <div class="user-info">
                                <div class="user-name">{{ userInfo.name }}</div>
                                <a-space align="center" class="currency-info">
                                    <span class="currency-item">
                                        <crown-outlined class="icon" />
                                        <span>{{ userInfo.hardCurrency || 869 }}</span>
                                    </span>
                                    <a-divider type="vertical" />
                                    <span class="currency-item">
                                        <gift-outlined class="icon" />
                                        <span>{{ userInfo.bCurrency || 0 }}</span>
                                    </span>
                                </a-space>
                            </div>
                            <div class="level-progress">
                                <a-progress :percent="70" :stroke-width="4" :show-info="false" status="active"
                                    class="progress-bar" />
                                <div class="level-text">
                                    <trophy-outlined class="icon" />
                                    <span>Lv.{{ userInfo.nextLevel || 5 }}</span>
                                    <span class="growth-text">还需{{ userInfo.needGrowth || 3770 }}成长值</span>
                                </div>
                            </div>
                            <div class="stats-container">
                                <div class="stat-item">
                                    <div class="number">{{ userInfo.following }}</div>
                                    <div class="label">关注</div>
                                </div>
                                <a-divider type="vertical" />
                                <div class="stat-item">
                                    <div class="number">{{ userInfo.followers}}</div>
                                    <div class="label">粉丝</div>
                                </div>
                                <a-divider type="vertical" />
                                <div class="stat-item">
                                    <div class="number">{{ userInfo.posts }}</div>
                                    <div class="label">动态</div>
                                </div>
                            </div>
                            <a-menu class="action-menu" :bordered="false">
                                <a-menu-item key="profile" @click="goToPersonal">
                                    <user-outlined />个人中心
                                </a-menu-item>
                                <a-menu-item key="posts" @click="$router.push('/release')">
                                    <file-outlined />发布帖子
                                </a-menu-item>
                                <a-menu-item key="recommend">
                                    <star-outlined />推荐服务
                                </a-menu-item>
                                <a-menu-divider />
                                <a-menu-item key="logout" danger @click="logOut">
                                    <logout-outlined />退出登录
                                </a-menu-item>
                            </a-menu>
                        </a-space>
                    </a-card>
                </template>
                <a-avatar :src="userInfo.avatar" :size="35" class="login_css">
                    {{ userInfo.name }}
                </a-avatar>
            </a-popover>
        </a-flex>
    </a-flex>
</template>
<script setup lang="ts">
import { onBeforeMount, onMounted, ref, h, onBeforeUnmount } from 'vue';
// import type { CSSProperties } from 'vue';
import * as icons from '@ant-design/icons-vue';
import type { MenuProps } from 'ant-design-vue';
import { ElButton, ElNotification } from 'element-plus';
import type { HeadUserInfoModal } from '../../model/headInfo';
import AuthApi from '../../services/auth';
import {
    UserOutlined,
    FileOutlined,
    StarOutlined,
    LogoutOutlined,
    CrownOutlined,
    GiftOutlined,
    TrophyOutlined,
    HomeOutlined,
    ToolOutlined,
    AppstoreOutlined,
    CompassOutlined
} from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import userStorage from '@/utils/userStorage';

const emits = defineEmits(['openLogin']);

// 静态导航菜单数据
const items = ref<MenuProps['items']>([
    {
        label: '首页',
        key: 'menu-1',
        icon: () => h(HomeOutlined),
        // @ts-ignore
        path: ''
    },
    {
        label: '老板找技术',
        key: 'menu-2',
        icon: () => h(ToolOutlined),
        // @ts-ignore
        path: 'zjs'
    },
    {
        label: '站点功能',
        key: 'menu-3',
        icon: () => h(AppstoreOutlined),
        // @ts-ignore
        path: 'zd'
    },
    {
        label: '快捷导航',
        key: 'menu-4',
        icon: () => h(CompassOutlined),
        // @ts-ignore
        path: 'kj',
        children: [
            {
                label: '每日签到',
                key: 'submenu-41',
                // @ts-ignore
                path: 'qd'
            },
            {
                label: '排行榜',
                key: 'submenu-42',
                // @ts-ignore
                path: 'ph'
            }
        ]
    }
]);

const current = ref<string[]>(['menu-1']);
const searchValue = ref('');
const isMobile = ref<boolean>(window.innerWidth <= 768);
const userInfo = ref<HeadUserInfoModal>({
    id: 0,
    name: "登录",
    avatar: '',
    hardCurrency: 0,
    bCurrency: 0,
    nextLevel: 0,
    needGrowth: 0,
    following: 0,
    followers: 0,
    posts: 0
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
    router.push("/" + path)
};
//搜索方法
const onSearch = (value: string) => {
    console.log('搜索内容', value);
}
//退出登陆方法
const logOut = async () => {
    let res = await AuthApi.LOG_OUT_API();
    if (res.code != 200) return alert(res.message);
    userStorage.logOut();
    userInfo.value = {
        id: 0,
        avatar: "",
        name: "登录",
        hardCurrency: 0,
        bCurrency: 0,
        nextLevel: 0,
        needGrowth: 0,
        following: 0,
        followers: 0,
        posts: 0
    }
    ElNotification({
        title: '鉴权系统',
        message: '您已退出登录',
        type: 'warning',
        duration: 2500,
    })
    LoadUserInfo()
}
//监听窗口大小变化判断是否是手机端
function updateMobile() {
    isMobile.value = window.innerWidth <= 768
}
//加载用户信息
function LoadUserInfo() {
    let infoStr = localStorage.getItem('userInfo');
    if (infoStr) {
        let info = JSON.parse(infoStr);
        userInfo.value = {
            posts: info.posts,
            followers: info.followers,
            following: info.following,
            name: info.name,
            avatar: info.avatar,
            id: info.id,
            hardCurrency: 0,
            bCurrency: 0,
            nextLevel: 0,
            needGrowth: 0
        }
    } else {
        userInfo.value = {
            posts: 0,
            followers: 0,
            following: 0,
            name: "登录",
            avatar: "",
            id: 0,
            hardCurrency: 0,
            bCurrency: 0,
            nextLevel: 0,
            needGrowth: 0
        }
    }
}

const router = useRouter();

// 跳转到个人中心
const goToPersonal = () => {
    router.push('/personal');
};

// 从localStorage获取用户信息
const getUserInfoFromStorage = () => {
    LoadUserInfo();
};

// 监听登录事件
const handleLoginSuccess = () => {
    getUserInfoFromStorage();
};

// 创建自定义事件监听器
window.addEventListener('loginSuccess', handleLoginSuccess);

onBeforeMount(() => {
    // 不再调用 navigationInit
})
onMounted(() => {
    // console.log('mounted时间', new Date().toLocaleTimeString());
    window.addEventListener('resize', updateMobile)
    getUserInfoFromStorage()
    // 监听用户信息更新事件
    window.addEventListener('userInfoUpdated', getUserInfoFromStorage)
    LoadUserInfo();
})
onBeforeUnmount(() => {
    window.removeEventListener('resize', updateMobile)
    window.removeEventListener('userInfoUpdated', getUserInfoFromStorage)
})
</script>
<style lang="less" scoped>
.nav-container {
    color: white;
    width: 80vw;
    margin-top: 1vh;
}

.menu {
    border-radius: 2rem;
    overflow: hidden;
    height: 4vh;
    line-height: 4vh;
    font-weight: bold;
}

.search-input {
    width: 16vw;
}

.login-popover {
    font-size: 0.875rem;
    width: 18vw;
}

.login-btn {
    width: 12vw;
}

.register-text {
    font-size: 0.875rem;

    span {
        color: #00aee0;
        cursor: pointer;
        margin-left: 0.5vw;
    }
}

.login-avatar {
    background-color: #00aeec;
    font-weight: bold;
    cursor: pointer;

    &:hover {
        opacity: 0.9;
    }
}

:deep(.ant-menu-item) {
    padding: 0 1.5vw !important;
    font-size: 1rem;
}

.login_css {
    background-color: #00aeec;
    font-weight: bold;
}

.login_css:hover {
    opacity: 0.9;
    cursor: pointer;
}

.user-card {
    width: 15vw;
    text-align: center;
    position: relative;
    background: #fff;
    border-radius: 0.8vw;
    box-shadow: 0 0.2vh 1vh rgba(0, 0, 0, 0.1);

    .avatar-wrapper {
        position: absolute;
        left: 50%;
        top: 0;
        transform: translate(-50%, -50%);
        background: #fff;
        padding: 0.1vw;
        border-radius: 50%;
        box-shadow: 0 0.2vh 0.5vh rgba(0, 0, 0, 0.1);
        z-index: 1;

        :deep(.ant-avatar) {
            width: 3.5vw;
            height: 3.5vw;
            border: 0.15vw solid #fff;
        }
    }

    .card-content {
        padding-top: 1vh;
    }

    .user-info {
        text-align: center;
        margin-bottom: 1vh;

        .user-name {
            font-size: 1.2vw;
            font-weight: bold;
            margin-bottom: 0.5vh;
            color: #333;
        }

        .currency-info {
            .currency-item {
                display: flex;
                align-items: center;
                gap: 0.3vw;
                color: #666;
                font-size: 0.8vw;

                .icon {
                    color: #ffd700;
                }
            }
        }
    }

    .level-progress {

        .progress-bar {
            :deep(.ant-progress-bg) {
                background: linear-gradient(90deg, #00a1d6 0%, #00b5e5 100%);
            }
        }

        .level-text {
            display: flex;
            align-items: center;
            gap: 0.5vw;
            font-size: 0.7vw;
            color: #666;

            .icon {
                color: #00a1d6;
            }

            .growth-text {
                margin-left: auto;
                color: #999;
            }
        }
    }

    .stats-container {
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 1vh 0;
        border-top: 0.05vw solid #f0f0f0;
        border-bottom: 0.05vw solid #f0f0f0;

        .stat-item {
            text-align: center;

            .number {
                font-size: 1vw;
                font-weight: bold;
                color: #333;
            }

            .label {
                font-size: 0.7vw;
                color: #999;
            }
        }

        :deep(.ant-divider) {
            height: 2vh;
            border-color: #f0f0f0;
        }
    }

    .action-menu {
        width: 15vw;
        margin: 1vh -1.2vw -1.2vw;
        border: none;

        :deep(.ant-menu-item) {
            height: 4vh;
            line-height: 4vh;
            padding: 0 1.2vw;
            margin: 0;
            font-size: 0.8vw;

            &:hover {
                background: #f5f5f5;
            }

            .anticon {
                margin-right: 0.8vw;
            }

            &.ant-menu-item-danger {
                color: #ff4d4f;
            }
        }
    }
}
</style>