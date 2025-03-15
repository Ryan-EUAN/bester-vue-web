import type { Result } from '../model/result'
import http from './request'

/**
 * 获取用户信息API
 * 
 * @returns {Promise<Result<any>>} - 返回一个Promise对象，包含用户信息
 * 
 * 该函数通过HTTP GET请求获取当前登录用户的信息。
 * 请求的URL为：'/user/info'
 * 请求方法为GET。
 */
async function GET_USER_INFO_API(): Promise<Result<any>> {
    return await http({
        url: '/user/info',
        method: 'get'
    }) as Result<any>
}

/**
 * 更新用户信息API
 * 
 * @param {any} data - 要更新的用户信息数据
 * @returns {Promise<Result<any>>} - 返回一个Promise对象，包含更新结果
 * 
 * 该函数通过HTTP PUT请求更新用户信息。
 * 请求的URL为：'/user/update'
 * 请求方法为PUT。
 */
async function UPDATE_USER_INFO_API(data: any): Promise<Result<any>> {
    return await http({
        url: '/user/update',
        method: 'put',
        data
    }) as Result<any>
}

export const UserApi = {
    GET_USER_INFO_API,
    UPDATE_USER_INFO_API
}

export default UserApi 