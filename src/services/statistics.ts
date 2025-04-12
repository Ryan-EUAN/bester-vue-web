import type { Result } from '@/model/result'
import type { WebsiteStatistics } from '@/model/statistics'
import http from '@/utils/request'

/**
 * 获取网站统计数据API
 * 
 * @returns {Promise<Result<WebsiteStatistics>>} - 返回一个Promise，解析为包含统计数据的Result对象
 * 
 * 该函数通过HTTP GET请求获取网站统计数据。
 * 请求的URL为 '/web/statistics/website'。
 * 请求方法为GET。
 */
async function GET_WEBSITE_STATISTICS_API(): Promise<Result<WebsiteStatistics>> {
  return await http({
    url: '/web/statistics/website',
    method: 'GET'
  }) as Result<WebsiteStatistics>
}

export default {
  GET_WEBSITE_STATISTICS_API
} 