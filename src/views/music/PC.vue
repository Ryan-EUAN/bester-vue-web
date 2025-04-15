<template>
    <audio id="debug-audio"></audio>
    <div id="music-container" :class="{ hidden: !isVisible }">
        <div class="main-container">
            <!-- 头部 -->
            <div class="music-header">
                <HeadComponent />
            </div>

            <!-- 控制按钮区域 -->
            <div class="control-buttons">
                <div class="tab-group">
                    <button class="tab-button" :class="{ active: activeTab === 'playing' }"
                        @click="activeTab = 'playing'">
                        <customer-service-outlined /> 正在播放
                    </button>
                    <button class="tab-button" :class="{ active: activeTab === 'online' }"
                        @click="activeTab = 'online'">
                        <unordered-list-outlined /> 播放列表
                    </button>
                    <button class="tab-button" :class="{ active: activeTab === 'search' }"
                        @click="activeTab = 'search'">
                        <search-outlined /> 歌曲搜索
                    </button>
                </div>
            </div>

            <!-- 主体内容 -->
            <div class="main-content">
                <div v-if="activeTab === 'playing'" class="now-playing">
                    <!-- 双栏布局：左侧歌曲列表，右侧歌曲详情和歌词 -->
                    <div class="music-content-layout" :class="{ 'full-width': !currentSong }">
                        <!-- 左侧歌曲列表 -->
                        <div class="music-list-container" :class="{ 'full-width': !currentSong }">
                            <div class="music-list">
                                <table class="music-table">
                                    <thead>
                                        <tr>
                                            <th width="50">#</th>
                                            <th>歌曲</th>
                                            <th>歌手</th>
                                            <th>专辑</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(song, index) in songs" :key="song.id"
                                            :class="{ 'current-row': currentSong && song.id === currentSong.id }">
                                            <td>{{ index + 1 }}</td>
                                            <td>
                                                {{ song.title }}
                                                <div class="song-actions">
                                                    <button class="action-btn"
                                                        @click.stop="playSongDirectly(song)"><play-circle-outlined /></button>
                                                    <button class="action-btn"
                                                        @click.stop="addToPlaylist(song)"><plus-outlined /></button>
                                                    <button class="action-btn"
                                                        @click.stop="toggleFavorite(song)"><heart-outlined /></button>
                                                </div>
                                            </td>
                                            <td>{{ song.artist }}</td>
                                            <td>{{ song.album }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- 右侧歌曲详情和歌词 -->
                        <div class="song-detail-container" v-if="currentSong">
                            <!-- 专辑封面 -->
                            <div class="album-cover-area">
                                <div class="album-cover-container">
                                    <div class="album-cover" :style="albumCoverStyle">
                                        <img :src="currentSong?.cover" alt="专辑封面" v-if="currentSong?.cover">
                                        <customer-service-outlined v-else />
                                    </div>
                                </div>
                            </div>

                            <!-- 歌词区域 -->
                            <div class="lyrics-area">
                                <div class="song-title-large">{{ currentSong?.title || '未选择歌曲' }}</div>
                                <div class="song-artist-album">
                                    <span class="artist-name">{{ currentSong?.artist || '未知艺术家' }}</span>
                                    <span class="album-name" v-if="currentSong?.album">- {{ currentSong.album }}</span>
                                </div>

                                <!-- 动态歌词区 -->
                                <div class="dynamic-lyrics" ref="lyricsContainer" @scroll="handleLyricsScroll">
                                    <div class="lyrics-wrapper">
                                        <div v-for="(line, index) in parsedLyrics" :key="index" :class="{
                                            'lyric-line': true,
                                            'active': index === currentLyricIndex
                                        }">
                                            <!-- 非当前行直接显示 -->
                                            <template v-if="index !== currentLyricIndex">
                                                {{ line.content }}
                                            </template>

                                            <!-- 当前行字级渐变效果 -->
                                            <template v-else>
                                                <div class="char-container">
                                                    <span v-for="(char, charIndex) in splitLyricContent(line.content)"
                                                        :key="charIndex" class="lyric-char"
                                                        :style="getLyricCharStyle(charIndex, line.content.length)">
                                                        {{ char }}
                                                    </span>
                                                </div>
                                            </template>
                                        </div>
                                        <div v-if="parsedLyrics.length === 0" class="no-lyrics">
                                            暂无歌词
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 在线歌单页面 -->
                <div v-if="activeTab === 'online'" class="playlist-grid-container">
                    <div class="playlist-header">
                        <h2>在线歌单</h2>
                        <button class="clear-cache-btn" @click="clearLoadedPlaylists" title="清除缓存，重新加载歌单">
                            <reload-outlined />
                            清除缓存
                        </button>
                    </div>
                    <div class="playlist-grid">
                        <div v-for="playlist in playlists" :key="playlist.id" class="playlist-card"
                            :class="{ 'loading': playlist.loading, 'loaded': loadedPlaylistIds.includes(playlist.id) }"
                            @click="loadPlaylist(playlist.id)">
                            <div class="playlist-cover"
                                :style="playlist.cover ? { backgroundImage: `url(${playlist.cover})` } : {}">
                                <div v-if="!playlist.cover" class="playlist-cover-text">
                                    {{ playlist.name.charAt(0) }}
                                </div>
                                <div v-if="playlist.loading" class="loading-overlay">
                                    <loading-outlined spin />
                                </div>
                            </div>
                            <div class="playlist-name">{{ playlist.name }}</div>
                        </div>
                    </div>
                </div>

                <!-- 搜索页面 -->
                <div v-if="activeTab === 'search'" class="search-container">
                    <div class="search-box">
                        <input type="text" class="search-input" placeholder="搜索歌曲、歌手、专辑" v-model="searchQuery"
                            @keyup.enter="searchMusic">
                        <button class="search-btn" @click="searchMusic" :disabled="isSearching">
                            <loading-outlined v-if="isSearching" spin />
                            <search-outlined v-else />
                        </button>
                    </div>

                    <div class="search-results" v-if="searchResults.length > 0">
                        <table class="music-table">
                            <thead>
                                <tr>
                                    <th width="50">#</th>
                                    <th>歌曲</th>
                                    <th>歌手</th>
                                    <th>专辑</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(song, index) in searchResults" :key="song.id"
                                    :class="{ 'current-row': currentSong && song.id === currentSong.id }">
                                    <td>{{ index + 1 }}</td>
                                    <td>
                                        {{ song.title }}
                                        <div class="song-actions">
                                            <button class="action-btn"
                                                @click.stop="playSongDirectly(song)"><play-circle-outlined /></button>
                                            <button class="action-btn"
                                                @click.stop="addToPlaylist(song)"><plus-outlined /></button>
                                            <button class="action-btn"
                                                @click.stop="toggleFavorite(song)"><heart-outlined /></button>
                                        </div>
                                    </td>
                                    <td>{{ song.artist }}</td>
                                    <td>{{ song.album }}</td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- 加载更多按钮 -->
                        <div class="load-more-container" v-if="searchHasMore">
                            <button class="load-more-btn" @click="loadMoreSearchResults" :disabled="isSearching">
                                <loading-outlined v-if="isSearching" spin />
                                <span v-else><down-outlined /> 加载更多</span>
                            </button>
                        </div>

                        <!-- 分页信息 -->
                        <div class="pagination-info">
                            <span>第 {{ searchPage }} 页</span>
                        </div>
                    </div>

                    <div class="no-results" v-else-if="hasSearched">
                        <p>未找到相关歌曲</p>
                    </div>

                    <div class="loading-container" v-else-if="isSearching">
                        <loading-outlined spin />
                        <p>搜索中...</p>
                    </div>
                </div>
            </div>

            <!-- 底部播放控制区域 -->
            <div class="music-player">
                <!-- 播放控制按钮和进度条 -->
                <div class="player-controls">
                    <!-- 左侧控制区 -->
                    <div class="controls-left">
                        <div class="control-button" @click="prevSong" :class="{ 'disabled': !currentSong }">
                            <step-backward-outlined />
                        </div>
                        <div class="control-button" @click="togglePlay" :class="{ 'disabled': !currentSong }">
                            <pause-outlined v-if="isPlaying" />
                            <caret-right-outlined v-else />
                        </div>
                        <div class="control-button" @click="nextSong" :class="{ 'disabled': !currentSong }">
                            <step-forward-outlined />
                        </div>
                        <div class="control-button" @click="togglePlayMode" :class="{ 'disabled': !currentSong }">
                            <ordered-list-outlined v-if="playMode === 'sequence'" />
                            <redo-outlined v-else-if="playMode === 'repeat'" />
                            <swap-outlined v-else />
                        </div>
                    </div>

                    <!-- 中间进度条 -->
                    <div class="progress-container" ref="progressTrack" @click="handleProgressClick">
                        <div class="current-time">{{ currentSong ? formatTime(currentTime) : '00:00' }}</div>
                        <div class="progress-bar">
                            <div class="progress-current" :style="{ width: progress + '%' }"></div>
                            <div class="progress-handle" :style="{ left: progress + '%' }" v-show="progress > 0"></div>
                        </div>
                        <div class="total-time">{{ currentSong ? formatTime(duration) : '00:00' }}</div>
                    </div>

                    <!-- 右侧音量控制 -->
                    <div class="controls-right">
                        <div class="control-button" @click="toggleMute">
                            <sound-outlined v-if="volume > 50" />
                            <audio-outlined v-else-if="volume > 0" />
                            <audio-muted-outlined v-else />
                        </div>
                        <div class="volume-slider-custom">
                            <div class="volume-track" ref="volumeTrack" @click="handleVolumeClick"
                                @mousedown="handleVolumeMouseDown">
                                <div class="volume-fill" :style="{ width: volume + '%' }"></div>
                                <div class="volume-handle" :style="{ left: volume + '%' }" v-show="volume > 0"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { message } from 'ant-design-vue';
import {
    SearchOutlined,
    CustomerServiceOutlined,
    SoundOutlined,
    UnorderedListOutlined,
    PlayCircleOutlined,
    // DownloadOutlined,
    // CopyOutlined,
    PlusOutlined,
    LoadingOutlined,
    StepBackwardOutlined,
    StepForwardOutlined,
    PauseOutlined,
    CaretRightOutlined,
    OrderedListOutlined,
    RedoOutlined,
    SwapOutlined,
    DownOutlined,
    AudioOutlined,
    AudioMutedOutlined,
    HeartOutlined,
    ReloadOutlined,
} from '@ant-design/icons-vue';
import musicService from '@/services/music';
import HeadComponent from '@/components/PC/HeadComponent.vue';

// 类型定义
interface Song {
    id: string;
    title: string;
    artist: string;
    cover: string;
    url: string;
    duration: number;
    album?: string;
}

interface Playlist {
    id: string;
    name: string;
    cover: string;
    loading: boolean;
}

interface ParsedLyric {
    time: number;       // 开始时间
    endTime?: number;   // 结束时间
    content: string;    // 歌词内容
}

// 基本状态
const isVisible = ref(true);
const activeTab = ref('playing');
const songs = ref<Song[]>([]);
const currentSong = ref<Song | null>(null);
const isPlaying = ref(false);
const volume = ref(80);
const currentTime = ref(0);
const duration = ref(280);
const progress = ref(0);
const albumCoverStyle = computed(() => {
    if (currentSong.value?.cover) {
        return {
            backgroundImage: `url(${currentSong.value.cover})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        };
    }
    return null;
});

// 播放列表相关
const playlists = ref<Playlist[]>([
    { id: '19723756', name: '飙升榜', cover: '', loading: false },
    { id: '3779629', name: '新歌榜', cover: '', loading: false },
    { id: '3778678', name: '热歌榜', cover: '', loading: false },
    { id: '2884035', name: '原创版', cover: '', loading: false },
    { id: '12204283642', name: '欧美热播2019 | 来自Doja Cat的2019粉色浪潮', cover: '', loading: false },
    { id: '8408330200', name: '粤语专属 | 你的粤语歌曲专属推荐', cover: '', loading: false },
    { id: '6886768100', name: '中文慢摇DJ榜', cover: '', loading: false },
]);
// 记录已加载的歌单ID
const loadedPlaylistIds = ref<string[]>([]);

// 歌词相关
const parsedLyrics = ref<ParsedLyric[]>([]);
const currentLyricIndex = ref(0);

// 搜索相关
const searchQuery = ref('');
const searchResults = ref<Song[]>([]);
const searchPage = ref(1);
const searchHasMore = ref(false);
const hasSearched = ref(false);
const isSearching = ref(false);

// 播放模式相关
const playMode = ref('sequence'); // sequence, repeat, random

// 音频元素参考
const audioRef = ref<HTMLAudioElement | null>(null);
const progressTrack = ref<HTMLElement | null>(null);
const volumeTrack = ref<HTMLElement | null>(null);

// 更新歌词显示相关变量和DOM引用
const lyricsContainer = ref<HTMLElement | null>(null);
const userScrolled = ref(false);
const scrollTimer = ref<number | null>(null);

onMounted(() => {
    // 初始化音频元素
    audioRef.value = document.getElementById('debug-audio') as HTMLAudioElement;
    progressTrack.value = document.querySelector('.progress-container');
    volumeTrack.value = document.querySelector('.volume-track');
    lyricsContainer.value = document.querySelector('.dynamic-lyrics');

    // 从localStorage中获取已加载歌单ID
    const storedPlaylistIds = localStorage.getItem('loadedPlaylistIds');
    if (storedPlaylistIds) {
        try {
            loadedPlaylistIds.value = JSON.parse(storedPlaylistIds);
        } catch (e) {
            console.error('解析已加载歌单ID失败:', e);
        }
    }

    // 设置音频事件监听
    if (audioRef.value) {
        // 设置初始音量
        audioRef.value.volume = volume.value / 100;

        // 当元数据加载完成时触发 (获取音频时长)
        audioRef.value.onloadedmetadata = () => {
            if (audioRef.value) {
                duration.value = audioRef.value.duration;
            }
        };

        // 当音频播放位置发生改变时触发
        audioRef.value.ontimeupdate = () => {
            if (audioRef.value) {
                currentTime.value = audioRef.value.currentTime;
                progress.value = (currentTime.value / duration.value) * 100;

                // 更新当前歌词
                updateCurrentLyric();
            }
        };

        // 当音频结束时触发
        audioRef.value.onended = () => {
            if (playMode.value === 'repeat') {
                // 单曲循环模式下重新播放当前歌曲
                if (audioRef.value) {
                    audioRef.value.currentTime = 0;
                    audioRef.value.play();
                }
            } else if (playMode.value === 'random') {
                // 随机播放模式
                const randomIndex = Math.floor(Math.random() * songs.value.length);
                loadSong(randomIndex);
            } else {
                // 顺序播放模式下播放下一首
                nextSong();
            }
        };
    }

    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown);

    // 确保歌词区域有内容时进行初始滚动
    if (parsedLyrics.value.length > 0) {
        nextTick(() => {
            scrollToActiveLyric();
        });
    }
});

onUnmounted(() => {
    // 清理事件监听
    window.removeEventListener('keydown', handleKeyDown);
});

// 音乐操作函数
const loadSong = (index: number): void => {
    if (index < 0 || index >= songs.value.length) return;
    currentSong.value = songs.value[index];
    currentTime.value = 0;
    progress.value = 0;
    duration.value = currentSong.value.duration;

    // 加载音频
    if (audioRef.value && currentSong.value) {
        // 如果URL存在，设置音频源
        if (currentSong.value.url) {
            audioRef.value.src = currentSong.value.url;
            audioRef.value.load();

            // 如果正在播放，则继续播放新歌曲
            if (isPlaying.value) {
                playSong();
            }
        } else {
            // 没有URL时尝试获取歌曲信息
            playSongDirectly(currentSong.value);
        }
    }
};

const playSong = (): void => {
    if (!currentSong.value) return;

    isPlaying.value = true;
    if (audioRef.value) {
        audioRef.value.play()
            .catch(error => {
                console.error('播放失败:', error);
                message.error('音频播放失败，请稍后再试');
                isPlaying.value = false;
            });
    }
    message.success(`正在播放: ${currentSong.value?.title}`);
};

const pauseSong = (): void => {
    if (!currentSong.value) return;

    isPlaying.value = false;
    if (audioRef.value) {
        audioRef.value.pause();
    }
};

const togglePlay = (): void => {
    if (!currentSong.value) return;

    if (isPlaying.value) {
        pauseSong();
    } else {
        playSong();
    }
};

const prevSong = (): void => {
    if (!currentSong.value) return;

    let currentIndex = songs.value.findIndex(song => song.id === currentSong.value?.id);
    if (currentIndex === -1) currentIndex = 0;

    currentIndex = (currentIndex - 1 + songs.value.length) % songs.value.length;
    loadSong(currentIndex);
};

const nextSong = (): void => {
    if (!currentSong.value) return;

    let currentIndex = songs.value.findIndex(song => song.id === currentSong.value?.id);
    if (currentIndex === -1) currentIndex = 0;

    currentIndex = (currentIndex + 1) % songs.value.length;
    loadSong(currentIndex);
};

const togglePlayMode = (): void => {
    if (!currentSong.value) return;

    if (playMode.value === 'sequence') {
        playMode.value = 'repeat';
        message.info('单曲循环');
    } else if (playMode.value === 'repeat') {
        playMode.value = 'random';
        message.info('随机播放');
    } else {
        playMode.value = 'sequence';
        message.info('顺序播放');
    }
};

const toggleMute = (): void => {
    if (audioRef.value) {
        if (volume.value > 0) {
            volume.value = 0;
            audioRef.value.volume = 0;
        } else {
            volume.value = 80;
            audioRef.value.volume = 0.8;
        }
    }
};

// 歌词相关
const splitLyricContent = (content: string): string[] => {
    return content.split('');
};

// 获取字符样式，实现平滑过渡
const getLyricCharStyle = (charIndex: number, totalChars: number): Record<string, string> => {
    if (!audioRef.value || totalChars === 0) return { color: 'rgba(255, 255, 255, 0.6)' };

    const currentLyric = parsedLyrics.value[currentLyricIndex.value];
    if (!currentLyric) return { color: 'rgba(255, 255, 255, 0.6)' };

    // 获取当前歌词的开始和结束时间
    const currentTime = audioRef.value.currentTime;
    const lyricStartTime = currentLyric.time;
    const lyricEndTime = currentLyric.endTime || (lyricStartTime + 5); // 默认5秒

    // 计算该句歌词的总持续时间
    const totalDuration = lyricEndTime - lyricStartTime;

    // 保留一部分时间用于歌词完全显示后停留（总时间的20%）
    const displayTime = totalDuration * 0.8; // 80%时间用于渲染
    const renderTime = Math.min(displayTime, totalChars * 0.3); // 每个字最快0.3秒渲染一个

    // 计算当前播放进度相对于歌词开始时间的偏移
    const timeOffset = currentTime - lyricStartTime;

    // 如果已经超过渲染时间，则整句高亮
    if (timeOffset >= renderTime) {
        return {
            color: '#2efd71',
            transition: 'color 0.1s linear'
        };
    }

    // 根据当前时间计算应该高亮到第几个字符
    const renderProgress = timeOffset / renderTime;
    const highlightChars = Math.floor(renderProgress * totalChars);

    // 当前字符是否应该高亮
    if (charIndex < highlightChars) {
        // 已完全高亮的字符
        return {
            color: '#2efd71',
            transition: 'color 0.1s linear'
        };
    } else {
        // 未高亮的字符
        return {
            color: 'rgba(255, 255, 255, 0.6)',
            transition: 'color 0.1s linear'
        };
    }
};

// 搜索相关
const searchMusic = async (): Promise<void> => {
    if (!searchQuery.value.trim()) {
        message.warning('请输入搜索关键词');
        return;
    }

    isSearching.value = true;
    searchPage.value = 1; // 重置页码

    try {
        const response = await musicService.SEARCH_MUSIC_API(
            searchQuery.value.trim(),
            searchPage.value,
            20
        );

        if (response.code === 200 && response.data) {
            // 转换SearchVO[]到Song[]
            const results: Song[] = response.data.map(item => ({
                id: item.id,
                title: item.name,
                artist: item.artist,
                album: item.album,
                cover: '', // 封面需要单独获取
                url: '',   // URL需要在播放时单独获取
                duration: 0 // 时长需要在播放时获取
            }));

            searchResults.value = results;
            searchHasMore.value = results.length === 20; // 如果返回20条数据，则可能有更多数据
            hasSearched.value = true;

            message.success(`找到 ${results.length} 个结果`);
        } else {
            message.error('搜索失败: ' + response.message);
            searchResults.value = [];
            searchHasMore.value = false;
            hasSearched.value = true;
        }
    } catch (error) {
        console.error('搜索出错:', error);
        message.error('搜索出错，请稍后重试');
        searchResults.value = [];
        searchHasMore.value = false;
        hasSearched.value = true;
    } finally {
        isSearching.value = false;
    }
};

const loadMoreSearchResults = async (): Promise<void> => {
    searchPage.value += 1;

    try {
        const response = await musicService.SEARCH_MUSIC_API(
            searchQuery.value.trim(),
            searchPage.value,
            20
        );

        if (response.code === 200 && response.data) {
            // 转换SearchVO[]到Song[]
            const moreResults: Song[] = response.data.map(item => ({
                id: item.id,
                title: item.name,
                artist: item.artist,
                album: item.album,
                cover: '',
                url: '',
                duration: 0
            }));

            searchResults.value = [...searchResults.value, ...moreResults];
            searchHasMore.value = moreResults.length === 20; // 如果返回20条数据，则可能有更多

            if (moreResults.length > 0) {
                message.success(`加载了 ${moreResults.length} 条更多结果`);
            } else {
                message.info('没有更多结果了');
            }
        } else {
            message.error('加载更多失败: ' + response.message);
        }
    } catch (error) {
        console.error('加载更多出错:', error);
        message.error('加载更多出错，请稍后重试');
    }
};

// 播放列表操作
const addToPlaylist = (song: Song): void => {
    const exists = songs.value.some(item => item.id === song.id);
    if (exists) {
        message.info('歌曲已在播放列表中');
        return;
    }

    songs.value.push(song);
    message.success('已添加到播放列表');
};

const playSongDirectly = async (song: Song): Promise<void> => {
    try {
        // 如果当前有正在播放的音频，先停止它
        if (audioRef.value) {
            audioRef.value.pause();
            audioRef.value.src = '';
        }

        // 获取歌曲详细信息
        const response = await musicService.GET_MUSIC_INFO_API(song.id);

        if (response.code === 200 && response.data) {
            const musicInfo = response.data;

            // 更新歌曲信息
            const updatedSong: Song = {
                ...song,
                cover: musicInfo.pic || '',
                url: musicInfo.url || '',
                duration: 0 // 可以通过音频元素load事件获取实际时长
            };

            // 查找是否已在播放列表中
            const index = songs.value.findIndex(item => item.id === song.id);
            if (index !== -1) {
                // 更新播放列表中的歌曲信息
                songs.value[index] = updatedSong;
                loadSong(index);
            } else {
                // 添加到播放列表并播放
                songs.value.push(updatedSong);
                loadSong(songs.value.length - 1);
            }

            // 如果有歌词，解析歌词
            if (musicInfo.lrc) {
                // 解析原始歌词并添加空白行
                const rawLyrics = musicService.parseLyrics(musicInfo.lrc);
                parsedLyrics.value = prepareLyrics(rawLyrics);
                // 重置用户滚动状态，确保新歌曲播放时歌词自动滚动
                userScrolled.value = false;
            } else {
                parsedLyrics.value = [];
            }

            // 设置音频源并播放
            if (audioRef.value && updatedSong.url) {
                // 切换到正在播放页面，在加载音频前
                activeTab.value = 'playing';

                // 使用setTimeout避免快速切换导致的播放中断
                setTimeout(() => {
                    if (audioRef.value) {
                        audioRef.value.src = updatedSong.url;
                        audioRef.value.onloadedmetadata = () => {
                            if (audioRef.value) {
                                // 更新实际时长
                                duration.value = audioRef.value.duration;
                                // 播放音频
                                audioRef.value.play()
                                    .then(() => {
                                        isPlaying.value = true;
                                    })
                                    .catch(error => {
                                        console.error('播放失败:', error);
                                        message.error('音频播放失败，请稍后再试');
                                        isPlaying.value = false;
                                    });
                            }
                        };

                        // 监听音频播放进度
                        audioRef.value.ontimeupdate = () => {
                            if (audioRef.value) {
                                currentTime.value = audioRef.value.currentTime;
                                progress.value = (currentTime.value / duration.value) * 100;
                                updateCurrentLyric();
                            }
                        };

                        // 监听音频结束
                        audioRef.value.onended = () => {
                            if (playMode.value === 'repeat') {
                                // 单曲循环模式下重新播放当前歌曲
                                if (audioRef.value) {
                                    audioRef.value.currentTime = 0;
                                    audioRef.value.play();
                                }
                            } else {
                                // 其他模式下播放下一首
                                nextSong();
                            }
                        };
                    }
                }, 100);
            }

            // 等待DOM更新后滚动到当前歌词
            nextTick(() => {
                scrollToActiveLyric();
            });

        } else {
            message.error('获取歌曲信息失败: ' + response.message);
        }
    } catch (error) {
        console.error('播放歌曲出错:', error);
        message.error('播放歌曲出错，请稍后重试');
    }
};

const loadPlaylist = async (playlistId: string): Promise<void> => {
    const playlist = playlists.value.find(item => item.id === playlistId);
    if (!playlist) return;

    // 如果当前歌单已经加载过，只切换到播放列表页面
    if (loadedPlaylistIds.value.includes(playlistId)) {
        // 切换到播放列表页面
        activeTab.value = 'playing';
        message.info(`已切换到歌单: ${playlist.name}`);
        return;
    }

    playlist.loading = true;

    try {
        const response = await musicService.GET_MUSIC_LIST_BY_ID_API(playlistId);

        if (response.code === 200 && response.data) {
            const musicList = response.data;

            // 检查歌单数据是否有效
            if (musicList && musicList.songId && musicList.songId.length > 0) {
                // 记录正在播放的歌曲ID，用于恢复播放状态
                const currentPlayingSongId = currentSong.value?.id;
                const wasPlaying = isPlaying.value;

                // 转换歌单数据到Song[]
                const playlistSongs: Song[] = [];

                for (let i = 0; i < musicList.songId.length; i++) {
                    playlistSongs.push({
                        id: musicList.songId[i] || '',
                        title: musicList.songName && musicList.songName[i] ? musicList.songName[i] : '未知歌曲',
                        artist: musicList.artistName && musicList.artistName[i] ? musicList.artistName[i] : '未知艺术家',
                        album: musicList.albumName && musicList.albumName[i] ? musicList.albumName[i] : '未知专辑',
                        cover: '',
                        url: '',
                        duration: 0
                    });
                }

                songs.value = playlistSongs;

                // 如果是首次加载此歌单，则默认播放第一首
                if (!loadedPlaylistIds.value.includes(playlistId) && playlistSongs.length > 0) {
                    // 记录已加载歌单ID
                    loadedPlaylistIds.value.push(playlistId);

                    // 如果是首次加载，默认播放第一首
                    currentSong.value = songs.value[0];
                    // 尝试播放第一首歌曲
                    if (currentSong.value) {
                        playSongDirectly(currentSong.value);
                    }
                } else if (currentPlayingSongId) {
                    // 恢复之前的播放状态
                    const songIndex = songs.value.findIndex(s => s.id === currentPlayingSongId);
                    if (songIndex !== -1) {
                        currentSong.value = songs.value[songIndex];
                        // 如果之前在播放，则继续播放
                        if (wasPlaying && audioRef.value) {
                            audioRef.value.play().catch(error => {
                                console.error('恢复播放失败:', error);
                                isPlaying.value = false;
                            });
                        }
                    }
                }

                message.success(`已加载 ${playlist.name} 歌单，共 ${playlistSongs.length} 首歌曲`);
                // 加载完成后切换到播放列表页面
                activeTab.value = 'playing';
            } else {
                message.warning('歌单为空或数据格式不正确');
            }
        } else {
            message.error('获取歌单失败: ' + response.message);
        }
    } catch (error) {
        console.error('加载歌单出错:', error);
        message.error('加载歌单出错，请稍后重试');
    } finally {
        playlist.loading = false;
    }
};

// 进度条和音量控制
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const updateCurrentLyric = (): void => {
    if (parsedLyrics.value.length === 0) return;

    // 找到当前时间对应的歌词
    let foundIndex = -1;
    for (let i = 0; i < parsedLyrics.value.length; i++) {
        if (currentTime.value < parsedLyrics.value[i].time) {
            foundIndex = i - 1;
            break;
        }
    }

    // 如果是最后一行歌词
    if (foundIndex === -1 && currentTime.value >= parsedLyrics.value[parsedLyrics.value.length - 1].time) {
        foundIndex = parsedLyrics.value.length - 1;
    }

    // 检查是否需要更新当前歌词
    const newIndex = Math.max(0, foundIndex);
    if (currentLyricIndex.value !== newIndex) {
        currentLyricIndex.value = newIndex;

        // 如果用户没有手动滚动，则自动滚动到当前歌词
        if (!userScrolled.value && lyricsContainer.value) {
            scrollToActiveLyric();
        }
    }
};

// 自动滚动到当前活动歌词
const scrollToActiveLyric = (): void => {
    nextTick(() => {
        if (!lyricsContainer.value) return;

        const activeElement = lyricsContainer.value.querySelector('.lyric-line.active');
        if (!activeElement) return;

        // 计算应该滚动的位置，使活动歌词显示在容器中部偏上位置
        const containerHeight = lyricsContainer.value.clientHeight;
        const elementTop = activeElement.getBoundingClientRect().top;
        const containerTop = lyricsContainer.value.getBoundingClientRect().top;
        const elementRelativeTop = elementTop - containerTop;

        // 目标位置是活动元素位于容器1/3位置
        const targetPosition = elementRelativeTop - containerHeight / 3;

        lyricsContainer.value.scrollBy({
            top: targetPosition,
            behavior: 'smooth'
        });
    });
};

// 处理用户滚动事件
const handleLyricsScroll = (): void => {
    userScrolled.value = true;

    // 清除之前的定时器
    if (scrollTimer.value !== null) {
        window.clearTimeout(scrollTimer.value);
    }

    // 设置新的定时器，2秒后重新启用自动滚动
    scrollTimer.value = window.setTimeout(() => {
        userScrolled.value = false;
    }, 2000);
};

const handleProgressClick = (event: MouseEvent): void => {
    if (!progressTrack.value || !audioRef.value || !currentSong.value) return;

    const rect = progressTrack.value.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const percent = Math.min(1, Math.max(0, clickPosition / rect.width));

    currentTime.value = percent * duration.value;
    progress.value = percent * 100;

    // 设置音频当前时间
    audioRef.value.currentTime = currentTime.value;
};

const handleVolumeClick = (event: MouseEvent): void => {
    if (!volumeTrack.value || !audioRef.value) return;

    const rect = volumeTrack.value.getBoundingClientRect();
    const clickPosition = event.clientX - rect.left;
    const percent = Math.min(1, Math.max(0, clickPosition / rect.width));

    volume.value = Math.round(percent * 100);
    audioRef.value.volume = percent;
};

const handleVolumeMouseDown = (event: MouseEvent): void => {
    handleVolumeClick(event);

    const handleMove = (moveEvent: MouseEvent): void => {
        handleVolumeClick(moveEvent);
    };

    const handleUp = (): void => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
};

const handleKeyDown = (event: KeyboardEvent): void => {
    // 忽略在输入框中的按键
    if (document.activeElement && (
        document.activeElement.tagName === 'INPUT' ||
        document.activeElement.tagName === 'TEXTAREA'
    )) {
        return;
    }

    switch (event.key) {
        case ' ': // 空格键
            event.preventDefault();
            togglePlay();
            break;
        case 'ArrowLeft': // 左箭头 - 后退5秒
            if (audioRef.value) {
                audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 5);
            }
            break;
        case 'ArrowRight': // 右箭头 - 前进5秒
            if (audioRef.value) {
                audioRef.value.currentTime = Math.min(audioRef.value.duration, audioRef.value.currentTime + 5);
            }
            break;
        case 'ArrowUp': // 上箭头 - 增加音量
            volume.value = Math.min(100, volume.value + 10);
            if (audioRef.value) {
                audioRef.value.volume = volume.value / 100;
            }
            break;
        case 'ArrowDown': // 下箭头 - 减少音量
            volume.value = Math.max(0, volume.value - 10);
            if (audioRef.value) {
                audioRef.value.volume = volume.value / 100;
            }
            break;
    }
};

// 添加toggleFavorite函数
const toggleFavorite = (song: Song): void => {
    message.success(`已添加${song.title}到我喜欢`);
    // 实际实现可以添加到用户的收藏列表中
};

// 优化歌词解析函数，确保始终有足够的行数用于滚动效果
const prepareLyrics = (rawLyrics: ParsedLyric[]): ParsedLyric[] => {
    if (rawLyrics.length === 0) return [];

    // 计算每行歌词的结束时间
    for (let i = 0; i < rawLyrics.length - 1; i++) {
        rawLyrics[i].endTime = rawLyrics[i + 1].time;
    }

    // 最后一行歌词结束时间设为歌曲结束或加上一个合理的持续时间
    if (rawLyrics.length > 0) {
        const lastLyric = rawLyrics[rawLyrics.length - 1];
        if (!lastLyric.endTime) {
            lastLyric.endTime = lastLyric.time + 5; // 默认持续5秒
        }
    }

    // 至少需要8行歌词以确保滚动效果良好
    const minLines = 8;

    // 如果歌词不足8行，在开头和结尾添加空行
    if (rawLyrics.length < minLines) {
        const result: ParsedLyric[] = [];

        // 添加3行空白歌词在开头，时间设为-1表示不会被选中
        for (let i = 0; i < 3; i++) {
            result.push({ time: -1, endTime: -1, content: ' ' });
        }

        // 添加原有歌词
        result.push(...rawLyrics);

        // 添加足够的空白歌词在结尾以达到最小行数
        const endEmptyLines = Math.max(0, minLines - result.length);
        const lastTime = rawLyrics.length > 0 ?
            (rawLyrics[rawLyrics.length - 1].endTime || rawLyrics[rawLyrics.length - 1].time + 5) : 0;

        for (let i = 0; i < endEmptyLines; i++) {
            result.push({ time: lastTime + i, endTime: lastTime + i + 1, content: ' ' });
        }

        return result;
    }

    // 如果歌词足够多，只在开头添加3行空白
    const result: ParsedLyric[] = [];
    for (let i = 0; i < 3; i++) {
        result.push({ time: -1, endTime: -1, content: ' ' });
    }
    result.push(...rawLyrics);
    return result;
};

// 监听loadedPlaylistIds变化，保存到localStorage
watch(loadedPlaylistIds, (newValue) => {
    localStorage.setItem('loadedPlaylistIds', JSON.stringify(newValue));
}, { deep: true });

// 清除已加载歌单列表
const clearLoadedPlaylists = (): void => {
    loadedPlaylistIds.value = [];
    message.success('已清除歌单缓存，可以重新加载歌单');
};
</script>
<style lang="scss" scoped>
/* 全局样式变量 */
$primary-color: #2efd71;
$bg-color: rgba(30, 30, 40, 0.95);
$bg-gradient: linear-gradient(to bottom, rgba(40, 40, 60, 0.95), rgba(20, 20, 30, 0.98));
$text-color: #fff;
$text-secondary: rgba(255, 255, 255, 0.7);
$border-color: rgba(255, 255, 255, 0.15);
$control-bg: rgba(255, 255, 255, 0.1);
$active-bg: rgba(255, 255, 255, 0.15);
$hover-bg: rgba(255, 255, 255, 0.1);

/* 主容器样式 */
#music-container {
    width: 100%;
    height: 100vh;
    background-image: url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1742&q=80');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    color: $text-color;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    position: relative;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 10, 30, 0.85);
        z-index: 0;
    }

    &.hidden {
        display: none;
    }
}

.main-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    position: relative;
    z-index: 1;
}

/* 头部样式 */
.music-header {
    padding: 0;
    border-bottom: 1px solid $border-color;
}

/* 宇宙主题导航栏 */
.cosmic-nav {
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    color: white;
    position: relative;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.nav-left,
.nav-right {
    display: flex;
    align-items: center;
    z-index: 1;
}

.nav-btn {
    background: transparent;
    border: none;
    color: white;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;
    border-radius: 4px;
    margin: 0 4px;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    .anticon {
        margin-right: 6px;
    }
}

.user-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-left: 10px;
}

.search-input-wrapper {
    position: relative;
    margin-right: 10px;
    width: 240px;
}

.nav-search-input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    padding: 6px 30px 6px 12px;
    color: white;
    width: 100%;
    font-size: 14px;
    transition: all 0.3s;

    &:focus {
        background: rgba(255, 255, 255, 0.15);
        outline: none;
        border-color: rgba(46, 253, 113, 0.3);
        box-shadow: 0 0 0 2px rgba(46, 253, 113, 0.1);
    }

    &::placeholder {
        color: rgba(255, 255, 255, 0.6);
    }
}

.search-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;

    &:hover {
        color: $primary-color;
    }
}

.search-loading {
    color: $primary-color;
}

/* 控制按钮区域 */
.control-buttons {
    padding: 12px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    background-color: rgba(0, 10, 30, 0.4);
}

.tab-group {
    display: inline-flex;
}

.tab-button {
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid $border-color;
    color: $text-secondary;
    padding: 6px 15px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;

    &:not(:last-child) {
        border-right: none;
    }

    &:first-child {
        border-top-left-radius: 4px;
        border-bottom-left-radius: 4px;
    }

    &:last-child {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }

    &.active {
        background-color: rgba(255, 255, 255, 0.15);
        color: #fff;
    }

    i {
        margin-right: 4px;
    }
}

/* 主体内容 */
.main-content {
    flex: 1;
    overflow: hidden;
    margin-bottom: 60px;
    /* 为底部播放器留出空间 */
}

/* 音乐内容布局 */
.music-content-layout {
    display: flex;
    height: calc(100vh - 165px);
    transition: all 0.3s ease;

    &.full-width {
        display: block;
    }
}

/* 左侧歌曲列表 */
.music-list-container {
    width: 70%;
    overflow: hidden;
    height: 100%;
    padding-right: 15px;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
    transition: width 0.3s ease;

    &.full-width {
        width: 100%;
        padding-right: 0;
        border-right: none;
    }
}

.music-list {
    height: 100%;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(180, 180, 180, 0.3);
        border-radius: 3px;

        &:hover {
            background: rgba(180, 180, 180, 0.5);
        }
    }
}

/* 表格样式 */
.music-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th {
        text-align: left;
        padding: 12px 15px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 14px;
        font-weight: normal;
        position: sticky;
        top: 0;
        background-color: transparent;
        z-index: 10;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.15);
    }

    td {
        padding: 12px 15px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.9);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        position: relative;
        border-bottom: 1px dashed rgba(255, 255, 255, 0.15);
    }

    tr {
        position: relative;
        transition: background-color 0.2s, transform 0.1s;
        cursor: default;

        &:hover {
            background-color: rgba(255, 255, 255, 0.05);

            .song-actions {
                display: flex;
                opacity: 1;
            }
        }

        &.current-row {
            background-color: rgba(24, 144, 255, 0.1);
        }
    }
}

/* 行操作按钮 */
.song-actions {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    display: none;
    align-items: center;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.action-btn {
    background: transparent;
    border: none;
    color: #1890ff;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;

    &:hover {
        background-color: rgba(24, 144, 255, 0.2);
        transform: scale(1.1);
    }

    &:active {
        transform: scale(0.95);
    }
}

/* 右侧歌曲详情 */
.song-detail-container {
    width: 30%;
    height: 100%;
    padding: 15px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: rgba(0, 10, 30, 0.4);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    margin: 10px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* 专辑封面区域 */
.album-cover-area {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 15px 0;
}

.album-cover-container {
    width: 100px;
    height: 100px;
    position: relative;
}

.album-cover {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(40, 40, 60, 0.5);

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    i {
        font-size: 36px;
        color: rgba(255, 255, 255, 0.3);
    }

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
    }
}

/* 歌词区域 */
.lyrics-area {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.song-title-large {
    font-size: 16px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.song-artist-album {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 15px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.dynamic-lyrics {
    flex: 1;
    overflow-y: auto;
    padding: 5px 0;
    scroll-behavior: smooth;

    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(180, 180, 180, 0.3);
        border-radius: 3px;

        &:hover {
            background: rgba(180, 180, 180, 0.5);
        }
    }
}

.lyrics-wrapper {
    padding: 20px 10px;
}

.lyric-line {
    text-align: center;
    padding: 6px 0;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s ease;

    &.active {
        color: $primary-color;
        font-size: 15px;
        font-weight: bold;
    }
}

/* 字符高亮效果 */
.char-container {
    display: inline-flex;
    align-items: center;
    transform: translateZ(0);
    /* 启用GPU加速 */
    line-height: 1.5;
    margin: 5px 0;
}

.lyric-char {
    position: relative;
    display: inline-block;
    padding: 0 1px;
    font-size: 15px;
    will-change: color;
    /* 提示浏览器这个元素会频繁变化 */
    transition: color 0.1s linear;
    font-weight: normal;
    height: 100%;
}

.char-bg {
    opacity: 0.6;
}

.char-highlight {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
}

.no-lyrics {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    padding: 20px 0;
    font-style: italic;
}

/* 播放列表页面 */
.playlist-grid-container {
    padding: 20px;
    height: 100%;
    overflow-y: auto;
}

.playlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
}

.playlist-card {
    background-color: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(5px);
    transition: transform 0.3s, box-shadow 0.3s;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    position: relative;

    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
        background-color: rgba(255, 255, 255, 0.12);
    }

    &.loading {
        pointer-events: none;
        opacity: 0.7;
    }

    &.loaded {
        &::after {
            content: '已加载';
            position: absolute;
            top: 5px;
            right: 5px;
            background: rgba(0, 175, 255, 0.8);
            color: white;
            font-size: 10px;
            padding: 2px 6px;
            border-radius: 10px;
            opacity: 0.9;
        }
    }
}

.playlist-cover {
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    background-size: cover;
    background-position: center;
    position: relative;
}

.playlist-cover-text {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    color: rgba(255, 255, 255, 0.8);
}

.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.playlist-name {
    padding: 10px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 搜索页面 */
.search-container {
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.search-box {
    display: flex;
    margin-bottom: 20px;
}

.search-input {
    flex: 1;
    background-color: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-right: none;
    color: #fff;
    padding: 10px 15px;
    font-size: 14px;
    border-radius: 4px 0 0 4px;
    outline: none;

    &::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }

    &:focus {
        background-color: rgba(255, 255, 255, 0.12);
        box-shadow: 0 0 0 2px rgba(46, 253, 113, 0.2);
    }
}

.search-btn {
    background-color: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 0 15px;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: rgba(255, 255, 255, 0.25);
    }
}

.search-results {
    flex: 1;
    overflow-y: auto;

    table {
        width: 100%;
        border-collapse: collapse;

        th {
            text-align: left;
            padding: 12px 15px;
            color: rgba(255, 255, 255, 0.7);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            font-weight: normal;
            font-size: 14px;
        }

        td {
            padding: 12px 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 14px;
        }

        tr:hover {
            background-color: rgba(255, 255, 255, 0.05);
        }
    }
}

.icon-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
    margin: 0 3px;

    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
}

/* 底部播放器 */
.music-player {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: rgba(0, 10, 30, 0.8);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    padding: 0 20px;
    z-index: 100;
}

.player-controls {
    display: flex;
    align-items: center;
    width: 100%;
}

.controls-left,
.controls-right {
    display: flex;
    align-items: center;
}

.control-button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    margin: 0 5px;
    transition: color 0.2s;

    &:hover {
        color: #fff;
    }

    &.disabled {
        color: rgba(255, 255, 255, 0.3);
        cursor: default;

        &:hover {
            color: rgba(255, 255, 255, 0.3);
        }
    }
}

.progress-container {
    display: flex;
    align-items: center;
    flex: 1;
    margin: 0 20px;
}

.current-time,
.total-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    min-width: 40px;
    text-align: center;
}

.progress-bar {
    flex: 1;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    margin: 0 10px;
    position: relative;
    cursor: pointer;
    border-radius: 2px;
}

.progress-current {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: $primary-color;
    border-radius: 2px;
}

.progress-handle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background-color: $primary-color;
    border-radius: 50%;
    margin-left: -6px;
    box-shadow: 0 0 8px rgba(46, 253, 113, 0.8);
}

.volume-slider-custom {
    width: 80px;
    margin-left: 10px;
}

.volume-track {
    height: 4px;
    background-color: rgba(255, 255, 255, 0.1);
    position: relative;
    cursor: pointer;
    border-radius: 2px;
}

.volume-fill {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: $primary-color;
    border-radius: 2px;
}

.volume-handle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background-color: $primary-color;
    border-radius: 50%;
    margin-left: -6px;
    box-shadow: 0 0 8px rgba(46, 253, 113, 0.8);
}

/* 加载更多按钮和分页 */
.load-more-container {
    text-align: center;
    margin: 15px 0;
}

.load-more-btn {
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
    padding: 8px 20px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
}

.pagination-info {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 12px;
    margin-top: 5px;
}

.no-results {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: rgba(255, 255, 255, 0.5);
}

.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 200px;
    color: rgba(255, 255, 255, 0.5);

    p {
        margin-top: 12px;
    }
}

/* 搜索结果弹出框样式 */
.search-results-overlay {
    position: absolute;
    top: 70px;
    right: 20px;
    width: 700px;
    max-height: 500px;
    background: rgba(0, 10, 30, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    z-index: 100;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.search-results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);

    h3 {
        margin: 0;
        color: rgba(255, 255, 255, 0.9);
    }
}

.close-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;

    &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
    }
}

/* 全局滚动条样式 */
::-webkit-scrollbar {
    width: 5px;
    height: 5px;
}

::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
}

::-webkit-scrollbar-thumb {
    background: rgba(180, 180, 180, 0.3);
    border-radius: 3px;
    transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(180, 180, 180, 0.5);
}

/* 设置滚动条轨道角落 */
::-webkit-scrollbar-corner {
    background: transparent;
}

/* 优化特定区域滚动条 */
.music-list-container,
.playlist-grid-container,
.search-container {
    scrollbar-width: thin;
    /* Firefox */
    scrollbar-color: rgba(180, 180, 180, 0.3) rgba(0, 0, 0, 0.1);
    /* Firefox */
}

/* 覆盖原有的滚动条样式，保持一致性 */
.dynamic-lyrics {
    &::-webkit-scrollbar {
        width: 5px;
    }

    &::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(180, 180, 180, 0.3);
        border-radius: 3px;

        &:hover {
            background: rgba(180, 180, 180, 0.5);
        }
    }
}

/* 用户下拉菜单样式 */
.user-dropdown-btn {
    padding: 0;
    min-width: auto;
    height: auto;
    display: none; // 默认隐藏按钮，只显示图标
}

.user-dropdown-content {
    width: 220px;
    padding: 5px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);

    // 在暗黑模式下的样式
    .dark-theme & {
        background-color: #162035;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    }
}

/* 隐藏多余的用户图标，只保留一个 */
.nav-btn.user-btn {
    position: relative;

    .anticon {
        font-size: 18px;
    }

    // 将按钮图标隐藏，只显示链接图标
    .ant-btn-link .anticon {
        display: none;
    }
}

/* 歌单页面样式 */
.playlist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 10px;

    h2 {
        margin: 0;
        color: #fff;
        font-size: 18px;
    }
}

.clear-cache-btn {
    display: flex;
    align-items: center;
    gap: 5px;
    background-color: rgba(255, 255, 255, 0.1);
    border: none;
    color: rgba(255, 255, 255, 0.8);
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: rgba(255, 255, 255, 0.15);
        color: #fff;
    }
}
</style>