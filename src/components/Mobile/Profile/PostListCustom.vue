<template>
    <div class="post-list-custom">
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
            <van-empty v-if="!loading && normalizedPosts.length === 0" description="暂无帖子" />
            <div v-else class="posts-container">
                <van-swipe-cell v-for="(post, index) in normalizedPosts" :key="index" :right-width="80" stop-propagation>
                    <!-- 右侧显示的按钮 -->
                    <template #right>
                        <div class="swipe-actions">
                            <van-button v-if="post.status === 'published'" type="danger" square text="删除"
                                class="swipe-btn delete-btn" @click.stop="deletePost($event, post.id)" />
                            <van-button v-else-if="post.status === 'pending'" type="warning" square text="取消发布"
                                class="swipe-btn cancel-btn" @click.stop="cancelPost($event, post.id)" />
                            <van-button v-else-if="post.status === 'deleted'" type="success" square text="恢复"
                                class="swipe-btn recover-btn" @click.stop="recoverPost($event, post.id)" />
                            <van-button v-else type="danger" square text="删除"
                                class="swipe-btn delete-btn" @click.stop="deletePost($event, post.id)" />
                        </div>
                    </template>

                    <!-- 帖子内容 -->
                    <van-cell-group :border="false" class="cell-group">
                        <div class="post-item" @click="viewPost(post.id)">
                            <div class="post-header">
                                <div class="post-title">{{ post.title || '无标题' }}</div>
                                <span class="status-tag" :class="getStatusClass(post.status)">
                                    {{ getStatusText(post.status) }}
                                </span>
                            </div>
                            
                            <div class="post-content">{{ post.content || '无内容' }}</div>

                            <div class="post-footer">
                                <div class="post-stats">
                                    <span class="stat-item"><van-icon name="eye-o" /> {{ post.browse || 0 }}</span>
                                    <span class="stat-item"><van-icon name="like-o" /> {{ formatLikes(post.likes) }}</span>
                                    <span class="stat-item"><van-icon name="chat-o" />
                                        {{ post.comments ? post.comments.length : 0 }}
                                    </span>
                                </div>
                                <span class="post-time">{{ formatTime(post.time) }}</span>
                            </div>
                        </div>
                    </van-cell-group>
                </van-swipe-cell>
            </div>

            <van-loading v-if="loading" class="list-loading" />
        </van-pull-refresh>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { showDialog } from 'vant';
import { UserPostStatus, type UserPost } from '@/types/article';

// 组件属性
const props = defineProps<{
    posts: UserPost[],
    loading: boolean
}>();

// 组件事件
const emit = defineEmits<{
    refresh: [],
    delete: [postId: string],
    cancel: [postId: string],
    recover: [postId: string]
}>();

const router = useRouter();
const refreshing = ref(false);

// 确保我们的组件能正确处理代理对象
const normalizedPosts = computed(() => {
    if (!props.posts || !Array.isArray(props.posts)) return [];

    return props.posts.map(post => {
        try {
            // 将代理对象转换为普通对象
            const plainPost = {
                id: post.id || '',
                title: post.title || '',
                content: post.content || '',
                time: post.time || '',
                plateId: post.plateId || 0,
                browse: post.browse || 0,
                likes: Array.isArray(post.likes) ? post.likes : [],
                comments: Array.isArray(post.comments) ? post.comments : [],
                status: post.status
            };
            return plainPost;
        } catch (error) {
            console.error('处理帖子数据出错:', error);
            return {
                id: '错误',
                title: '数据处理出错',
                content: '无法显示此帖子',
                time: '',
                plateId: 0,
                browse: 0,
                likes: [],
                comments: [],
                status: UserPostStatus.PUBLISHED // 默认设置为已发布
            };
        }
    });
});

// 查看帖子详情
const viewPost = (postId: string) => {
    router.push(`/post/${postId}`);
};

// 下拉刷新
const onRefresh = () => {
    emit('refresh');
    setTimeout(() => {
        refreshing.value = false;
    }, 1000);
};

// 删除帖子
const deletePost = (e: Event, postId: string) => {
    e.stopPropagation(); // 阻止冒泡，防止触发viewPost
    showDialog({
        title: '删除帖子',
        message: '确定要删除这篇帖子吗？',
        showCancelButton: true,
    }).then(() => {
        emit('delete', postId);
    }).catch(() => {
        // 取消操作
    });
};

// 取消发布帖子
const cancelPost = (e: Event, postId: string) => {
    e.stopPropagation(); // 阻止冒泡，防止触发viewPost
    showDialog({
        title: '取消发布',
        message: '确定要取消发布这篇帖子吗？',
        showCancelButton: true,
    }).then(() => {
        emit('cancel', postId);
    }).catch(() => {
        // 取消操作
    });
};

// 恢复已删除帖子
const recoverPost = (e: Event, postId: string) => {
    e.stopPropagation(); // 阻止冒泡，防止触发viewPost
    showDialog({
        title: '恢复帖子',
        message: '确定要恢复这篇帖子吗？',
        showCancelButton: true,
    }).then(() => {
        emit('recover', postId);
    }).catch(() => {
        // 取消操作
    });
};

// 获取状态文本
const getStatusText = (status: UserPostStatus | undefined) => {
    if (status === UserPostStatus.PUBLISHED) return '已发布';
    if (status === UserPostStatus.PENDING) return '待审核';
    if (status === UserPostStatus.DRAFT) return '草稿';
    if (status === UserPostStatus.DELETED) return '已删除';
    return '未知状态';
};

// 获取状态样式类
const getStatusClass = (status: UserPostStatus | undefined) => {
    if (status === UserPostStatus.PUBLISHED) return 'status-published';
    if (status === UserPostStatus.PENDING) return 'status-pending';
    if (status === UserPostStatus.DRAFT) return 'status-draft';
    if (status === UserPostStatus.DELETED) return 'status-deleted';
    return '';
};

// 格式化时间显示
const formatTime = (time: string) => {
    if (!time) return '';
    return time.substring(0, 16); // 只显示到分钟 "YYYY-MM-DD HH:MM"
};

// 格式化点赞数量显示
const formatLikes = (likes: any[]) => {
    return likes ? likes.length : 0;
};
</script>

<style lang="scss" scoped>
.post-list-custom {
    padding: 3%;
    width: 100%;
    box-sizing: border-box;

    .debug-panel {
        margin-bottom: 3%;
        padding: 3%;
        background-color: #ffebee;
        border: 1px solid #ffcdd2;
        border-radius: 4px;
        font-size: clamp(10px, 0.8rem, 12px);

        p {
            margin: 1% 0;
            color: #d32f2f;
        }
    }

    .posts-container {
        // 左滑操作按钮样式
        .swipe-actions {
            height: 100%;
            display: flex;
            width: clamp(70px, 20%, 100px);

            .swipe-btn {
                height: 100%;
                width: 100% !important;
                font-size: clamp(14px, 1rem, 18px);
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                border-top-right-radius: 8px;
                border-bottom-right-radius: 8px;

                &.delete-btn {
                    background-color: #ee0a24;
                    color: white;
                }

                &.cancel-btn {
                    background-color: #ff976a;
                    color: white;
                }
                
                &.recover-btn {
                    background-color: #07c160;
                    color: white;
                }
            }
        }

        .cell-group {
            margin-bottom: 3%; 
            border-radius: 8px;
            overflow: hidden;
        }

        .post-item {
            position: relative;
            background-color: #fff;
            padding: 4%;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            width: 100%;
            box-sizing: border-box;

            .post-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2%;
                width: 100%;
                
                .post-title {
                    font-size: clamp(14px, 1rem, 18px);
                    font-weight: 500;
                    color: #323233;
                    flex: 1;
                    padding-right: 10px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .status-tag {
                    padding: 1px 6px;
                    border-radius: 4px;
                    font-size: clamp(10px, 0.75rem, 12px);
                    font-weight: bold;
                    white-space: nowrap;

                    &.status-published {
                        background-color: #e8f7e9;
                        color: #07c160;
                    }

                    &.status-pending {
                        background-color: #ffebee;
                        color: #f44336;
                    }

                    &.status-draft {
                        background-color: #e0e0e0;
                        color: #757575;
                    }
                    
                    &.status-deleted {
                        background-color: #e0e0e0;
                        color: #757575;
                    }
                }
            }

            .post-content {
                font-size: clamp(12px, 0.875rem, 16px);
                color: #646566;
                margin-bottom: 3%;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                overflow: hidden;
                text-overflow: ellipsis;
                width: 100%;
            }

            .post-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                flex-wrap: wrap;
                
                .post-stats {
                    display: flex;
                    align-items: center;
                    font-size: clamp(10px, 0.75rem, 12px);
                    color: #999;
                    flex-wrap: wrap;

                    .stat-item {
                        margin-right: clamp(8px, 3%, 16px);
                        margin-bottom: 1%;
                        display: flex;
                        align-items: center;

                        .van-icon {
                            margin-right: 3px;
                        }
                    }
                }
                
                .post-time {
                    color: #999;
                    font-size: clamp(10px, 0.75rem, 12px);
                    white-space: nowrap;
                }
            }
        }
    }

    .list-loading {
        padding: 5% 0;
        text-align: center;
    }
}

// 修复垂直线问题的全局样式
:deep(.van-swipe-cell) {
    margin-bottom: 0;
    background-color: transparent;
    width: 100%;
}

:deep(.van-swipe-cell__wrapper) {
    position: relative;
    overflow: visible;
    border-radius: 8px;
    width: 100%;
}

:deep(.van-swipe-cell__right) {
    height: 100%;
    width: clamp(70px, 20%, 100px) !important; /* 确保右侧宽度足够且自适应 */
    display: flex;
    align-items: center;
    justify-content: center;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow: hidden;
}

/* 媒体查询 - 针对小屏幕设备 */
@media screen and (max-width: 375px) {
    .post-list-custom {
        padding: 2%;
        
        .posts-container {
            .post-item {
                padding: 3%;
                
                .post-header .post-title {
                    font-size: 14px;
                }
                
                .post-content {
                    font-size: 12px;
                    -webkit-line-clamp: 2;
                }
                
                .post-footer {
                    .post-stats .stat-item {
                        margin-right: 8px;
                    }
                }
            }
        }
    }
}

/* 媒体查询 - 针对大屏幕设备 */
@media screen and (min-width: 768px) {
    .post-list-custom {
        max-width: 800px;
        margin: 0 auto;
        
        .posts-container {
            .swipe-actions .swipe-btn {
                font-size: 18px;
            }
            
            .post-item {
                .post-header .post-title {
                    font-size: 18px;
                }
                
                .post-content {
                    font-size: 16px;
                    -webkit-line-clamp: 3;
                }
            }
        }
    }
}
</style>