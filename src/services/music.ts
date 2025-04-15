import request from '@/utils/request'
import type { Result } from '@/model/result'
import type { SearchVO, MusicInfoVO, MusicListVO } from '@/types/music'

/**
 * 搜索歌曲接口
 * 
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码
 * @param {number} limit - 每页条数
 * @returns {Promise<Result<SearchVO[]>>} - 返回一个Promise对象，包含歌曲搜索结果列表
 * 
 * 该函数通过HTTP GET请求搜索歌曲。
 * 请求的URL为：'/music/search'
 * 请求方法为GET。
 */
async function SEARCH_MUSIC_API(keyword: string, page: number = 1, limit: number = 20): Promise<Result<SearchVO[]>> {
    return await request({
        url: '/music/search',
        method: 'get',
        params: {
            name: keyword,
            page,
            limit
        }
    }) as Result<SearchVO[]>
}

/**
 * 获取歌曲详情接口
 * 
 * @param {string} id - 歌曲ID
 * @returns {Promise<Result<MusicInfoVO>>} - 返回一个Promise对象，包含歌曲详细信息
 * 
 * 该函数通过HTTP GET请求获取歌曲详情。
 * 请求的URL为：'/music/info/{id}'
 * 请求方法为GET。
 */
async function GET_MUSIC_INFO_API(id: string): Promise<Result<MusicInfoVO>> {
    return await request({
        url: `/music/info/${id}`,
        method: 'get'
    }) as Result<MusicInfoVO>
}

/**
 * 获取歌单接口
 * 
 * @param {string} id - 歌单ID
 * @returns {Promise<Result<MusicListVO>>} - 返回一个Promise对象，包含歌单信息
 * 
 * 该函数通过HTTP GET请求获取歌单。
 * 请求的URL为：'/music/list/{id}'
 * 请求方法为GET。
 */
async function GET_MUSIC_LIST_BY_ID_API(id: string): Promise<Result<MusicListVO>> {
    return await request({
        url: `/music/list/${id}`,
        method: 'get'
    }) as Result<MusicListVO>
}

/**
 * 解析歌词字符串为时间轴对象数组
 * @param lyricsText 歌词文本
 * @returns 解析后的歌词对象数组
 */
function parseLyrics(lyricsText: string): { time: number; content: string }[] {
    if (!lyricsText) return [];

    const lines = lyricsText.split('\n');
    const pattern = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    const result: { time: number; content: string }[] = [];

    lines.forEach(line => {
        if (line.trim() === '') return;
        
        const match = pattern.exec(line);
        if (!match) return;

        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        
        // 转换为秒
        const time = minutes * 60 + seconds + milliseconds / 1000;
        
        // 提取歌词内容
        const content = line.replace(pattern, '').trim();
        if (content) {
            result.push({ time, content });
        }
    });

    // 按时间排序
    return result.sort((a, b) => a.time - b.time);
}

export default {
    SEARCH_MUSIC_API,
    GET_MUSIC_INFO_API,
    GET_MUSIC_LIST_BY_ID_API,
    parseLyrics
} 