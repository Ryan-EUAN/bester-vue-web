<template>
    <div class="content-layout" :class="{ 'dark-theme': isDarkMode }">
        <!-- 左侧菜单 -->
        <a-menu
            v-model:selectedKeys="selectedKey"
            mode="inline"
            class="side-menu"
            @select="handleMenuSelect"
            :theme="isDarkMode ? 'dark' : 'light'"
        >
            <a-menu-item v-for="menu in menuItems" :key="menu.key">
                <template #icon><component :is="menu.icon" /></template>
                {{ menu.label }}
            </a-menu-item>
        </a-menu>

        <!-- 右侧内容区 -->
        <div class="content-area">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
    FileTextOutlined,
    CommentOutlined
} from '@ant-design/icons-vue';
import { useTheme } from '@/composables/useTheme';

const router = useRouter();
const route = useRoute();
const { isDarkMode } = useTheme();

// 菜单配置
const menuItems = [
    { key: 'my-articles', label: '我的文章', icon: FileTextOutlined, path: '/my-articles' },
    { key: 'my-replies', label: '最新回复', icon: CommentOutlined, path: '/my-replies' }
];

// 根据当前路由设置选中的菜单项
const selectedKey = ref([route.path.split('/')[1] || 'my-articles']);

// 处理菜单选择
const handleMenuSelect = ({ key }: { key: string }) => {
    const menuItem = menuItems.find(item => item.key === key);
    if (menuItem) {
        router.push(menuItem.path);
    }
};
</script>

<style lang="less" scoped>
.content-layout {
    display: flex;
    height: 80vh;
    background: #fff;
    margin: 2vh auto;
    width: 85vw;
    border-radius: 0.4vw;
    box-shadow: 0 0.2vh 1vh rgba(0,0,0,0.1);
    overflow: hidden;
    transition: all 0.3s ease;

    &.dark-theme {
        background: #141414;
        box-shadow: 0 0.2vh 1vh rgba(0,0,0,0.3);

        .side-menu {
            border-right-color: #303030;
            background: #141414;
        }

        .content-area {
            background: #141414;

            :deep(.ant-card) {
                background: #141414;
                color: rgba(255, 255, 255, 0.85);

                .ant-card-head {
                    border-bottom-color: #303030;
                    color: rgba(255, 255, 255, 0.85);
                }
            }

            :deep(.ant-list-item) {
                border-bottom-color: #303030;

                &:hover {
                    background: #1f1f1f;
                }

                .ant-list-item-meta-title {
                    color: rgba(255, 255, 255, 0.85);
                    
                    a {
                        color: rgba(255, 255, 255, 0.85);
                        
                        &:hover {
                            color: #1890ff;
                        }
                    }
                }

                .ant-list-item-meta-description {
                    color: rgba(255, 255, 255, 0.45);
                }

                .article-content {
                    color: rgba(255, 255, 255, 0.65);
                }

                .article-time {
                    color: rgba(255, 255, 255, 0.45);
                }
            }
        }
    }

    .side-menu {
        width: 12vw;
        border-right: 1px solid #f0f0f0;
        background: #fff;
        transition: all 0.3s ease;
    }

    .content-area {
        flex: 1;
        padding: 0;
        overflow-y: auto;
        background: #fff;
        transition: all 0.3s ease;

        :deep(.ant-card) {
            border: none;
            
            .ant-card-head {
                padding: 0 20px;
                min-height: 48px;
                border-bottom: 1px solid #f0f0f0;
                
                .ant-card-head-title {
                    padding: 12px 0;
                }
                
                .ant-card-extra {
                    padding: 12px 0;
                }
            }
            
            .ant-card-body {
                padding: 16px 20px;
            }
        }

        :deep(.ant-list-item) {
            padding: 12px 20px;
            
            &:hover {
                background: #fafafa;
            }

            .ant-list-item-meta {
                align-items: center;
                margin-bottom: 0;

                .ant-list-item-meta-title {
                    margin-bottom: 0;
                    line-height: 1.5;
                    display: flex;
                    align-items: center;
                    gap: 12px;

                    a {
                        flex: 1;
                        color: rgba(0, 0, 0, 0.85);
                        
                        &:hover {
                            color: #1890ff;
                        }
                    }

                    .article-time {
                        font-size: 12px;
                        color: #999;
                        font-weight: normal;
                        white-space: nowrap;
                    }
                }
            }

            .article-content {
                color: rgba(0, 0, 0, 0.45);
                margin: 8px 0;
                line-height: 1.5;
            }
        }
    }
}
</style> 