import type { Result } from '@/model/result'
import type { CarouselItem } from '@/types/carousel'
import http from '@/utils/request'

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
        url: '/web/carousel/top',
        method: 'get'
    }) as Result<CarouselItem[]>
}

export default {
    GET_TOP_CAROUSEL_API
} 