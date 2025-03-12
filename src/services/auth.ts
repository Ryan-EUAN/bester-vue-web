import type { LoginModel, AuthResponse } from '../model/login.ts'
import type { Result } from '../model/result.ts'
import http from './request.ts'

/**
 * 异步登录API函数，用于用户登录验证。
 * 
 * @param {LoginModel} data - 登录请求的数据模型，包含用户名和密码等信息。
 * @returns {Promise<Result<AuthResponse>>} - 返回一个Promise对象，解析为包含认证响应的结果对象。
 * 
 * 该函数通过HTTP POST请求将登录数据发送到指定的URL（'/auth/user/login'），并等待服务器响应。
 * 服务器响应后，函数将响应数据解析为Result<AuthResponse>类型并返回。
 */
async function LOGIN_API(data: LoginModel): Promise<Result<AuthResponse>> {
  return await http({
    url: '/auth/user/login',
    method: 'post',
    data
  }) as Result<AuthResponse>
}

/**
 * 注册API接口
 * 
 * @param {any} data - 注册所需的数据，具体格式根据后端要求而定
 * @returns {Promise<any>} - 返回一个Promise对象，包含注册请求的结果
 * 
 * 该函数用于向服务器发送用户注册请求。通过POST方法将用户注册数据发送到指定的URL，
 * 并返回服务器的响应结果。使用async/await语法来处理异步请求。
 */
async function REGISTER_API(data: any) {
  return await http({
    url: '/auth/user/register', // 请求的URL地址，用于用户注册
    method: 'post',             // 请求方法，使用POST方法提交数据
    data                        // 请求体数据，包含用户注册信息
  })
}

/**
 * 异步函数，用于调用用户登出API。
 * 
 * 该函数通过HTTP GET请求向服务器发送登出请求，并返回服务器的响应。
 * 
 * @returns {Promise<any>} 返回一个Promise对象，该对象解析为服务器的响应数据。
 */
async function LOG_OUT_API(): Promise<Result<any>> {
  return await http({
    url: '/auth/user/logout',
    method: 'get',
  }) as Result<any>
}

export default {
  LOGIN_API, REGISTER_API, LOG_OUT_API
}