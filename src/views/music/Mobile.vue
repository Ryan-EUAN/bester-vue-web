<template>
  <div class="mobile-music-page">
    <!-- 顶部导航栏 -->
    <div class="music-header">
      <div class="back-button" @click="goBack">
        <van-icon name="arrow-left" size="24" />
      </div>
      <div class="header-title">{{ currentTab === 'home' ? '在线音乐' : '我的音乐' }}</div>
      <div class="search-button" @click="showSearch = true">
        <van-icon name="search" size="24" />
      </div>
    </div>

    <!-- 搜索框 -->
    <van-search v-model="searchKeyword" placeholder="搜索歌曲、歌手、专辑" show-action shape="round" v-show="showSearch"
      @search="onSearch" @cancel="showSearch = false" />

    <!-- 主内容区 -->
    <div class="music-content" :class="{ 'has-player': currentSong, 'has-tabbar': true }">
      <!-- 首页内容 -->
      <div v-if="currentTab === 'home'" class="tab-content">
        <!-- 歌单选择区域 -->
        <div class="playlist-selection">
          <div class="playlist-scroll-container" ref="playlistScrollContainer" @touchstart="handleContainerTouchStart"
            @touchmove="handleContainerTouchMove" @touchend="handleContainerTouchEnd">
            <!-- 左侧两个纵向长方形歌单 -->
            <div v-for="(playlist, index) in categoryPlaylists.slice(0, 2)" :key="playlist.id" 
              class="playlist-item vertical" :class="'pattern' + (index + 1)" @click="loadPlaylist(playlist.id)">
              <div class="playlist-content">
                <div class="playlist-title">{{ playlist.name }}</div>
                <div class="playlist-desc">{{ playlist.desc }}</div>
              </div>
            </div>

            <!-- 可展开的小方块歌单，上下两行 -->
            <div class="playlist-columns-container">
              <!-- 使用v-for循环创建列 -->
              <div v-for="cIndex in 3" :key="'column-' + cIndex"
                class="playlist-column" :class="{ 'expanded': expandedColumn === cIndex }">
                <!-- 每列显示2个歌单 -->
                <div v-for="rIndex in 2" :key="'row-' + rIndex"
                  class="playlist-item square" 
                  :class="'pattern' + ((cIndex * 2 + rIndex) % 6 + 1)"
                  @click="loadPlaylist(allPlaylists[((cIndex * 2 + rIndex) + 2) % allPlaylists.length].id)">
                  <div class="playlist-content">
                    <div class="playlist-title">{{ allPlaylists[((cIndex * 2 + rIndex) + 2) % allPlaylists.length].name }}</div>
                    <div class="playlist-desc">{{ allPlaylists[((cIndex * 2 + rIndex) + 2) % allPlaylists.length].desc }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 当前歌单音乐列表 -->
        <div v-if="currentPlaylist" class="current-playlist-section">
          <div class="section-header">
            <div class="section-title">{{ currentPlaylist.name }}</div>
            <div class="section-desc">{{ currentPlaylist.desc }}</div>
          </div>
          <div class="music-list" v-if="!isPlayerFullscreen">
            <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
              <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
                <div class="music-item" v-for="song in songList" :key="song.id" @click="playSong(song)"
                  :class="{ 'active': currentSong && currentSong.name === song.name }">
                  <div class="song-cover">
                    <img :src="getSongCover(song)" alt="封面">
                    <div class="playing-icon" v-if="currentSong && currentSong.name === song.name && isPlaying">
                      <van-icon name="play-circle-o" />
                    </div>
                  </div>
                  <div class="song-info">
                    <div class="song-name">{{ song.name }}</div>
                    <div class="song-artist">{{ song.artist }} · {{ song.album }}</div>
                  </div>
                  <div class="song-actions">
                    <van-icon name="plus" @click.stop="addToPlayQueue(song)" />
                  </div>
                </div>
              </van-list>
            </van-pull-refresh>
          </div>
        </div>
      </div>
    </div>

    <!-- 播放器全屏页 -->
    <div class="player-fullscreen" v-if="isPlayerFullscreen && currentSong">
      <!-- 专辑封面 -->
      <div class="album-cover">
        <img :src="currentSong ? getSongCover(currentSong) : 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
          alt="专辑封面" />
      </div>

      <!-- 歌曲信息 -->
      <div class="song-details">
        <div class="song-title">{{ currentSong.name }}</div>
        <div class="song-subtitle">{{ currentSong.artist }} · {{ currentSong.album }}</div>
      </div>

      <!-- 歌词显示 -->
      <div class="lyrics-container" ref="lyricsContainer">
        <div class="lyrics-wrapper" :style="{ transform: `translateY(${lyricsTranslateY}px)` }">
          <p v-for="(line, index) in parsedLyrics" :key="index" :class="{ 'active': currentLyricIndex === index }"
            class="lyric-line">
            {{ line.content }}
          </p>
          <p v-if="parsedLyrics.length === 0" class="lyric-line">暂无歌词</p>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-bar">
        <div class="time current">{{ formatTime(currentTime) }}</div>
        <van-slider v-model="sliderValue" :max="duration" @change="onSliderChange" @drag-start="onDragStart"
          @drag-end="onDragEnd" active-color="#1989fa" />
        <div class="time total">{{ formatTime(duration) }}</div>
      </div>

      <!-- 控制按钮 -->
      <div class="player-controls">
        <van-icon name="replay" size="28" @click="changePlayMode" />
        <van-icon name="arrow-left" size="28" @click="playPrevious" />
        <div class="play-button" @click="togglePlay">
          <van-icon :name="isPlaying ? 'pause-circle' : 'play-circle'" size="50" />
        </div>
        <van-icon name="arrow-right" size="28" @click="playNext" />
        <van-icon name="like-o" size="28" />
      </div>
    </div>

    <!-- 底部迷你播放器 -->
    <div class="mini-player" v-if="currentSong && !isPlayerFullscreen" @click="isPlayerFullscreen = true">
      <div class="mini-cover">
        <img :src="currentSong ? getSongCover(currentSong) : 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
          alt="封面">
      </div>
      <div class="mini-info">
        <div class="mini-name">{{ currentSong.name }}</div>
        <div class="mini-artist">{{ currentSong.artist }}</div>
      </div>
      <div class="mini-controls">
        <van-icon :name="isPlaying ? 'pause-circle-o' : 'play-circle-o'" @click.stop="togglePlay" size="24" />
        <van-icon name="play-list-o" @click.stop="showPlaylist = true" size="24" />
      </div>
    </div>

    <!-- 播放列表弹窗 -->
    <van-popup v-model:show="showPlaylist" position="bottom" round :style="{ height: '60%' }">
      <div class="playlist-header">
        <div class="playlist-title">播放列表 ({{ playQueue.length }}首)</div>
        <van-icon name="delete-o" @click="clearPlayQueue" />
      </div>
      <div class="playlist-content">
        <div class="playlist-item" v-for="(song, index) in playQueue" :key="index"
          :class="{ 'active': currentSong && currentSong.name === song.name }" @click="playSongFromQueue(index)">
          <div class="playlist-name">{{ song.name }}</div>
          <div class="playlist-artist">{{ song.artist }}</div>
          <van-icon name="cross" @click.stop="removeFromQueue(index)" />
        </div>
      </div>
    </van-popup>

    <!-- 隐藏的音频元素 -->
    <audio ref="audioRef" @timeupdate="onTimeUpdate" @ended="onAudioEnded" @loadedmetadata="onAudioLoaded"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { showToast, showLoadingToast, closeToast } from 'vant';
import musicApi from '@/services/music';
import type { SearchVO, MusicInfoVO } from '@/types/music';
import { ElMessage } from 'element-plus';

const router = useRouter();

// 音乐列表相关变量
const searchKeyword = ref('');
const showSearch = ref(false);
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);
const songList = ref<SearchVO[]>([]);
const currentPage = ref(1);
const pageSize = ref(20);
const isPlayerFullscreen = ref(false);
const showPlaylist = ref(false);
const audioRef = ref<HTMLAudioElement | null>(null);
const currentSong = ref<MusicInfoVO | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const sliderValue = ref(0);
const isDragging = ref(false);
const playQueue = ref<MusicInfoVO[]>([]);
const currentQueueIndex = ref(-1);
const parsedLyrics = ref<Array<{ time: number; content: string }>>([]);
const currentLyricIndex = ref(0);
const lyricsTranslateY = ref(0);
const playlistScrollContainer = ref<HTMLElement | null>(null);
const columnCount = ref(3); // 每行显示的歌单数量
const expandedColumn = ref(-1);
const initialTouchX = ref(0);
const currentTouchX = ref(0);
const scrollPosition = ref(0);
const lyricsContainer = ref<HTMLElement | null>(null);
const lastAttemptedSong = ref<SearchVO | null>(null); // 存储用户尝试播放但需要登录的歌曲

// 推荐歌单部分
interface Playlist {
  id: string;
  name: string;
  desc: string;
  bgColor?: string; // 添加背景颜色
}

// 所有歌单数据统一放在一个数组中
const allPlaylists = ref<Playlist[]>([
  // 分类歌单 - 热门榜单类
  {
    id: 'hot1',
    name: '热歌榜',
    desc: '每日最热音乐榜单',
    bgColor: 'linear-gradient(135deg, #6e45e2, #89d4cf)'
  },
  {
    id: 'healing1',
    name: '最爱的治愈系',
    desc: '治愈音乐',
    bgColor: 'linear-gradient(135deg, #cc2b5e, #753a88)'
  },
  {
    id: 'sea1',
    name: '大海大',
    desc: '精选音乐',
    bgColor: 'linear-gradient(135deg, #00bfa5, #00bfa5)'
  },
  {
    id: 'fear1',
    name: '恐惧系',
    desc: '治愈音乐',
    bgColor: 'linear-gradient(135deg, #d81b60, #c2185b)'
  },

  // 推荐歌单
  {
    id: 'rec1',
    name: '华语经典',
    desc: '经典华语歌曲合集'
  },
  {
    id: 'rec2',
    name: '流行热歌',
    desc: '当下流行歌曲'
  },
  {
    id: 'rec3',
    name: '轻音乐',
    desc: '放松心情'
  },
  {
    id: 'rec4',
    name: '摇滚精选',
    desc: '激情摇滚'
  },
  {
    id: 'rec5',
    name: '民谣集',
    desc: '感人民谣'
  },
  {
    id: 'rec6',
    name: '电音派对',
    desc: '嗨翻全场'
  }
]);

// 计算属性获取分类歌单（前4个）
const categoryPlaylists = computed(() => {
  return allPlaylists.value.slice(0, 4);
});

// 计算属性获取推荐歌单（后6个）
const recommendedPlaylists = computed(() => {
  return allPlaylists.value.slice(4);
});

// 页面状态变量
const currentTab = ref('home');
const currentPlaylist = ref<Playlist | null>(null);
const playMode = ref<'loop' | 'random' | 'single'>('loop');

// 计算属性
// @ts-ignore
const chunkedPlaylists = computed(() => {
  const chunks = [];
  for (let i = 0; i < recommendedPlaylists.value.length; i += columnCount.value) {
    chunks.push(recommendedPlaylists.value.slice(i, i + columnCount.value));
  }
  return chunks;
});

// 用户信息相关变量
const isLoggedIn = computed(() => checkLogin());
const userInfo = ref({
  nickname: '',
  userId: '',
  avatar: ''
});
const myPlaylists = ref<Playlist[]>([]);

// 方法
const goBack = () => {
  if (isPlayerFullscreen.value) {
    isPlayerFullscreen.value = false;
  } else {
    router.back();
  }
};

const onSearch = (value: string) => {
  if (!value.trim()) return;
  searchKeyword.value = value;
  currentPage.value = 1;
  songList.value = [];
  finished.value = false;
  showLoadingToast({ message: '搜索中...', forbidClick: true });
  searchMusic();
};

const onRefresh = () => {
  currentPage.value = 1;
  songList.value = [];
  finished.value = false;
  searchMusic();
  refreshing.value = false;
};

const onLoad = () => {
  searchMusic();
};

const searchMusic = async () => {
  if (!searchKeyword.value) {
    loading.value = false;
    return;
  }

  try {
    loading.value = true;
    const res = await musicApi.SEARCH_MUSIC_API(
      searchKeyword.value,
      currentPage.value,
      pageSize.value
    );

    if (res.code === 200 && res.data) {
      if (currentPage.value === 1) {
        songList.value = res.data;
      } else {
        songList.value = [...songList.value, ...res.data];
      }

      currentPage.value++;
      finished.value = res.data.length < pageSize.value;
    } else {
      showToast(res.message || '搜索失败');
      finished.value = true;
    }
  } catch (error) {
    console.error('搜索歌曲失败:', error);
    showToast('搜索失败，请重试');
    finished.value = true;
  } finally {
    loading.value = false;
    closeToast();
  }
};

const playSong = async (song: SearchVO) => {
  // 登录检查
  if (!checkLogin()) {
    showLoginModal(song);
    return;
  }

  try {
    showLoadingToast({ message: '加载中...', forbidClick: true });
    const res = await musicApi.GET_MUSIC_INFO_API(song.id);

    if (res.code === 200 && res.data) {
      const musicInfo = res.data;

      // 检查歌曲是否已在播放队列中
      const existingIndex = playQueue.value.findIndex(item => item.name === musicInfo.name);

      if (existingIndex === -1) {
        // 不在队列中，添加到队列末尾
        playQueue.value.push(musicInfo);
        currentQueueIndex.value = playQueue.value.length - 1;
      } else {
        // 已在队列中，直接播放
        currentQueueIndex.value = existingIndex;
      }

      currentSong.value = musicInfo;

      // 解析歌词
      parsedLyrics.value = musicApi.parseLyrics(musicInfo.lrc);
      currentLyricIndex.value = -1;

      // 加载音频
      if (audioRef.value) {
        audioRef.value.src = musicInfo.url;
        audioRef.value.load();
        audioRef.value.play().then(() => {
          isPlaying.value = true;
        }).catch(err => {
          console.error('播放失败:', err);
          showToast('播放失败，请重试');
        });
      }
    } else {
      showToast(res.message || '获取歌曲失败');
    }
  } catch (error) {
    console.error('获取歌曲信息失败:', error);
    showToast('加载歌曲失败，请重试');
  } finally {
    closeToast();
  }
};

const togglePlay = () => {
  if (!audioRef.value || !currentSong.value) return;

  if (isPlaying.value) {
    audioRef.value.pause();
    isPlaying.value = false;
  } else {
    audioRef.value.play().then(() => {
      isPlaying.value = true;
    }).catch(err => {
      console.error('播放失败:', err);
      showToast('播放失败，请重试');
    });
  }
};

const onTimeUpdate = () => {
  if (!audioRef.value || isDragging.value) return;

  currentTime.value = audioRef.value.currentTime;
  sliderValue.value = currentTime.value;

  // 更新当前歌词
  updateCurrentLyric();
};

const onAudioEnded = () => {
  if (playMode.value === 'single') {
    // 单曲循环
    if (audioRef.value) {
      audioRef.value.currentTime = 0;
      audioRef.value.play();
    }
  } else {
    // 播放下一首
    playNext();
  }
};

const onAudioLoaded = () => {
  if (!audioRef.value) return;

  duration.value = audioRef.value.duration;
  currentTime.value = 0;
  currentLyricIndex.value = -1;
  lyricsTranslateY.value = 0;
};

const onSliderChange = (value: number) => {
  if (!audioRef.value) return;

  currentTime.value = value;
  audioRef.value.currentTime = value;
};

const onDragStart = () => {
  isDragging.value = true;
};

const onDragEnd = () => {
  isDragging.value = false;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const playNext = () => {
  if (playQueue.value.length === 0) return;

  let nextIndex = -1;

  if (playMode.value === 'random') {
    // 随机播放
    nextIndex = Math.floor(Math.random() * playQueue.value.length);
  } else {
    // 顺序播放
    nextIndex = (currentQueueIndex.value + 1) % playQueue.value.length;
  }

  playSongFromQueue(nextIndex);
};

const playPrevious = () => {
  if (playQueue.value.length === 0) return;

  let prevIndex = -1;

  if (playMode.value === 'random') {
    // 随机播放
    prevIndex = Math.floor(Math.random() * playQueue.value.length);
  } else {
    // 顺序播放
    prevIndex = (currentQueueIndex.value - 1 + playQueue.value.length) % playQueue.value.length;
  }

  playSongFromQueue(prevIndex);
};

const playSongFromQueue = (index: number) => {
  if (index < 0 || index >= playQueue.value.length) return;

  currentQueueIndex.value = index;
  currentSong.value = playQueue.value[index];

  // 解析歌词
  parsedLyrics.value = musicApi.parseLyrics(currentSong.value.lrc);
  currentLyricIndex.value = -1;
  lyricsTranslateY.value = 0;

  // 加载音频
  if (audioRef.value) {
    audioRef.value.src = currentSong.value.url;
    audioRef.value.load();
    audioRef.value.play().then(() => {
      isPlaying.value = true;
    }).catch(err => {
      console.error('播放失败:', err);
      showToast('播放失败，请重试');
    });
  }
};

const removeFromQueue = (index: number) => {
  if (index < 0 || index >= playQueue.value.length) return;

  // 如果移除的是当前播放的歌曲
  if (index === currentQueueIndex.value) {
    if (playQueue.value.length === 1) {
      // 队列只有一首歌，清空播放
      clearPlayQueue();
    } else {
      // 队列有多首歌，播放下一首
      const nextIndex = index === playQueue.value.length - 1 ? 0 : index;
      playQueue.value.splice(index, 1);

      // 调整当前索引
      if (index < currentQueueIndex.value) {
        currentQueueIndex.value--;
      } else if (index === currentQueueIndex.value) {
        playSongFromQueue(nextIndex);
      }
    }
  } else {
    // 不是当前播放的歌曲，直接移除
    playQueue.value.splice(index, 1);

    // 调整当前索引
    if (index < currentQueueIndex.value) {
      currentQueueIndex.value--;
    }
  }
};

const clearPlayQueue = () => {
  playQueue.value = [];
  currentQueueIndex.value = -1;
  currentSong.value = null;

  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value.src = '';
  }

  isPlaying.value = false;
  isPlayerFullscreen.value = false;
};

const changePlayMode = () => {
  const modes: Array<'loop' | 'random' | 'single'> = ['loop', 'random', 'single'];
  const currentIndex = modes.indexOf(playMode.value);
  playMode.value = modes[(currentIndex + 1) % modes.length];

  const modeText = {
    loop: '列表循环',
    random: '随机播放',
    single: '单曲循环'
  };

  showToast(modeText[playMode.value]);
};

const updateCurrentLyric = () => {
  if (!currentSong.value || parsedLyrics.value.length === 0) return;

  const time = currentTime.value;
  let index = -1;

  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (time >= parsedLyrics.value[i].time) {
      index = i;
    } else {
      break;
    }
  }

  if (index !== currentLyricIndex.value) {
    currentLyricIndex.value = index;

    // 更新歌词滚动位置
    if (lyricsContainer.value && index >= 0) {
      lyricsTranslateY.value = -index * 30 + lyricsContainer.value.clientHeight / 3;
    }
  }
};

const getSongCover = (song: SearchVO | MusicInfoVO): string => {
  // 处理SearchVO类型
  if ('pic_id' in song) {
    return `https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg`;
  }
  // 处理MusicInfoVO类型
  return song.pic || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg';
};

const loadPlaylist = (playlistId: string) => {
  // 实现加载歌单的逻辑
  const playlist = allPlaylists.value.find(p => p.id === playlistId);
  if (playlist) {
    currentPlaylist.value = playlist;
    showToast(`加载歌单: ${playlist.name}`);

    // 模拟加载歌单数据
    searchKeyword.value = playlist.name;
    currentPage.value = 1;
    songList.value = [];
    finished.value = false;
    loading.value = true;

    // 延迟一下模拟加载效果
    setTimeout(() => {
      searchMusic();
    }, 300);
  }
};

// 检查登录状态
const checkLogin = (): boolean => {
  const token = localStorage.getItem('Authorization');
  const userInfo = localStorage.getItem('userInfo');
  return !!(token && userInfo);
};

// 显示登录提示
const showLoginModal = (song: SearchVO | null = null) => {
  if (song) {
    lastAttemptedSong.value = song;
  }
  // 触发全局登录事件
  window.dispatchEvent(new CustomEvent('showLoginModal', {
    detail: { redirect: window.location.pathname }
  }));
  ElMessage.warning('请先登录后再播放音乐');
};

// 处理登录成功事件
const handleLoginSuccess = () => {
  console.log('登录成功，检查是否有未完成的播放请求');
  if (lastAttemptedSong.value) {
    console.log('继续播放之前尝试的歌曲:', lastAttemptedSong.value.name);
    playSong(lastAttemptedSong.value);
    lastAttemptedSong.value = null;
  }
};

// 暂停音频播放
const pauseAudio = () => {
  if (audioRef.value) {
    audioRef.value.pause();
    isPlaying.value = false;
  }
};

// 检查登录状态并更新UI
const checkLoginStatusAndUpdateUI = () => {
  const isLoggedIn = checkLogin();
  if (!isLoggedIn && isPlaying.value) {
    // 用户已登出，暂停播放
    pauseAudio();
    ElMessage.info('您已登出，音乐已暂停');
  }
};

const fetchUserInfo = () => {
  const userInfoStr = localStorage.getItem('userInfo');
  if (userInfoStr) {
    try {
      const userData = JSON.parse(userInfoStr);
      userInfo.value = {
        nickname: userData.nickname || userData.username || '用户',
        userId: userData.id || '',
        avatar: userData.avatar || 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'
      };
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
};

//@ts-ignore
const handleLogout = () => {
  localStorage.removeItem('Authorization');
  localStorage.removeItem('userInfo');
  userInfo.value = {
    nickname: '',
    userId: '',
    avatar: ''
  };
  myPlaylists.value = [];
  checkLoginStatusAndUpdateUI();
  showToast('已退出登录');
};

//@ts-ignore
const createPlaylist = () => {
  showToast('创建歌单功能即将上线');
};

// @ts-ignore
const loadPlaylistById = (id: string) => {
  // 查找是推荐歌单还是我的歌单
  let playlist = recommendedPlaylists.value.find(p => p.id === id);
  if (!playlist && isLoggedIn.value) {
    playlist = myPlaylists.value.find(p => p.id === id);
  }

  if (playlist) {
    currentPlaylist.value = playlist;
    loadPlaylist(playlist.id);
  }
};

const addToPlayQueue = (song: SearchVO) => {
  if (!checkLogin()) {
    showLoginModal(song);
    return;
  }

  musicApi.GET_MUSIC_INFO_API(song.id).then(res => {
    if (res.code === 200 && res.data) {
      const musicInfo = res.data;
      const existingIndex = playQueue.value.findIndex(item => item.name === musicInfo.name);

      if (existingIndex === -1) {
        playQueue.value.push(musicInfo);
        showToast('已添加到播放列表');
      } else {
        showToast('歌曲已在播放列表中');
      }
    }
  }).catch(() => {
    showToast('添加失败，请重试');
  });
};

// 生命周期钩子
onMounted(() => {
  // 初始化音频元素
  audioRef.value = document.querySelector('audio');

  // 从本地存储恢复播放状态
  const savedQueue = localStorage.getItem('musicPlayQueue');
  const savedIndex = localStorage.getItem('musicCurrentIndex');

  if (savedQueue) {
    try {
      playQueue.value = JSON.parse(savedQueue);

      if (savedIndex && playQueue.value.length > 0) {
        const index = parseInt(savedIndex);
        if (!isNaN(index) && index >= 0 && index < playQueue.value.length) {
          currentQueueIndex.value = index;
          currentSong.value = playQueue.value[index];

          if (currentSong.value) {
            parsedLyrics.value = musicApi.parseLyrics(currentSong.value.lrc);
          }
        }
      }
    } catch (error) {
      console.error('恢复播放状态失败:', error);
    }
  }

  // 初始搜索，用于推荐歌曲
  searchKeyword.value = '推荐';
  searchMusic();

  // 添加登录成功和用户信息更新的事件监听
  window.addEventListener('loginSuccess', handleLoginSuccess);
  window.addEventListener('userInfoUpdated', checkLoginStatusAndUpdateUI);

  // 加载用户信息
  if (isLoggedIn.value) {
    fetchUserInfo();
  }
});

onUnmounted(() => {
  // 保存播放状态
  if (playQueue.value.length > 0) {
    localStorage.setItem('musicPlayQueue', JSON.stringify(playQueue.value));
    localStorage.setItem('musicCurrentIndex', currentQueueIndex.value.toString());
  }

  // 移除事件监听
  window.removeEventListener('loginSuccess', handleLoginSuccess);
  window.removeEventListener('userInfoUpdated', checkLoginStatusAndUpdateUI);
});

// 监听数据变化
watch(() => currentSong.value, (newSong) => {
  if (newSong) {
    document.title = `${newSong.name} - ${newSong.artist}`;
  } else {
    document.title = '在线音乐';
  }
});

// 处理触摸事件，实现歌单展开
const handleContainerTouchStart = (event: TouchEvent) => {
  initialTouchX.value = event.touches[0].clientX;
  currentTouchX.value = initialTouchX.value;

  if (playlistScrollContainer.value) {
    scrollPosition.value = playlistScrollContainer.value.scrollLeft;
  }
};

const handleContainerTouchMove = (event: TouchEvent) => {
  currentTouchX.value = event.touches[0].clientX;
  const diffX = currentTouchX.value - initialTouchX.value;

  // 根据滑动距离决定展开哪一列
  if (diffX < -50) {
    // 计算当前应该展开哪一列
    // 左滑超过阈值：第一次左滑展开第一列，第二次左滑展开第二列...
    const scrollThreshold = 130; // 滑动阈值
    const scrollDiff = Math.abs(diffX) - 50;
    const columnToExpand = Math.min(Math.floor(scrollDiff / scrollThreshold), columnCount.value - 1);
    expandedColumn.value = columnToExpand;

    // 阻止默认滚动行为
    event.preventDefault();
  } else if (diffX > 50) {
    // 右滑收起所有列
    expandedColumn.value = -1;

    // 阻止默认滚动行为
    event.preventDefault();
  }
};

const handleContainerTouchEnd = () => {
  // 滑动结束后，根据最终位置决定展开状态
  const diffX = currentTouchX.value - initialTouchX.value;

  // 如果只是轻微滑动，不改变展开状态
  if (Math.abs(diffX) < 30) {
    // 不做任何改变
  }
};
</script>

<style scoped>
.mobile-music-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
}

.music-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f1f1;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
}

.back-button,
.search-button {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.music-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.music-content.has-player {
  padding-bottom: 60px;
}

.music-content.has-tabbar {
  padding-bottom: 110px;
  /* 为底部导航栏和迷你播放器留出空间 */
}

.music-list {
  height: 100%;
  overflow-y: auto;
}

.music-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f5f5f5;
}

.music-item.active {
  background-color: #f0f9ff;
}

.song-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 12px;
  position: relative;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playing-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3);
  color: #ffffff;
}

.song-info {
  flex: 1;
  overflow: hidden;
}

.song-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-actions {
  display: flex;
  align-items: center;
}

.mini-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-top: 1px solid #f1f1f1;
  z-index: 100;
}

.mini-cover {
  width: 44px;
  height: 44px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 12px;
}

.mini-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-info {
  flex: 1;
  overflow: hidden;
}

.mini-name {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-artist {
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.player-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ffffff;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.album-cover {
  width: 80%;
  max-width: 300px;
  aspect-ratio: 1;
  margin: 30px auto;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-details {
  text-align: center;
  margin-bottom: 20px;
}

.song-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.song-subtitle {
  font-size: 16px;
  color: #666;
}

.lyrics-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.lyrics-wrapper {
  width: 100%;
  transition: transform 0.5s ease;
}

.lyric-line {
  text-align: center;
  font-size: 16px;
  color: #999;
  margin: 16px 0;
  height: 24px;
  transition: all 0.3s;
}

.lyric-line.active {
  color: #1989fa;
  font-size: 18px;
  font-weight: 500;
}

.progress-bar {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.time {
  font-size: 12px;
  color: #999;
  width: 40px;
}

.time.current {
  text-align: left;
}

.time.total {
  text-align: right;
}

.progress-bar .van-slider {
  flex: 1;
  margin: 0 12px;
}

.player-controls {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 30px;
  padding: 0 20px;
}

.play-button {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f1f1f1;
}

.playlist-title {
  font-size: 16px;
  font-weight: 600;
}

.playlist-content {
  text-align: left;
  padding: 20px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  width: 100%;
  height: 100%;
}

.playlist-title {
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  width: 100%;
  word-wrap: break-word;
  text-align: left;
}

.playlist-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1.3;
  width: 100%;
  word-wrap: break-word;
  text-align: left;
}

.playlist-item.square {
  width: 94px;
  height: 91px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 1;
  display: flex;
}

.playlist-item.square.expanded {
  width: 190px;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.playlist-item.square .playlist-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  height: 100%;
  width: 100%;
}

.playlist-item.square .playlist-title {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  width: 100%;
  text-align: left;
}

.playlist-item.square .playlist-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  width: 100%;
  text-align: left;
}

/* 花纹背景样式 */
.pattern1 {
  background: linear-gradient(135deg, #6e45e2, #89d4cf);
}

.pattern2 {
  background: linear-gradient(135deg, #00bfa5, #00bfa5);
}

.pattern3 {
  background: linear-gradient(135deg, #5c6bc0, #3949ab);
}

.pattern4 {
  background: linear-gradient(135deg, #cc2b5e, #753a88);
}

.pattern5 {
  background: linear-gradient(135deg, #d81b60, #c2185b);
}

.pattern6 {
  background: linear-gradient(135deg, #00bfa5, #00bfa5);
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(2, 94px);
  grid-template-rows: repeat(2, 94px);
  grid-gap: 8px;
  height: 190px;
  flex-shrink: 0;
  margin-right: 12px;
}

.playlist-cover.square {
  width: 100%;
  height: 100%;
  position: relative;
}

.playlist-cover.square img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-item.square .playlist-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 15px 6px 6px;
}

.playlist-item.square .playlist-name {
  color: #fff;
  font-size: 12px;
}

.playlist-play-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.2);
  color: #ffffff;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist-play-icon .van-icon {
  font-size: 36px;
  opacity: 0.9;
}

.playlist-item:hover .playlist-play-icon {
  opacity: 1;
}

/* 删除这些样式，以避免冲突 */
.playlist-cover.vertical,
.playlist-cover.square,
.playlist-play-icon,
.playlist-info,
.playlist-tag {
  display: none !important;
}

.playlist-selection {
  padding: 12px 0 12px 12px;
  background-color: #ffffff;
  margin-bottom: 10px;
}

.playlist-scroll-container {
  display: flex;
  align-items: flex-start;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* IE and Edge */
  padding-bottom: 8px;
  /* 防止底部被裁剪 */
}

.playlist-scroll-container::-webkit-scrollbar {
  display: none;
  /* Chrome, Safari, Opera */
}

.playlist-item.vertical {
  width: 130px;
  height: 190px;
  border-radius: 8px;
  overflow: hidden;
  margin-right: 12px;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(2, 94px);
  grid-template-rows: repeat(2, 94px);
  grid-gap: 8px;
  height: 190px;
  flex-shrink: 0;
  margin-right: 12px;
}

.playlist-columns-container {
  display: flex;
  gap: 8px;
  height: 190px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.playlist-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  height: 100%;
  transition: all 0.3s ease;
}

.playlist-column.expanded {
  transform: scale(1.05);
  z-index: 10;
}

.playlist-item.expandable {
  width: 94px;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  transition: width 0.3s ease;
}

.playlist-item.expandable.expanded {
  width: 190px;
}

.playlist-cover.square {
  width: 100%;
  height: 100%;
  position: relative;
}

.playlist-cover.square img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-item.square .playlist-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 15px 6px 6px;
}

.playlist-item.square .playlist-name {
  color: #fff;
  font-size: 12px;
}

.playlist-play-icon {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.2);
  color: #ffffff;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist-play-icon .van-icon {
  font-size: 36px;
  opacity: 0.9;
}

.playlist-item:hover .playlist-play-icon {
  opacity: 1;
}

.playlist-section {
  padding: 12px;
  background-color: #ffffff;
  margin-bottom: 10px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.playlist-columns-container {
  display: flex;
  gap: 8px;
  height: 190px;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.playlist-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
  height: 100%;
  transition: all 0.3s ease;
}

.playlist-column.expanded {
  transform: scale(1.05);
  z-index: 10;
}

.playlist-item.square {
  width: 94px;
  height: 91px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 1;
  display: flex;
}

.playlist-item.square.expanded {
  width: 190px;
  z-index: 2;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.playlist-item.square .playlist-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  height: 100%;
  width: 100%;
}

.playlist-item.square .playlist-title {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 4px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  width: 100%;
  text-align: left;
}

.playlist-item.square .playlist-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
  width: 100%;
  text-align: left;
}

.playlist-cover {
  width: 100%;
  height: 100%;
  position: relative;
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-name {
  color: #fff;
  font-size: 12px;
}

/* 新增样式 */
.tab-content {
  height: 100%;
  overflow-y: auto;
}

.user-card {
  background-color: #ffffff;
  padding: 20px 16px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-id {
  font-size: 14px;
  color: #999;
}

.user-actions {
  display: flex;
  gap: 10px;
}

.my-playlists {
  background-color: #ffffff;
  padding: 16px;
}

.section-header {
  margin-bottom: 10px;
}

.section-desc {
  font-size: 14px;
  color: #999;
  margin-top: 4px;
}

.current-playlist-section {
  background-color: #ffffff;
  padding: 16px;
  margin-top: 10px;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
}

.empty-tip .van-button {
  margin-top: 16px;
}

.playlist-count {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 调整歌曲项中的加号按钮样式 */
.song-actions .van-icon {
  font-size: 22px;
  color: #666;
  padding: 5px;
}

.song-actions .van-icon:active {
  color: #1989fa;
}
</style>