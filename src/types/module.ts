// 模块相关接口定义

/**
 * 板块信息接口
 */
export interface PlateInfo {
    name: string
    icon: string
    count: string
    topics: string
    posts: string
    lastPost: string
    path: string | null
}

/**
 * 模块数据接口
 */
export interface ModuleData {
    title: string
    plateInfos: PlateInfo[]
}

/**
 * 在线会员数据接口
 */
export interface OnlineMemberData extends Array<{
    label: string;
    value: number;
}> {} 