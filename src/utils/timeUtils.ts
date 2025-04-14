/**
 * 将毫秒转换为可读的时间格式
 * 根据时长自动判断显示的单位（年、月、日、时、分、秒）
 * 
 * @param {number} milliseconds - 需要转换的毫秒数
 * @returns {string} - 格式化后的时间字符串
 */
export function formatRunningTime(milliseconds: number): string {
    if (milliseconds < 0) {
        return '0秒';
    }

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const month = day * 30; // 近似值
    const year = day * 365; // 近似值

    // 计算各个时间单位
    const years = Math.floor(milliseconds / year);
    const months = Math.floor((milliseconds % year) / month);
    const days = Math.floor((milliseconds % month) / day);
    const hours = Math.floor((milliseconds % day) / hour);
    const minutes = Math.floor((milliseconds % hour) / minute);
    const seconds = Math.floor((milliseconds % minute) / second);

    // 构建结果字符串
    let result = '';

    if (years > 0) {
        result += `${years}年`;
    }
    
    if (months > 0 || (years > 0 && days > 0)) {
        result += `${months}月`;
    }
    
    if (days > 0 || ((years > 0 || months > 0) && hours > 0)) {
        result += `${days}天`;
    }
    
    if (hours > 0 || ((years > 0 || months > 0 || days > 0) && minutes > 0)) {
        result += `${hours}小时`;
    }
    
    if (minutes > 0 || ((years > 0 || months > 0 || days > 0 || hours > 0) && seconds > 0)) {
        result += `${minutes}分钟`;
    }
    
    if (years === 0 && months === 0 && days === 0 && hours === 0 && minutes === 0 || seconds > 0) {
        result += `${seconds}秒`;
    }

    return result;
} 