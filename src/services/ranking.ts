import http from '@/utils/request'
import type { Result } from '@/model/result'

// 金币排行榜
async function GET_USER_GOLD_COIN_RANKING_LIST_API(): Promise<Result<any>> {
    return await http({
        url: '/web/ranking/getUserGoldCoin',
        method: 'get'
    }) as Result<any>
}

export default {
    GET_USER_GOLD_COIN_RANKING_LIST_API
}