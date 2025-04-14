import request from '@/utils/request'
import type { Result } from '@/model/result'
import type { HeartbeatData, HeartbeatVO } from '@/types/online'

/**
 * 发送心跳包API
 * 
 * @returns {Promise<Result<HeartbeatVO>>} - 返回一个Promise对象，包含心跳响应结果
 * 
 * 该函数通过HTTP POST请求发送用户心跳包，维持在线状态。
 * 请求的URL为：'/web/heartbeat'
 * 请求方法为POST。
 */
async function SEND_HEARTBEAT_API(): Promise<Result<HeartbeatVO>> {
  const isLoggedIn = !!localStorage.getItem('token');
  const userInfoStr = localStorage.getItem('userInfo');
  let userId = null;
  let userType: 'member' | 'guest' = 'guest';
  
  if (isLoggedIn && userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      userId = userInfo.id;
      userType = 'member';
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
  
  const heartbeatData: HeartbeatData = {
    userId,
    userType,
    timestamp: Date.now(),
    clientInfo: {
      browser: getBrowserInfo(),
      os: getOSInfo(),
      device: getDeviceInfo()
    }
  };
  
  try {
    // 尝试不同的路径获取，根据错误信息包含系统路径
    return await request({
      url: '/web/heartbeat',
      method: 'post',
      data: heartbeatData
    }) as Result<HeartbeatVO>;
  } catch (error) {
    console.error('发送心跳包失败:', error);
    // 返回一个空结果，避免影响UI显示
    return {
      code: 500,
      message: '心跳请求失败',
      data: {
        totalOnline: 0,
        members: 0,
        guests: 0,
        invisible: 0,
        userGroups: {}
      }
    } as Result<HeartbeatVO>;
  }
}

/**
 * 发送离线通知API
 * 
 * @returns {Promise<Result<any>>} - 返回一个Promise对象，包含离线通知结果
 * 
 * 该函数通过HTTP POST请求发送用户离线通知。
 * 请求的URL为：'/web/offline'
 * 请求方法为POST。
 */
async function SEND_OFFLINE_API(): Promise<Result<any>> {
  const isLoggedIn = !!localStorage.getItem('token');
  const userInfoStr = localStorage.getItem('userInfo');
  let userId = null;
  let userType: 'member' | 'guest' = 'guest';
  
  if (isLoggedIn && userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      userId = userInfo.id;
      userType = 'member';
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
  
  const offlineData: HeartbeatData = {
    userId,
    userType,
    timestamp: Date.now()
  };
  
  try {
    return await request({
      url: '/web/offline',
      method: 'post',
      data: offlineData
    }) as Result<any>;
  } catch (error) {
    console.error('发送离线通知失败:', error);
    return {
      code: 500,
      message: '离线通知失败',
      data: null
    } as Result<any>;
  }
}

/**
 * 使用 navigator.sendBeacon 发送离线通知
 * 这种方法更可靠，能确保在页面关闭时数据能发送出去
 */
function sendOfflineBeacon(): void {
  const isLoggedIn = !!localStorage.getItem('token');
  const userInfoStr = localStorage.getItem('userInfo');
  let userId = null;
  let userType: 'member' | 'guest' = 'guest';
  
  if (isLoggedIn && userInfoStr) {
    try {
      const userInfo = JSON.parse(userInfoStr);
      userId = userInfo.id;
      userType = 'member';
    } catch (error) {
      console.error('解析用户信息失败:', error);
    }
  }
  
  const data: HeartbeatData = {
    userId,
    userType,
    timestamp: Date.now()
  };
  
  // 使用 sendBeacon API 发送数据
  try {
    navigator.sendBeacon('/web/offline', JSON.stringify(data));
  } catch (error) {
    console.error('使用Beacon发送离线通知失败:', error);
  }
}

/**
 * 获取浏览器信息
 */
function getBrowserInfo(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox';
  } else if (userAgent.indexOf('Chrome') > -1) {
    return 'Chrome';
  } else if (userAgent.indexOf('Safari') > -1) {
    return 'Safari';
  } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
    return 'IE';
  } else if (userAgent.indexOf('Edge') > -1) {
    return 'Edge';
  } else {
    return 'Unknown';
  }
}

/**
 * 获取操作系统信息
 */
function getOSInfo(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf('Windows') > -1) {
    return 'Windows';
  } else if (userAgent.indexOf('Mac') > -1) {
    return 'MacOS';
  } else if (userAgent.indexOf('Linux') > -1) {
    return 'Linux';
  } else if (userAgent.indexOf('Android') > -1) {
    return 'Android';
  } else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
    return 'iOS';
  } else {
    return 'Unknown';
  }
}

/**
 * 获取设备类型信息
 */
function getDeviceInfo(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf('Mobile') > -1) {
    return 'Mobile';
  } else if (userAgent.indexOf('Tablet') > -1 || userAgent.indexOf('iPad') > -1) {
    return 'Tablet';
  } else {
    return 'Desktop';
  }
}

/**
 * 设置心跳机制
 * @param interval 心跳间隔时间（毫秒），默认为30秒
 * @returns 心跳计时器ID
 */
function setupHeartbeat(interval: number = 30000): number {
  let consecutiveFailures = 0; // 连续失败计数
  const maxConsecutiveFailures = 5; // 最大连续失败次数
  
  // 用于存储定时器ID
  let heartbeatTimer: number;
  
  // 发送心跳的函数
  const sendHeartbeat = async () => {
    try {
      const result = await SEND_HEARTBEAT_API();
      if (result.code === 200) {
        consecutiveFailures = 0; // 重置失败计数
        console.log('心跳发送成功');
      } else {
        consecutiveFailures++;
        console.warn(`心跳发送失败(${consecutiveFailures}/${maxConsecutiveFailures}):`, result.message);
      }
    } catch (error) {
      consecutiveFailures++;
      console.error(`心跳发送异常(${consecutiveFailures}/${maxConsecutiveFailures}):`, error);
      
      // 如果连续失败次数达到最大值，暂停心跳一段时间后重试
      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.warn(`心跳连续失败${maxConsecutiveFailures}次，暂停2分钟后重试`);
        // 暂停当前心跳
        clearInterval(heartbeatTimer);
        // 2分钟后重启心跳
        setTimeout(() => {
          consecutiveFailures = 0;
          heartbeatTimer = window.setInterval(sendHeartbeat, interval);
          console.log('心跳服务已重启');
        }, 120000);
      }
    }
  };
  
  // 首次发送心跳
  sendHeartbeat().catch(error => {
    console.error('初始心跳发送失败:', error);
  });
  
  // 设置定时发送心跳
  heartbeatTimer = window.setInterval(sendHeartbeat, interval);
  
  // 监听页面可见性变化
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // 页面变为可见时，立即发送一次心跳
      sendHeartbeat().catch(error => {
        console.error('页面可见时发送心跳失败:', error);
      });
    }
  });
  
  // 监听页面关闭事件
  window.addEventListener('beforeunload', () => {
    // 使用 sendBeacon 发送离线状态
    sendOfflineBeacon();
    
    // 清除心跳定时器
    clearInterval(heartbeatTimer);
  });
  
  return heartbeatTimer;
}

export default {
  SEND_HEARTBEAT_API,
  SEND_OFFLINE_API,
  sendOfflineBeacon,
  setupHeartbeat
} 