/**
 * 网站统计数据接口
 * 包含网站的各项统计指标
 */
export interface WebsiteStatistics {
  /** 今日帖子数量 */
  todayPosts: number;
  /** 昨日帖子数量 */
  yesterdayPosts: number;
  /** 总帖子数量 */
  totalPosts: number;
  /** 总会员数量 */
  totalMembers: number;
} 