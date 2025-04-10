import request from '@/utils/request'
import type { Result } from '@/model/result'
import type { ModuleData, OnlineMemberData } from '@/types/module'

/**
 * 获取模块数据API
 * 
 * @returns {Promise<Result<ModuleData[]>>} - 返回一个Promise对象，包含模块数据数组
 * 
 * 该函数通过HTTP GET请求获取模块数据。
 * 请求的URL为：'/web/module/getModule'
 * 请求方法为GET。
 */
async function GET_MODULE_DATA_API(): Promise<Result<ModuleData[]>> {
    try {
        const response = await request({
            url: '/web/module/getModule',
            method: 'get'
        }) as Result<ModuleData[]>;
        
        return response;
    } catch (error) {
        console.error('Error fetching module data:', error);
        
        // 返回静态数据作为备用
        return {
            code: 200,
            message: 'success',
            data: [
                {
                    title: '共享区',
                    plateInfos: [
                        {
                            name: '免费资源',
                            icon: 'https://api.dicebear.com/7.x/icons/svg?icon=archive',
                            count: '1250',
                            topics: '325',
                            posts: '5860',
                            lastPost: '1小时前',
                            path: null // 将path设为null，以便跳转到模块文章列表页
                        },
                        {
                            name: '付费资源',
                            icon: 'https://api.dicebear.com/7.x/icons/svg?icon=coins',
                            count: '980',
                            topics: '211',
                            posts: '3420',
                            lastPost: '3小时前',
                            path: null
                        },
                        {
                            name: '技术问答',
                            icon: 'https://api.dicebear.com/7.x/icons/svg?icon=code',
                            count: '1750',
                            topics: '568',
                            posts: '8932',
                            lastPost: '30分钟前',
                            path: null
                        },
                        {
                            name: '招聘信息',
                            icon: 'https://api.dicebear.com/7.x/icons/svg?icon=briefcase',
                            count: '520',
                            topics: '145',
                            posts: '1235',
                            lastPost: '2小时前',
                            path: null
                        }
                    ]
                },
                {
                    title: '技术专区',
                    plateInfos: [
                        {
                            name: '前端开发',
                            icon: 'https://api.dicebear.com/7.x/icons/svg?icon=code-branch',
                            count: '2150',
                            topics: '742',
                            posts: '12560',
                            lastPost: '15分钟前',
                            path: null
                        },
                        {
                            name: '后端开发',
                            icon: 'https://api.dicebear.com/7.x/icons/svg?icon=server',
                            count: '1830',
                            topics: '635',
                            posts: '9870',
                            lastPost: '45分钟前',
                            path: null
                        },
                        {
                            name: '移动开发',
                            icon: 'https://api.dicebear.com/7.x/icons/svg?icon=mobile',
                            count: '1320',
                            topics: '410',
                            posts: '6240',
                            lastPost: '1.5小时前',
                            path: null
                        },
                        {
                            name: '数据分析',
                            icon: 'https://api.dicebear.com/7.x/icons/svg?icon=chart-line',
                            count: '980',
                            topics: '320',
                            posts: '4750',
                            lastPost: '2.5小时前',
                            path: null
                        }
                    ]
                }
            ]
        };
    }
}

/**
 * 获取在线会员数据API
 * 
 * @returns {Promise<Result<OnlineMemberData>>} - 返回一个Promise对象，包含在线会员数据
 * 
 * 该函数通过HTTP GET请求获取在线会员数据。
 * 请求的URL为：'/web/module/getOnline'
 * 请求方法为GET。
 */
async function GET_ONLINE_MEMBERS_API(): Promise<Result<OnlineMemberData>> {
    try {
        const response = await request({
            url: '/web/module/getOnline',
            method: 'get'
        }) as Result<OnlineMemberData>;
        
        return response;
    } catch (error) {
        console.error('Error fetching online members data:', error);
        
        // 返回静态数据作为备用
        return {
            code: 200,
            message: 'success',
            data: [
                { label: '今日在线', value: 1250 },
                { label: '会员总数', value: 52430 },
                { label: '新注册', value: 128 }
            ]
        };
    }
}

export default {
    GET_MODULE_DATA_API,
    GET_ONLINE_MEMBERS_API
} 