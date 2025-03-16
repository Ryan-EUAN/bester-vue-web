import type { Result } from '../model/result'
import http from './request'

// 定义轮播图数据接口
export interface CarouselItem {
    imageUrl: string
    title: string
    description: string
    link?: string
}

/**
 * 获取顶部轮播图数据API
 * 
 * @returns {Promise<Result<CarouselItem[]>>} - 返回一个Promise对象，包含轮播图数据数组
 * 
 * 该函数通过HTTP GET请求获取首页顶部轮播图数据。
 * 请求的URL为：'/carousel/top'
 * 请求方法为GET。
 */
async function GET_TOP_CAROUSEL_API(): Promise<Result<CarouselItem[]>> {
    return await http({
        url: '/carousel/top',
        method: 'get'
    }) as Result<CarouselItem[]>
}

export default {
    GET_TOP_CAROUSEL_API
} 