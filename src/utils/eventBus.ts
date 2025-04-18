// 简单的事件总线实现
const eventBus = {
  events: {} as Record<string, Function[]>,
  
  // 注册事件监听
  on(eventName: string, callback: Function) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  },
  
  // 触发事件
  emit(eventName: string, data?: any) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => {
        callback(data);
      });
    }
  },
  
  // 移除事件监听
  off(eventName: string, callback?: Function) {
    if (!callback) {
      // 如果没有提供回调函数，删除该事件的所有监听器
      delete this.events[eventName];
    } else if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(
        cb => cb !== callback
      );
    }
  }
};

export default eventBus; 