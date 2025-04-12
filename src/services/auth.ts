import type { LoginModel, AuthResponse, LoginEmailModel } from '../model/login'
import type { Result } from '@/model/result'
import http from '@/utils/request'


/**
 * 异步登录API函数，用于用户登录验证。
 * 
 * @param {LoginModel} data - 登录所需的用户数据模型。
 * @returns {Promise<Result<string>>} - 返回一个Promise对象，解析为包含字符串结果的Result对象。
 * 
 * 该函数通过HTTP POST请求向'/auth/user/login'端点发送登录数据，
 * 并将响应结果作为Result<string>类型返回。
 */
async function LOGIN_API(data: LoginModel): Promise<Result<string>> {
  return await http({
    url: '/auth/user/login',
    method: 'post',
    data
  }) as Result<string>
}

/**
 * APP端登录API函数
 * 
 * @param {LoginModel} data - 登录所需的用户数据模型
 * @returns {Promise<Result<AuthResponse>>} - 返回一个Promise对象，包含登录结果
 * 
 * 该函数通过HTTP POST请求向'/app/auth/login'端点发送登录数据，
 * 并将响应结果作为Result<AuthResponse>类型返回。
 */
async function APP_LOGIN_API(data: LoginModel): Promise<Result<AuthResponse>> {
  return await http({
    url: '/auth/user/login',
    method: 'post',
    data
  }) as Result<AuthResponse>
}

/**
 * APP端短信验证码登录API函数
 * 
 * @param {object} data - 包含手机号和验证码的对象
 * @returns {Promise<Result<AuthResponse>>} - 返回一个Promise对象，包含登录结果
 * 
 * 该函数通过HTTP POST请求向'/app/auth/sms-login'端点发送短信验证码登录数据，
 * 并将响应结果作为Result<AuthResponse>类型返回。
 */
async function APP_SMS_LOGIN_API(data: { phone: string, code: string }): Promise<Result<AuthResponse>> {
  return await http({
    url: '/app/auth/sms-login',
    method: 'post',
    data
  }) as Result<AuthResponse>
}

/**
 * APP端发送短信验证码API函数
 * 
 * @param {string} phone - 手机号码
 * @returns {Promise<Result<{ requestId: string }>>} - 返回一个Promise对象，包含请求ID
 * 
 * 该函数通过HTTP GET请求向'/app/auth/send-sms'端点发送获取验证码请求，
 * 并将响应结果作为Result<{ requestId: string }>类型返回。
 */
async function APP_SEND_SMS_API(phone: string): Promise<Result<{ requestId: string }>> {
  return await http({
    url: `/app/auth/send-sms?phone=${phone}`,
    method: 'get'
  }) as Result<{ requestId: string }>
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

/**
 * 异步函数，用于通过用户的电子邮件地址获取代码。
 * 
 * @param {string} email - 用户的电子邮件地址。
 * @returns {Promise<Result<any>>} - 返回一个Promise对象，该对象解析为包含结果的Result类型。
 * 
 * 该函数通过HTTP GET请求向指定的URL发送请求，URL包含用户的电子邮件地址作为查询参数。
 * 请求的URL格式为：'/auth/user/logout?email=' + email。
 * 请求方法为GET。
 * 返回的结果被断言为Result类型。
 */
async function GET_CODE_API(email: string): Promise<Result<string>> {
  return await http({
    url: '/auth/user/sendCode?email=' + email,
    method: 'get',
  }) as Result<string>
}

async function LOGIN_EMAIL_API(data: LoginEmailModel): Promise<Result<any>> {
  return await http({
    url: '/auth/user/loginEmail',
    method: 'post',
    data
  }) as Result<any>
}

// 添加验证 token 的接口
async function CHECK_TOKEN_API(): Promise<Result<{ valid: boolean; expireTime: number }>> {
  return await http({
    url: '/auth/user/check-token',
    method: 'GET'
  }) as Result<{ valid: boolean; expireTime: number }>
}
/**
 * 获取登录结果的API调用
 * 
 * @param {string} trackingId - 用于跟踪登录状态的唯一标识符
 * @returns {Promise<Result<AuthResponse>>} - 返回一个Promise，解析为包含AuthResponse结果的Result对象
 * 
 * 该函数通过HTTP GET请求获取指定trackingId的登录结果。
 * 请求的URL为 '/auth/user/check-login/' + trackingId。
 * 请求方法为GET。
 * 返回的结果是一个Promise，该Promise解析为一个Result对象，其中包含AuthResponse数据。
 */
async function GET_LOGIN_RESULT_API(trackingId: string): Promise<Result<AuthResponse>> {
  return await http({
    url: '/auth/user/check-login/' + trackingId,
    method: 'GET'
  }) as Result<AuthResponse>
}

async function GET_CODE_RESULT_API(requestId: string): Promise<Result<Boolean>> {
  return await http({
    url: '/auth/user/check-sendCode/' + requestId,
    method: 'GET'
  }) as Result<Boolean>
}

export default {
  LOGIN_API, 
  REGISTER_API, 
  LOG_OUT_API, 
  GET_CODE_API, 
  LOGIN_EMAIL_API, 
  CHECK_TOKEN_API, 
  GET_LOGIN_RESULT_API, 
  GET_CODE_RESULT_API,
  APP_LOGIN_API,
  APP_SMS_LOGIN_API,
  APP_SEND_SMS_API
}