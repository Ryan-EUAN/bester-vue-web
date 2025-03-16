import type { Result } from '../model/result'
import http from './request'

// 定义接口
export interface PlateInfo {
    name: string
    icon: string
    count: string
    topics: string
    posts: string
    lastPost: string
    path: string | null
}

export interface ModuleData {
    title: string
    plateInfos: PlateInfo[]
}


export interface OnlineMemberData extends Array<{
    label: string;
    value: number;
}> {}

/**
 * 获取模块数据API
 * 
 * @returns {Promise<Result<ModuleData[]>>} - 返回一个Promise对象，包含模块数据数组
 * 
 * 该函数通过HTTP GET请求获取模块数据。
 * 请求的URL为：'/module/getModule'
 * 请求方法为GET。
 */
async function GET_MODULE_DATA_API(): Promise<Result<ModuleData[]>> {
    return await http({
        url: '/module/getModule',
        method: 'get'
    }) as Result<ModuleData[]>
}

/**
 * 获取在线会员数据API
 * 
 * @returns {Promise<Result<OnlineMemberData>>} - 返回一个Promise对象，包含在线会员数据
 * 
 * 该函数通过HTTP GET请求获取在线会员数据。
 * 请求的URL为：'/module/getOnline'
 * 请求方法为GET。
 */
async function GET_ONLINE_MEMBERS_API(): Promise<Result<OnlineMemberData>> {
    return await http({
        url: '/module/getOnline',
        method: 'get'
    }) as Result<OnlineMemberData>
}

export default {
    GET_MODULE_DATA_API,
    GET_ONLINE_MEMBERS_API
} 