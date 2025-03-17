// 强制刷新组件的工具函数
export function forceComponentsRefresh() {
  // 创建一个特殊的事件，带有时间戳确保唯一性
  const refreshEvent = new CustomEvent('forceRefresh', {
    detail: { timestamp: new Date().getTime() }
  });
  
  // 分发事件
  window.dispatchEvent(refreshEvent);
} 