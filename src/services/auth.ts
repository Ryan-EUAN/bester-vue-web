import type { LoginModel, AuthResponse } from '../model/login.ts'
import type { Result } from '../model/result.ts'
import http from './request.ts'

/**
 * 登录鉴权
 * @param data 
 * @returns 
 */
async function LOGIN_API(data: LoginModel): Promise<Result<AuthResponse>> {
  return await http({
    url: '/auth/user/login',
    method: 'post',
    data
  }) as Result<AuthResponse>
}

async function REGISTER_API(data: any) {
  return await http({
    url: '/auth/user/register',
    method: 'post',
    data
  })
}

export default {
  LOGIN_API, REGISTER_API
}