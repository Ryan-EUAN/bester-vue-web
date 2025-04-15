/**
 * 主题工具函数
 * 提供全局主题相关的操作方法
 */

/**
 * 获取当前主题
 * @returns 'dark' | 'light'
 */
export const getCurrentTheme = (): 'dark' | 'light' => {
  return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
};

/**
 * 设置全局主题
 * @param theme 'dark' | 'light'
 */
export const setTheme = (theme: 'dark' | 'light'): void => {
  localStorage.setItem('theme', theme);
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
    document.body.classList.add('dark-theme');
    
    // 针对特定UI库组件设置深色主题
    document.querySelectorAll('.ant-table, .el-table').forEach(table => {
      table.classList.add('dark-table');
    });
    
    document.querySelectorAll('.ant-list, .el-list').forEach(list => {
      list.classList.add('dark-list');
    });
    
    document.querySelectorAll('.ant-card, .el-card').forEach(card => {
      card.classList.add('dark-card');
    });
  } else {
    document.documentElement.classList.remove('dark-theme');
    document.body.classList.remove('dark-theme');
    
    // 移除特定UI库组件的深色主题
    document.querySelectorAll('.dark-table').forEach(table => {
      table.classList.remove('dark-table');
    });
    
    document.querySelectorAll('.dark-list').forEach(list => {
      list.classList.remove('dark-list');
    });
    
    document.querySelectorAll('.dark-card').forEach(card => {
      card.classList.remove('dark-card');
    });
  }
  
  // 分发主题变更事件
  window.dispatchEvent(new CustomEvent('themeChange', { 
    detail: { theme } 
  }));
};

/**
 * 切换主题
 */
export const toggleTheme = (): void => {
  const currentTheme = getCurrentTheme();
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
};

/**
 * 监听主题变化
 * @param callback 回调函数
 * @returns 移除监听器的函数
 */
export const onThemeChange = (callback: (theme: 'dark' | 'light') => void): () => void => {
  const handler = (event: CustomEvent) => {
    callback(event.detail.theme);
  };
  
  window.addEventListener('themeChange', handler as EventListener);
  
  // 返回移除监听器的函数
  return () => {
    window.removeEventListener('themeChange', handler as EventListener);
  };
};

/**
 * 初始化主题
 */
export const initTheme = (): void => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme as 'dark' | 'light');
  } else {
    // 如果没有保存的主题，则根据系统时间自动设置
    const currentHour = new Date().getHours();
    const defaultTheme = currentHour < 6 || currentHour >= 18 ? 'dark' : 'light'; // 晚6点到早6点为夜间模式
    setTheme(defaultTheme);
  }
};

/**
 * 应用主题到动态加载的组件
 * 可以在组件挂载后调用此方法确保主题正确应用
 */
export const applyThemeToNewComponents = (): void => {
  const currentTheme = getCurrentTheme();
  if (currentTheme === 'dark') {
    // 针对新加载的组件应用深色主题
    document.querySelectorAll('.ant-table:not(.dark-table), .el-table:not(.dark-table)').forEach(table => {
      table.classList.add('dark-table');
    });
    
    document.querySelectorAll('.ant-list:not(.dark-list), .el-list:not(.dark-list)').forEach(list => {
      list.classList.add('dark-list');
    });
    
    document.querySelectorAll('.ant-card:not(.dark-card), .el-card:not(.dark-card)').forEach(card => {
      card.classList.add('dark-card');
    });
  }
}; 