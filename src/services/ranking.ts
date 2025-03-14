import http from './request'
import type { Result } from '../model/result.ts'

// 金币排行榜
async function GET_USER_GOLD_COIN_RANKING_LIST_API(): Promise<Result<any>> {
    return await http({
        url: '/ranking/user/get/goldCoinList',
        method: 'get'
    }) as Result<any>
}

export default {
    GET_USER_GOLD_COIN_RANKING_LIST_API
}