export interface HeadNavInfoModal {
    label: string,
    path: string
    key: number,
    icon: string,
    children?: HeadNavInfoModal[]
}

export interface HeadUserInfoModal {
    /** 用户ID */
    id: number,
    /** 用户名称 */
    name: string,
    /** 用户头像地址 */
    avatar: string,
    /** 硬币数量 */
    hardCurrency: number,
    /** B币数量 */
    bCurrency: number,
    /** 下一等级 */
    nextLevel: number,
    /** 升级所需成长值 */
    needGrowth: number,
    /** 关注数量 */
    following: number,
    /** 粉丝数量 */
    followers: number,
    /** 动态数量 */
    posts: number,
    growth?: number
}