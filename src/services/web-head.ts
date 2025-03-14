import type { HeadNavInfoModal } from '../model/headInfo.ts'
import type { Result } from '../model/result.ts'
import http from './request'

async function GET_HEAD_INFO_API(): Promise<Result<HeadNavInfoModal[]>> {
    return await http({
        url: '/web/get_head_info',
        method: 'get'
    }) as Result<HeadNavInfoModal[]>
}

export default {
    GET_HEAD_INFO_API
}