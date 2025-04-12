import request from '@/utils/request'
import type { Result } from '@/model/result'
import type { ModuleData, OnlineMemberData } from '@/types/module'

/**
 * 获取模块数据API
 * 
 * @returns {Promise<Result<ModuleData[]>>} - 返回一个Promise对象，包含模块数据数组
 * 
 * 该函数通过HTTP GET请求获取模块数据。
 * 请求的URL为：'/web/module/getModule'
 * 请求方法为GET。
 */
async function GET_MODULE_DATA_API(): Promise<Result<ModuleData[]>> {
    return await request({
        url: '/web/module/getModule',
        method: 'get',
    }) as Result<ModuleData[]>
}
/**
 * 获取在线会员数据API
 * 
 * @returns {Promise<Result<OnlineMemberData>>} - 返回一个Promise对象，包含在线会员数据
 * 
 * 该函数通过HTTP GET请求获取在线会员数据。
 * 请求的URL为：'/web/module/getOnline'
 * 请求方法为GET。
 */
async function GET_ONLINE_MEMBERS_API(): Promise<Result<OnlineMemberData>> {
    const response = await request({
        url: '/web/module/getOnline',
        method: 'get'
    }) as Result<OnlineMemberData>;

    return response;
}

export default {
    GET_MODULE_DATA_API,
    GET_ONLINE_MEMBERS_API
} 