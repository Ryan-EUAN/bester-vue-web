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

/**
 * 获取系统运行时间API
 * 
 * @returns {Promise<Result<number>>} - 返回一个Promise，解析为包含系统运行时间(毫秒)的Result对象
 * 
 * 该函数通过HTTP GET请求获取系统运行时间。
 * 请求的URL为 '/web/system/runningTime'。
 * 请求方法为GET。
 */
async function GET_SYSTEM_RUNNING_TIME_API(): Promise<Result<number>> {
  return await http({
    url: '/web/system/runningTime',
    method: 'GET'
  }) as Result<number>
}

export default {
  GET_WEBSITE_STATISTICS_API,
  GET_SYSTEM_RUNNING_TIME_API
} 