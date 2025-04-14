/**
 * 在线用户状态接口
 */
export interface OnlineUserStatus {
  userId: string | number | null;  // 用户ID，游客为null
  userType: 'member' | 'guest';    // 用户类型：会员或游客
  status: 'online' | 'offline';    // 在线状态
  lastActiveTime: number;          // 最后活跃时间戳
  sessionId?: string;              // 会话ID
  userRole?: string;               // 用户角色
  username?: string;               // 用户名
  ip?: string;                     // IP地址
}

/**
 * 心跳包数据接口
 */
export interface HeartbeatData {
  userId: string | number | null;  // 用户ID，游客为null
  userType: 'member' | 'guest';    // 用户类型：会员或游客
  timestamp: number;               // 时间戳
  clientInfo?: {                   // 客户端信息（可选）
    browser: string;               // 浏览器信息
    os: string;                    // 操作系统
    device: string;                // 设备类型
  };
}

/**
 * 后端HeartbeatVO类映射（根据图片中的Java类）
 * 在线统计数据接口
 */
export interface HeartbeatVO {
  totalOnline: number;             // 在线人数
  members: number;                 // 会员人数
  guests: number;                  // 游客人数
  invisible: number;               // 隐身人数
  userGroups: Record<string, number>; // 用户组统计
}

/**
 * 心跳响应接口
 */
export interface HeartbeatResponse {
  success: boolean;                // 是否成功
  timestamp: number;               // 服务器时间戳
  message?: string;                // 消息
  data?: HeartbeatVO;              // 统计数据（可选，使用后端返回的HeartbeatVO类型）
  code?: number;                   // 状态码
} 