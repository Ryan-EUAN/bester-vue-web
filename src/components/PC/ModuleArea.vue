<template>
    <div class="module-area-wrapper">
        <!-- 标题栏 -->
        <div class="area-header">
            <div class="title-line">
                <span class="title-text">{{ props.titleText }}</span>
            </div>
            <a-tooltip :title="isCollapsed ? '展开' : '折叠'">
                <a-button type="text" class="collapse-btn" @click="toggleCollapse">
                    <template #icon>
                        <MinusOutlined v-if="!isCollapsed" />
                        <PlusOutlined v-else />
                    </template>
                </a-button>
            </a-tooltip>
        </div>

        <!-- 内容区域 - 添加 transition -->
        <transition name="collapse-transition" @enter="handleEnter" @after-enter="handleAfterEnter"
            @leave="handleLeave">
            <div class="module-content" v-if="!isCollapsed">
                <a-flex wrap="wrap" :gap="16">
                    <div v-for="(item, index) in props.moduleList" :key="index" class="module-item"
                        @click="handleNavigate(item)">
                        <a-flex gap="middle" class="item-container">
                            <!-- 左侧图标 -->
                            <div class="icon-wrapper">
                                <img :src="item.icon" class="module-icon" />
                            </div>
                            <!-- 右侧内容区 -->
                            <a-flex vertical justify="space-between" class="content-wrapper">
                                <!-- 标题行 -->
                                <a-flex align="center" gap="small" class="title-row">
                                    <span class="module-name">{{ item.name }}</span>
                                    <span v-if="item.count" class="count">({{ item.count }})</span>
                                </a-flex>
                                <!-- 信息行 -->
                                <a-flex justify="space-between" align="center" class="info-row">
                                    <span class="stats">主题: {{ item.topics }}, 帖数: {{ item.posts }}</span>
                                    <span class="last-post">{{ item.lastPost }}</span>
                                </a-flex>
                            </a-flex>
                        </a-flex>
                    </div>
                </a-flex>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons-vue';
import { useRouter } from 'vue-router';
import { Tooltip as ATooltip } from 'ant-design-vue';  // 新增导入

const router = useRouter();
const props = defineProps(["titleText", "moduleList"])

// 折叠状态
const isCollapsed = ref(false);

// 切换折叠状态
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

const handleNavigate = (item: any) => {
    console.log('模块项=', item);
    
    // 如果有指定路径，则使用该路径
    if (item.path) {
        router.push(item.path);
        return;
    }
    
    // 获取模块ID，如果有plateId则使用plateId，否则尝试获取其他ID形式
    let moduleId = item.plateId || item.id;
    
    // 如果没有任何ID，则生成一个随机ID
    if (!moduleId) {
        moduleId = Math.floor(Math.random() * 10) + 1; // 模拟一个1-10的模块ID
        console.log('使用随机生成的模块ID:', moduleId);
    }
    
    // 保存模块信息到本地存储以便ArticleList页面使用
    const moduleInfo = {
        id: moduleId,
        title: item.name || '模块详情',
        description: item.description || '查看该模块下的所有文章'
    };
    
    localStorage.setItem('currentModuleInfo', JSON.stringify(moduleInfo));
    
    router.push(`/module/${moduleId}`);
};

// 添加动画处理函数
const handleEnter = (el: Element) => {
    const height = el.scrollHeight;
    (el as HTMLElement).style.height = '0px';
    (el as HTMLElement).style.opacity = '0';
    requestAnimationFrame(() => {
        (el as HTMLElement).style.height = `${height}px`;
        (el as HTMLElement).style.opacity = '1';
    });
};

const handleAfterEnter = (el: Element) => {
    (el as HTMLElement).style.height = '';
    (el as HTMLElement).style.opacity = '';
};

const handleLeave = (el: Element) => {
    const height = el.scrollHeight;
    (el as HTMLElement).style.height = `${height}px`;
    (el as HTMLElement).style.opacity = '1';
    requestAnimationFrame(() => {
        (el as HTMLElement).style.height = '0px';
        (el as HTMLElement).style.opacity = '0';
    });
};
</script>

<style lang="less" scoped>
.module-area-wrapper {
    margin-top: 1vh;
    border: 0.05vw solid var(--border-color, #e8e8e8);
    border-radius: 0.4vw;
    margin-bottom: 1vh;
    background: var(--card-bg, #f5f5f5);

    .area-header {
        position: relative;
        padding: 1vh 1vw;
        border-bottom: 0.05vw solid var(--border-color, #e8e8e8);
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--secondary-bg, #fafafa);
        border-radius: 0.4vw 0.4vw 0 0;

        .title-line {
            position: relative;
            flex: 1;

            &::before {
                content: '';
                position: absolute;
                left: -1vw;
                top: 50%;
                transform: translateY(-50%);
                width: 0.2vw;
                height: 2vh;
                background: var(--accent-color, #1890ff);
                border-radius: 0 0.1vw 0.1vw 0;
            }

            .title-text {
                font-size: 0.9vw;
                font-weight: bold;
                color: var(--primary-text, #333);
                margin-left: 0.2vw;
            }
        }

        .collapse-btn {
            padding: 0.4vh 0.4vw;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-text, #333);

            &:hover {
                background: rgba(0, 174, 224, 0.1);
            }

            :deep(.anticon) {
                font-size: 1rem;
            }
        }
    }

    .module-content {
        padding: 16px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        :deep(.ant-flex) {
            width: 100%;
        }

        .module-card {
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

            &:hover {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
        }
    }
}

// 添加过渡动画样式
.collapse-transition-enter-active,
.collapse-transition-leave-active {
    transition: all 0.3s ease-in-out;
    overflow: hidden;
}

.collapse-transition-enter-from,
.collapse-transition-leave-to {
    opacity: 0;
    height: 0;
    padding-top: 0;
    padding-bottom: 0;
}

.module-item {
    width: calc(25% - 12px); // 一行四个，考虑间距
    background: var(--list-item-bg, #f8f8f8);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;

    &:hover {
        background: var(--list-item-hover, #f0f0f0);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px var(--shadow-color, rgba(0, 0, 0, 0.1));
    }

    .item-container {
        padding: 12px;
    }

    .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;

        .module-icon {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 6px;
            object-fit: cover;
        }
    }

    .content-wrapper {
        flex: 1;
        min-width: 0; // 防止文本溢出

        .title-row {
            margin-bottom: 4px;

            .module-name {
                font-size: 0.9rem;
                font-weight: 600;
                color: var(--primary-text, #333);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .count {
                font-size: 0.7rem;
                color: #ff6b6b;
                flex-shrink: 0;
            }
        }

        .info-row {
            font-size: 0.7rem;
            color: var(--secondary-text, #666);

            .stats {
                color: var(--secondary-text, #888);
            }

            .last-post {
                color: var(--secondary-text, #999);
                font-size: 0.65rem;
            }
        }
    }
}

// 折叠状态下的样式
.module-area-wrapper:has(.module-content[style*="display: none"]) {
    .area-header {
        border-bottom: none;
        border-radius: 0.4vw;
    }
}
</style>