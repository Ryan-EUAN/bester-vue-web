<template>
    <div class="music-player-component" :class="{ 'mini-mode': props.miniMode }">
        <div class="player-container">
            <!-- 专辑封面 -->
            <div class="album-cover">
                <a-image :src="currentMusic?.cover || defaultCover" :preview="false" fallback="https://via.placeholder.com/200" />
                <div class="album-disc" :class="{ 'is-playing': isPlaying }"></div>
            </div>

            <!-- 播放控制区域 -->
            <div class="player-controls">
                <div class="music-info">
                    <h3 class="music-title">{{ currentMusic?.title || '未播放' }}</h3>
                    <p class="music-artist">{{ currentMusic?.artist || '--' }}</p>
                </div>

                <div class="control-buttons">
                    <a-button type="text" class="control-btn" @click="prevSong">
                        <template #icon><StepBackwardOutlined /></template>
                    </a-button>
                    <a-button type="primary" shape="circle" class="play-btn" @click="togglePlay">
                        <template #icon>
                            <PauseOutlined v-if="isPlaying" />
                            <CaretRightOutlined v-else />
                        </template>
                    </a-button>
                    <a-button type="text" class="control-btn" @click="nextSong">
                        <template #icon><StepForwardOutlined /></template>
                    </a-button>
                    <a-button type="text" class="control-btn" @click="toggleMode">
                        <template #icon>
                            <RetweetOutlined v-if="playMode === 'loop'" />
                            <SwapOutlined v-else-if="playMode === 'random'" />
                            <MenuUnfoldOutlined v-else />
                        </template>
                    </a-button>
                    <a-button type="text" class="control-btn" :class="{ 'active-btn': isFavorite }" @click="toggleFavorite">
                        <template #icon><HeartOutlined /></template>
                    </a-button>
                </div>

                <div class="progress-wrapper">
                    <span class="time-info">{{ formatTime(currentTime) }}</span>
                    <a-slider
                        v-model:value="progress"
                        :tooltip-visible="false"
                        class="progress-bar"
                        @change="onProgressChange"
                    />
                    <span class="time-info">{{ formatTime(duration) }}</span>
                </div>

                <div class="volume-controls">
                    <a-button type="text" class="volume-btn" @click="toggleMute">
                        <template #icon>
                            <SoundOutlined v-if="!isMuted && volume > 0" />
                            <AudioMutedOutlined v-else />
                        </template>
                    </a-button>
                    <a-slider
                        v-model:value="volume"
                        :tooltip-visible="false"
                        class="volume-slider"
                        @change="onVolumeChange"
                    />
                </div>
            </div>
        </div>

        <!-- 播放列表 -->
        <div class="playlist-panel" v-if="showPlaylist">
            <div class="playlist-header">
                <h3>播放列表 ({{ playlist.length }})</h3>
                <a-button type="text" @click="clearPlaylist">
                    <template #icon><DeleteOutlined /></template>
                    清空
                </a-button>
            </div>
            <div class="playlist-content">
                <a-list class="music-list">
                    <a-list-item
                        v-for="(item, index) in playlist"
                        :key="item.id"
                        :class="{ 'playing-item': currentIndex === index }"
                        @click="playSelectedSong(index)"
                    >
                        <div class="list-item-wrapper">
                            <span class="list-index">{{ index + 1 }}</span>
                            <div class="list-info">
                                <div class="list-title">{{ item.title }}</div>
                                <div class="list-artist">{{ item.artist }}</div>
                            </div>
                            <div class="list-duration">{{ formatTime(item.duration) }}</div>
                            <a-button
                                type="text"
                                class="list-remove-btn"
                                @click.stop="removeFromPlaylist(index)"
                            >
                                <template #icon><CloseOutlined /></template>
                            </a-button>
                        </div>
                    </a-list-item>
                </a-list>
            </div>
        </div>

        <!-- 音频元素 -->
        <audio
            ref="audioRef"
            :src="currentMusic?.url"
            @timeupdate="onTimeUpdate"
            @ended="onEnded"
            @loadedmetadata="onLoadedMetadata"
            @play="onPlay"
            @pause="onPause"
            @error="onError"
        ></audio>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
    CaretRightOutlined, PauseOutlined, StepBackwardOutlined, StepForwardOutlined,
    SoundOutlined, AudioMutedOutlined, HeartOutlined, RetweetOutlined,
    SwapOutlined, MenuUnfoldOutlined, DeleteOutlined, CloseOutlined
} from '@ant-design/icons-vue';
import type { MusicItem } from '@/types/music';
import { message } from 'ant-design-vue';

// 定义组件的属性
const props = defineProps<{
    miniMode?: boolean;
}>();

// 定义事件
const emit = defineEmits<{
    (e: 'play', music: MusicItem): void;
    (e: 'pause'): void;
    (e: 'next'): void;
    (e: 'prev'): void;
    (e: 'change', music: MusicItem, index: number): void;
    (e: 'toggle-favorite', music: MusicItem): void;
}>();

// 内部状态
const audioRef = ref<HTMLAudioElement | null>(null);
const playlist = ref<MusicItem[]>([]);
const currentIndex = ref(-1);
const isPlaying = ref(false);
const isMuted = ref(false);
const volume = ref(80);
const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);
const showPlaylist = ref(false);
const playMode = ref<'sequential' | 'loop' | 'random'>('sequential');
const isFavorite = ref(false);
const defaultCover = 'https://via.placeholder.com/200?text=Music';

// 计算属性
const currentMusic = computed(() => {
    if (currentIndex.value >= 0 && currentIndex.value < playlist.value.length) {
        return playlist.value[currentIndex.value];
    }
    return null;
});

// 格式化时间
const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

// 播放控制方法
const togglePlay = () => {
    if (!audioRef.value) return;
    if (!currentMusic.value && playlist.value.length > 0) {
        currentIndex.value = 0;
    }
    if (!currentMusic.value) {
        message.warning('播放列表为空');
        return;
    }
    
    if (isPlaying.value) {
        audioRef.value.pause();
    } else {
        audioRef.value.play().catch(error => {
            console.error('播放错误:', error);
            message.error('音乐播放失败，请稍后再试');
        });
    }
};

const nextSong = () => {
    if (playlist.value.length === 0) return;
    
    if (playMode.value === 'random') {
        // 随机模式
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * playlist.value.length);
        } while (nextIndex === currentIndex.value && playlist.value.length > 1);
        currentIndex.value = nextIndex;
    } else {
        // 顺序或循环模式
        currentIndex.value = (currentIndex.value + 1) % playlist.value.length;
    }
    
    emit('next');
    playCurrentSong();
};

const prevSong = () => {
    if (playlist.value.length === 0) return;
    
    if (playMode.value === 'random') {
        // 随机模式
        let prevIndex;
        do {
            prevIndex = Math.floor(Math.random() * playlist.value.length);
        } while (prevIndex === currentIndex.value && playlist.value.length > 1);
        currentIndex.value = prevIndex;
    } else {
        // 顺序或循环模式
        currentIndex.value = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length;
    }
    
    emit('prev');
    playCurrentSong();
};

const playCurrentSong = () => {
    if (!audioRef.value) return;
    
    // 确保索引有效
    if (currentIndex.value < 0 || currentIndex.value >= playlist.value.length) {
        currentIndex.value = 0;
    }
    
    // 发出更改事件
    if (currentMusic.value) {
        emit('change', currentMusic.value, currentIndex.value);
    }
    
    // 重置进度
    currentTime.value = 0;
    progress.value = 0;
    
    // 延迟一下让音频元素更新src
    setTimeout(() => {
        if (audioRef.value) {
            audioRef.value.play().catch(error => {
                console.error('播放错误:', error);
                message.error('音乐播放失败，请稍后再试');
            });
        }
    }, 100);
};

const playSelectedSong = (index: number) => {
    if (index < 0 || index >= playlist.value.length) return;
    
    currentIndex.value = index;
    playCurrentSong();
};

const toggleMode = () => {
    const modes: Array<'sequential' | 'loop' | 'random'> = ['sequential', 'loop', 'random'];
    const currentIndex = modes.indexOf(playMode.value);
    playMode.value = modes[(currentIndex + 1) % modes.length];
    
    const modeMessages = {
        sequential: '顺序播放',
        loop: '循环播放',
        random: '随机播放'
    };
    
    message.info(`已切换为${modeMessages[playMode.value]}`);
};

const toggleMute = () => {
    if (!audioRef.value) return;
    
    isMuted.value = !isMuted.value;
    audioRef.value.muted = isMuted.value;
};

const toggleFavorite = () => {
    if (!currentMusic.value) return;
    
    isFavorite.value = !isFavorite.value;
    emit('toggle-favorite', currentMusic.value);
};

// 交互处理方法
const onProgressChange = (value: number) => {
    if (!audioRef.value) return;
    
    const newTime = (duration.value * value) / 100;
    audioRef.value.currentTime = newTime;
    currentTime.value = newTime;
};

const onVolumeChange = (value: number) => {
    if (!audioRef.value) return;
    
    volume.value = value;
    audioRef.value.volume = value / 100;
    
    // 当音量大于0时，取消静音状态
    if (value > 0) {
        isMuted.value = false;
        audioRef.value.muted = false;
    } else {
        isMuted.value = true;
        audioRef.value.muted = true;
    }
};

// 音频事件处理
const onTimeUpdate = () => {
    if (!audioRef.value) return;
    
    currentTime.value = audioRef.value.currentTime;
    progress.value = (currentTime.value / duration.value) * 100 || 0;
};

const onLoadedMetadata = () => {
    if (!audioRef.value) return;
    
    duration.value = audioRef.value.duration;
    // 设置音量
    audioRef.value.volume = volume.value / 100;
};

const onEnded = () => {
    if (playMode.value === 'loop') {
        // 单曲循环
        if (audioRef.value) {
            audioRef.value.currentTime = 0;
            audioRef.value.play().catch(error => {
                console.error('循环播放错误:', error);
            });
        }
    } else {
        // 顺序播放或随机播放，播放下一首
        nextSong();
    }
};

const onPlay = () => {
    isPlaying.value = true;
    if (currentMusic.value) {
        emit('play', currentMusic.value);
    }
};

const onPause = () => {
    isPlaying.value = false;
    emit('pause');
};

const onError = () => {
    message.error('音乐加载失败');
    isPlaying.value = false;
};

// 播放列表方法
const addToPlaylist = (music: MusicItem, autoPlay = false) => {
    // 检查是否已在播放列表中
    const existingIndex = playlist.value.findIndex(item => item.id === music.id);
    
    if (existingIndex !== -1) {
        // 如果已存在，仅切换到该曲目
        if (autoPlay) {
            currentIndex.value = existingIndex;
            playCurrentSong();
        }
        return;
    }
    
    // 添加到播放列表
    playlist.value.push(music);
    
    // 如果自动播放，则播放新添加的音乐
    if (autoPlay) {
        currentIndex.value = playlist.value.length - 1;
        playCurrentSong();
    }
};

const removeFromPlaylist = (index: number) => {
    if (index < 0 || index >= playlist.value.length) return;
    
    // 如果要删除的是当前播放项
    if (index === currentIndex.value) {
        // 如果这是最后一首歌，删除后播放前一首，否则播放下一首
        if (index === playlist.value.length - 1) {
            playlist.value.splice(index, 1);
            if (playlist.value.length > 0) {
                currentIndex.value = playlist.value.length - 1;
                playCurrentSong();
            } else {
                currentIndex.value = -1;
                isPlaying.value = false;
            }
        } else {
            playlist.value.splice(index, 1);
            // 播放索引不变，因为后面的歌曲会自动往前移
            playCurrentSong();
        }
    } else {
        // 删除其他歌曲
        playlist.value.splice(index, 1);
        // 如果删除的是当前播放歌曲前面的歌曲，当前索引需要减1
        if (index < currentIndex.value) {
            currentIndex.value--;
        }
    }
};

const clearPlaylist = () => {
    playlist.value = [];
    currentIndex.value = -1;
    isPlaying.value = false;
    currentTime.value = 0;
    duration.value = 0;
    progress.value = 0;
    if (audioRef.value) {
        audioRef.value.pause();
        audioRef.value.src = '';
    }
};

// 批量添加歌曲
const setPlaylist = (songs: MusicItem[], startIndex = 0, autoPlay = true) => {
    // 设置新的播放列表
    playlist.value = [...songs];
    
    // 设置起始索引，如果无效则默认为0
    if (startIndex >= 0 && startIndex < playlist.value.length) {
        currentIndex.value = startIndex;
    } else {
        currentIndex.value = 0;
    }
    
    // 如果需要自动播放并且有歌曲，则播放
    if (autoPlay && playlist.value.length > 0) {
        playCurrentSong();
    }
};

// 暴露组件方法
defineExpose({
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    setPlaylist,
    togglePlay,
    nextSong,
    prevSong,
    seek: (time: number) => {
        if (audioRef.value) {
            audioRef.value.currentTime = time;
        }
    }
});

// 监听音量变化
watch(volume, (newVolume) => {
    if (audioRef.value) {
        audioRef.value.volume = newVolume / 100;
    }
});

// 组件挂载和卸载
onMounted(() => {
    // 初始化音频播放器
    if (audioRef.value) {
        audioRef.value.volume = volume.value / 100;
    }
    
    // 添加键盘控制
    window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
    // 移除键盘控制
    window.removeEventListener('keydown', handleKeyPress);
});

// 键盘控制
const handleKeyPress = (event: KeyboardEvent) => {
    // 只在播放器获得焦点时处理键盘事件
    if (document.activeElement?.tagName === 'INPUT' || 
        document.activeElement?.tagName === 'TEXTAREA') {
        return;
    }
    
    switch (event.key) {
        case ' ':  // 空格键播放/暂停
            event.preventDefault();
            togglePlay();
            break;
        case 'ArrowLeft':  // 左箭头回退5秒
            if (audioRef.value) {
                audioRef.value.currentTime = Math.max(0, currentTime.value - 5);
            }
            break;
        case 'ArrowRight':  // 右箭头前进5秒
            if (audioRef.value) {
                audioRef.value.currentTime = Math.min(duration.value, currentTime.value + 5);
            }
            break;
        case 'ArrowUp':  // 上箭头增加音量
            volume.value = Math.min(100, volume.value + 5);
            if (audioRef.value) {
                audioRef.value.volume = volume.value / 100;
                if (isMuted.value && volume.value > 0) {
                    isMuted.value = false;
                    audioRef.value.muted = false;
                }
            }
            break;
        case 'ArrowDown':  // 下箭头减少音量
            volume.value = Math.max(0, volume.value - 5);
            if (audioRef.value) {
                audioRef.value.volume = volume.value / 100;
                if (volume.value === 0) {
                    isMuted.value = true;
                    audioRef.value.muted = true;
                }
            }
            break;
        case 'n':  // n键下一首
            nextSong();
            break;
        case 'p':  // p键上一首
            prevSong();
            break;
        case 'm':  // m键静音
            toggleMute();
            break;
    }
};
</script>

<style lang="scss" scoped>
.music-player-component {
    width: 100%;
    border-radius: 8px;
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    position: relative;
    font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
    
    &.mini-mode {
        width: 300px;
        height: 80px;
        
        .player-container {
            display: flex;
            flex-direction: row;
            align-items: center;
            padding: 5px;
        }
        
        .album-cover {
            width: 60px;
            height: 60px;
            margin-right: 10px;
        }
        
        .player-controls {
            flex: 1;
            
            .music-info {
                margin-bottom: 5px;
                
                .music-title {
                    font-size: 14px;
                    margin-bottom: 0;
                }
                
                .music-artist {
                    font-size: 12px;
                    margin-bottom: 0;
                }
            }
            
            .progress-wrapper {
                margin-top: 5px;
            }
            
            .control-buttons, .volume-controls {
                display: none;
            }
        }
    }
    
    .player-container {
        display: flex;
        padding: 20px;
    }
    
    .album-cover {
        width: 200px;
        height: 200px;
        border-radius: 8px;
        overflow: hidden;
        position: relative;
        margin-right: 20px;
        
        .album-disc {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.5);
            transform: translate(-50%, -50%);
            
            &::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                background: #fff;
                border-radius: 50%;
                transform: translate(-50%, -50%);
            }
            
            &.is-playing {
                animation: rotate 20s linear infinite;
            }
        }
    }
    
    .player-controls {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        
        .music-info {
            margin-bottom: 20px;
            
            .music-title {
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 5px;
                color: #333;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            .music-artist {
                font-size: 14px;
                color: #666;
                margin: 0;
            }
        }
        
        .control-buttons {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
            
            .control-btn {
                font-size: 18px;
                margin: 0 10px;
                
                &.active-btn {
                    color: #ff4d4f;
                }
            }
            
            .play-btn {
                width: 50px;
                height: 50px;
                font-size: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
        
        .progress-wrapper {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            
            .time-info {
                font-size: 12px;
                color: #999;
                width: 45px;
                text-align: center;
            }
            
            .progress-bar {
                flex: 1;
                margin: 0 10px;
            }
        }
        
        .volume-controls {
            display: flex;
            align-items: center;
            
            .volume-btn {
                font-size: 18px;
                margin-right: 10px;
            }
            
            .volume-slider {
                width: 100px;
            }
        }
    }
    
    .playlist-panel {
        border-top: 1px solid #eee;
        
        .playlist-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            
            h3 {
                margin: 0;
                font-size: 16px;
            }
        }
        
        .playlist-content {
            max-height: 300px;
            overflow-y: auto;
            
            .music-list {
                .playing-item {
                    background-color: #f0f7ff;
                }
                
                .list-item-wrapper {
                    display: flex;
                    align-items: center;
                    width: 100%;
                    
                    .list-index {
                        width: 30px;
                        text-align: center;
                        color: #999;
                    }
                    
                    .list-info {
                        flex: 1;
                        min-width: 0;
                        
                        .list-title {
                            font-size: 14px;
                            font-weight: 500;
                            margin-bottom: 2px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                        }
                        
                        .list-artist {
                            font-size: 12px;
                            color: #999;
                        }
                    }
                    
                    .list-duration {
                        font-size: 12px;
                        color: #999;
                        width: 50px;
                        text-align: center;
                    }
                    
                    .list-remove-btn {
                        padding: 0;
                        margin-left: 10px;
                        opacity: 0;
                        transition: opacity 0.3s;
                    }
                    
                    &:hover .list-remove-btn {
                        opacity: 1;
                    }
                }
            }
        }
    }
}

@keyframes rotate {
    0% {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}
</style> 