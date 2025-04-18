// 轮播图相关接口定义

/**
 * 轮播图数据项接口
 */
export interface CarouselItem {
    url: string
    title: string
    description: string
    link?: string
    type?: 'image' | 'video'  // 新增类型字段
} 