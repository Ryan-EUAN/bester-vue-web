<template>
    <van-popup v-model:show="showPopup" position="left" :style="{ width: '80%', height: '100%' }">
        <div class="popup-container">
            <!-- 用户信息 - 增加高度和点击事件 -->
            <div class="user-info" @click="handleUserInfoClick">
                <van-image round width="50" height="50" :src="userInfo.avatar" />
                <div class="user-detail">
                    <div class="username">{{ userInfo.username }}</div>
                    <div class="user-desc">{{ userInfo.description }} <van-icon name="arrow" /></div>
                </div>
                <van-icon v-if="userInfo.isLogin" name="cross" size="24" @click.stop="handleLogout" />
            </div>

            <!-- 主导航 - 调整位置和间距 -->
            <div class="main-nav-wrapper">
                <div class="main-nav">
                    <van-grid :column-num="4" :border="false">
                        <van-grid-item v-for="item in mainNavItems" :key="item.name">
                            <template #icon>
                                <div class="nav-icon">
                                    <van-icon :name="item.icon" size="24" />
                                </div>
                            </template>
                            <template #text>
                                <span class="nav-text">{{ item.text }}</span>
                            </template>
                        </van-grid-item>
                    </van-grid>
                </div>
            </div>

            <!-- 功能列表 -->
            <div class="feature-list">
                <van-cell-group>
                    <van-cell v-for="item in featureItems" :key="item.name" :title="item.text" is-link>
                        <template #icon>
                            <div class="feature-icon" :style="{ backgroundColor: item.bgColor }">
                                <van-icon :name="item.icon" color="#fff" size="18" />
                            </div>
                        </template>
                    </van-cell>
                </van-cell-group>
            </div>

            <!-- 排行榜 -->
            <div class="section-wrapper">
                <div class="section-title">排行榜单</div>
                <div class="section-content">
                    <van-grid :column-num="4" :border="false">
                        <van-grid-item v-for="item in rankItems" :key="item.name">
                            <template #icon>
                                <div class="rank-icon" :style="{ backgroundColor: item.bgColor }">
                                    <van-icon :name="item.icon" color="#fff" size="20" />
                                </div>
                            </template>
                            <template #text>
                                <span>{{ item.text }}</span>
                            </template>
                        </van-grid-item>
                    </van-grid>
                </div>
            </div>

            <!-- 快捷访问 -->
            <div class="section-wrapper">
                <div class="section-title">快捷访问</div>
                <div class="section-content">
                    <van-grid :column-num="3" :border="false">
                        <van-grid-item v-for="item in quickItems" :key="item.name">
                            <template #icon>
                                <div class="quick-icon" :style="{ backgroundColor: item.bgColor }">
                                    <van-icon :name="item.icon" color="#fff" size="20" />
                                </div>
                            </template>
                            <template #text>
                                <span>{{ item.text }}</span>
                            </template>
                        </van-grid-item>
                    </van-grid>
                </div>
            </div>
        </div>
    </van-popup>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import authApi from '@/services/auth';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const showPopup = ref(false);
const router = useRouter();

// 默认头像
const DEFAULT_AVATAR = 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg';

// 用户信息
const userInfo = ref({
    username: '未登录',
    description: '点击登录',
    avatar: DEFAULT_AVATAR,
    isLogin: false
});

// 检查用户登录状态
const checkLoginStatus = () => {
    // 从本地存储获取用户信息和token过期时间
    const storedUserInfo = localStorage.getItem('userInfo');
    const tokenExpire = localStorage.getItem('tokenExpire');
    const token = localStorage.getItem('token');

    // 检查token是否存在且未过期
    const isTokenValid = token && tokenExpire && new Date().getTime() < parseInt(tokenExpire);

    // 重置为默认未登录状态
    let tempUserInfo = {
        username: '未登录',
        description: '点击登录',
        avatar: DEFAULT_AVATAR,
        isLogin: false
    };

    if (isTokenValid && storedUserInfo) {
        try {
            // 确保storedUserInfo是有效的JSON字符串
            if (typeof storedUserInfo === 'string' && storedUserInfo.trim() !== '') {
                const userInfoObj = JSON.parse(storedUserInfo);
                
                // 确保对象是有效的，并至少有name或id属性
                if (userInfoObj && (userInfoObj.name || userInfoObj.id)) {
                    tempUserInfo = {
                        username: userInfoObj.name || '用户暂未设置昵称',
                        description: '资料与账号',
                        avatar: userInfoObj.avatar || DEFAULT_AVATAR,
                        isLogin: true
                    };
                } else {
                    console.warn('用户信息对象无效', userInfoObj);
                    clearUserData();
                }
            } else {
                console.warn('用户信息字符串无效', storedUserInfo);
                clearUserData();
            }
        } catch (error) {
            console.error('解析用户信息失败:', error, 'Raw data:', storedUserInfo);
            clearUserData();
        }
    } else {
        // 如果token过期或不存在，清除用户数据
        clearUserData();
    }

    // 最后设置用户信息
    userInfo.value = tempUserInfo;
};

// 清除用户数据
const clearUserData = () => {
    // 只清除localStorage中的数据
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('tokenExpire');
    
    // 不再直接修改userInfo，而是由checkLoginStatus统一处理
};

// 主导航项
const mainNavItems = ref([
    { name: 'home', text: '首页', icon: 'home-o' },
    { name: 'community', text: '社区', icon: 'chat-o' },
    { name: 'guide', text: '导读', icon: 'guide-o' },
    { name: 'my', text: '我的', icon: 'user-o' }
]);

// 功能列表
const featureItems = ref([
    { name: 'news', text: '新闻资讯', icon: 'newspaper-o', bgColor: '#3498db' },
    { name: 'forum', text: '论坛导读', icon: 'chat-o', bgColor: '#2ecc71' },
    { name: 'article', text: '勋章中心', icon: 'medal-o', bgColor: '#e67e22' },
    { name: 'tools', text: '道具中心', icon: 'gift-o', bgColor: '#9b59b6' },
    { name: 'tasks', text: '任务中心', icon: 'todo-list-o', bgColor: '#f1c40f' }
]);

// 排行榜项 - 添加了背景颜色
const rankItems = ref([
    { name: 'users', text: '用户', icon: 'friends-o', bgColor: '#3498db' },
    { name: 'topics', text: '主题', icon: 'comment-o', bgColor: '#e74c3c' },
    { name: 'sections', text: '版块', icon: 'chart-trending-o', bgColor: '#2ecc71' },
    { name: 'groups', text: '小组', icon: 'cluster-o', bgColor: '#9b59b6' }
]);

// 快捷访问
const quickItems = ref([
    { name: 'topics', text: '话题中心', icon: 'label-o', bgColor: '#f39c12' },
    { name: 'search', text: '全站搜索', icon: 'search', bgColor: '#3498db' },
    { name: 'settings', text: '系统设置', icon: 'setting-o', bgColor: '#9b59b6' },
    { name: 'theme', text: '风格配置', icon: 'brush-o', bgColor: '#e74c3c' },
    { name: 'pc', text: '电脑版', icon: 'desktop-o', bgColor: '#1abc9c' }
]);

// 退出登录
const handleLogout = async () => {
    try {
        const res = await authApi.LOG_OUT_API();
        if (res.code === 200) {
            message.success('退出登录成功');
            clearUserData();
        } else {
            message.error(res.message || '退出登录失败');
        }
    } catch (error) {
        console.error('退出登录失败:', error);
        message.error('退出登录失败，请重试');
    } finally {
        showPopup.value = false;
    }
};

// 处理用户信息区域点击事件
const handleUserInfoClick = () => {
    if (!userInfo.value.isLogin) {
        // 未登录时，关闭侧边栏并跳转到登录页面
        showPopup.value = false;
        router.push('/auth/loginMobile');
    }
};

// 提供打开弹窗的方法
const open = () => {
    // 每次打开弹窗时检查用户登录状态
    checkLoginStatus();
    showPopup.value = true;
};

// 监听登录成功事件
const listenLoginEvent = () => {
    window.addEventListener('loginSuccess', () => {
        // 登录成功后刷新用户信息
        checkLoginStatus();
    });
};

// 初始化时检查登录状态并添加事件监听
onMounted(() => {
    checkLoginStatus();
    listenLoginEvent();
});

// 暴露方法给父组件
defineExpose({
    open
});
</script>

<style lang="scss" scoped>
.popup-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #f7f8fa;
}

.user-info {
    display: flex;
    align-items: center;
    padding: 6vmin 4vmin 10vmin; // 使用视口单位
    background-color: #1989fa;
    color: white;
    position: relative;

    .user-detail {
        flex: 1;
        margin-left: 3vmin;

        .username {
            font-size: 4.5vmin; // 响应式字体大小
            font-weight: bold;
        }

        .user-desc {
            font-size: 3.5vmin; // 响应式字体大小
            opacity: 0.9;
            display: flex;
            align-items: center;
        }
    }

    .van-icon {
        cursor: pointer;
        font-size: 5vmin; // 响应式图标大小
    }
}

// 优化主导航样式和位置
.main-nav-wrapper {
    display: flex;
    justify-content: center;
    margin-top: -6vmin; // 响应式负边距
    margin-bottom: 3vmin;
    z-index: 10;

    .main-nav {
        width: 90%;
        background-color: white;
        border-radius: 2vmin;
        box-shadow: 0 0.5vmin 3vmin rgba(0, 0, 0, 0.08);
        overflow: hidden;

        .nav-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1vmin;

            .van-icon {
                font-size: 5vmin; // 响应式图标大小
                color: #1989fa;
            }
        }

        .nav-text {
            font-size: 3.5vmin; // 响应式字体大小
            font-weight: 500;
            color: #323233;
        }

        :deep(.van-grid-item__content) {
            padding: 3vmin 2vmin;
            background-color: transparent;

            &::after {
                display: none;
            }

            &:active {
                background-color: #f2f3f5;
            }
        }
    }
}

.feature-list {
    margin-bottom: 3vmin;

    .feature-icon {
        width: 7vmin;
        height: 7vmin;
        border-radius: 1.5vmin;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 2vmin;
    }

    :deep(.van-cell__title) {
        font-size: 3.5vmin; // 响应式字体大小
    }
}

.section-wrapper {
    margin-bottom: 3vmin;
    background-color: white;
    border-radius: 2vmin;
    overflow: hidden;

    .section-title {
        padding: 3vmin 4vmin;
        font-size: 3.8vmin; // 响应式字体大小
        color: #323233;
        font-weight: 500;
        border-bottom: 1px solid #f5f5f5;
    }

    .section-content {
        padding: 2vmin 0;
    }
}

.rank-icon {
    width: 9vmin;
    height: 9vmin;
    border-radius: 2vmin;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1vmin;

    .van-icon {
        font-size: 4.5vmin; // 响应式图标大小
    }
}

.quick-icon {
    width: 10vmin;
    height: 10vmin;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    .van-icon {
        font-size: 4.5vmin; // 响应式图标大小
    }
}

:deep(.van-grid-item__content) {
    padding: 3vmin 2vmin;
}

:deep(.van-grid-item__text) {
    font-size: 3.2vmin; // 响应式字体大小
    margin-top: 1vmin;
}

:deep(.van-cell__title) {
    margin-left: 2vmin;
}
</style>
