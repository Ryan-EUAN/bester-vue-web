<template>
    <div class="music-card-component" @click="handleCardClick">
        <div class="music-cover">
            <a-image :src="music.cover" fallback="https://via.placeholder.com/150" preview-visible="false" alt="音乐封面" />
            <div class="play-overlay">
                <a-button 
                    type="primary" 
                    shape="circle" 
                    class="play-btn"
                    @click.stop="handlePlayClick"
                >
                    <template #icon>
                        <PlayCircleOutlined />
                    </template>
                </a-button>
            </div>
        </div>
        <div class="music-info">
            <h4 class="music-title" :title="music.title">{{ music.title }}</h4>
            <div class="music-meta">
                <span class="artist-name">{{ music.artist }}</span>
                <span class="duration">{{ formatDuration(music.duration) }}</span>
            </div>
            <div class="music-data">
                <span class="play-count">
                    <PlayCircleOutlined />
                    {{ formatNumber(music.playCount) }}
                </span>
                <span class="like-count">
                    <LikeOutlined />
                    {{ formatNumber(music.likeCount) }}
                </span>
                <a-tag color="blue" class="category-tag">{{ music.categoryName }}</a-tag>
            </div>
        </div>
        <div class="music-actions">
            <a-button 
                type="text" 
                class="action-btn" 
                @click.stop="handleAddToPlaylist"
                title="添加到播放列表"
            >
                <template #icon><PlusOutlined /></template>
            </a-button>
            <a-button 
                type="text" 
                class="action-btn" 
                @click.stop="handleToggleFavorite"
                :class="{ 'favorite': music.isFavorite }"
                :title="music.isFavorite ? '取消收藏' : '收藏'"
            >
                <template #icon>
                    <HeartFilled v-if="music.isFavorite" />
                    <HeartOutlined v-else />
                </template>
            </a-button>
            <a-dropdown placement="bottomRight" @click.stop>
                <a-button type="text" class="action-btn">
                    <template #icon><EllipsisOutlined /></template>
                </a-button>
                <template #overlay>
                    <a-menu>
                        <a-menu-item @click="handleShareClick">
                            <ShareAltOutlined /> 分享
                        </a-menu-item>
                        <a-menu-item @click="handleAddToCustomPlaylist">
                            <UnorderedListOutlined /> 添加到自定义列表
                        </a-menu-item>
                        <a-menu-item @click="handleDownload">
                            <DownloadOutlined /> 下载
                        </a-menu-item>
                    </a-menu>
                </template>
            </a-dropdown>
        </div>
    </div>
</template>

<script setup lang="ts">
import { 
    PlayCircleOutlined, HeartOutlined, HeartFilled, EllipsisOutlined,
    ShareAltOutlined, UnorderedListOutlined, DownloadOutlined, LikeOutlined,
    PlusOutlined
} from '@ant-design/icons-vue';
import type { MusicItem } from '@/types/music';
import { message } from 'ant-design-vue';

// 组件属性
const props = defineProps<{
    music: MusicItem;
}>();

// 组件事件
const emit = defineEmits<{
    (e: 'play', music: MusicItem): void;
    (e: 'detail', music: MusicItem): void;
    (e: 'add-to-playlist', music: MusicItem): void;
    (e: 'toggle-favorite', music: MusicItem): void;
    (e: 'share', music: MusicItem): void;
    (e: 'download', music: MusicItem): void;
    (e: 'add-to-custom-playlist', music: MusicItem): void;
}>();

// 格式化时间显示
const formatDuration = (seconds: number): string => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// 格式化数字显示
const formatNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 10000) return (num / 1000).toFixed(1) + 'K';
    return (num / 10000).toFixed(1) + 'W';
};

// 点击事件处理
const handleCardClick = () => {
    emit('detail', props.music);
};

const handlePlayClick = () => {
    emit('play', props.music);
};

const handleAddToPlaylist = () => {
    emit('add-to-playlist', props.music);
    message.success('已添加到播放列表');
};

const handleToggleFavorite = () => {
    emit('toggle-favorite', props.music);
    message.success(props.music.isFavorite ? '已取消收藏' : '已加入收藏');
};

const handleShareClick = () => {
    emit('share', props.music);
};

const handleAddToCustomPlaylist = () => {
    emit('add-to-custom-playlist', props.music);
};

const handleDownload = () => {
    emit('download', props.music);
    message.success('正在下载...');
};
</script>

<style lang="scss" scoped>
.music-card-component {
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    cursor: pointer;
    margin-bottom: 10px;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        
        .play-overlay {
            opacity: 1;
        }
        
        .music-actions {
            opacity: 1;
        }
    }
    
    .music-cover {
        width: 60px;
        height: 60px;
        border-radius: 6px;
        overflow: hidden;
        position: relative;
        flex-shrink: 0;
        
        .play-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
            
            .play-btn {
                background-color: #1890ff;
                border: none;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                
                &:hover {
                    background-color: #40a9ff;
                    transform: scale(1.1);
                }
            }
        }
    }
    
    .music-info {
        flex: 1;
        padding: 0 15px;
        overflow: hidden;
        
        .music-title {
            font-size: 16px;
            color: #333;
            margin: 0 0 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        
        .music-meta {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            
            .artist-name {
                font-size: 14px;
                color: #666;
                margin-right: 10px;
            }
            
            .duration {
                font-size: 12px;
                color: #999;
            }
        }
        
        .music-data {
            display: flex;
            align-items: center;
            
            .play-count, .like-count {
                font-size: 12px;
                color: #999;
                margin-right: 15px;
                display: flex;
                align-items: center;
                
                .anticon {
                    margin-right: 3px;
                }
            }
            
            .category-tag {
                font-size: 12px;
                height: 20px;
                line-height: 18px;
                padding: 0 6px;
            }
        }
    }
    
    .music-actions {
        display: flex;
        align-items: center;
        opacity: 0.5;
        transition: opacity 0.3s ease;
        
        .action-btn {
            font-size: 16px;
            color: #666;
            
            &.favorite {
                color: #ff4d4f;
            }
            
            &:hover {
                color: #1890ff;
                
                &.favorite {
                    color: #ff4d4f;
                }
            }
        }
    }
}
</style> 