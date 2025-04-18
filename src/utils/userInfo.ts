/**
 * 用户信息工具类
 * 提供用户登录状态判断和用户信息获取功能
 */
class UserInfoUtil {
    /**
     * 判断用户是否已登录
     * @returns {boolean} 是否已登录
     */
    static isLoggedIn(): boolean {
        const token = localStorage.getItem('token');
        return !!token;
    }

    /**
     * 获取当前登录用户信息
     * @returns {any|null} 用户信息对象，未登录时返回null
     */
    static getUserInfo(): any | null {
        if (!this.isLoggedIn()) {
            return null;
        }

        try {
            const userInfoStr = localStorage.getItem('userInfo');
            if (!userInfoStr) {
                return null;
            }
            return JSON.parse(userInfoStr);
        } catch (error) {
            console.error('解析用户信息失败:', error);
            return null;
        }
    }

    /**
     * 获取用户ID
     * @returns {number|null} 用户ID，未登录时返回null
     */
    static getUserId(): number | null {
        const userInfo = this.getUserInfo();
        return userInfo ? userInfo.id : null;
    }

    /**
     * 获取用户名
     * @returns {string|null} 用户名，未登录时返回null
     */
    static getUsername(): string | null {
        const userInfo = this.getUserInfo();
        return userInfo ? userInfo.username : null;
    }
    /**
     * 用户退出登录
     * 清除本地存储的用户信息和令牌
     */
    static logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        // 可以在这里添加其他需要清除的用户相关数据
    }

    /**
     * 更新用户信息
     * @param {any} userInfo 新的用户信息对象
     * @returns {boolean} 更新是否成功
     */
    static updateUserInfo(userInfo: any): boolean {
        try {
            if (!userInfo) {
                return false;
            }

            // 将新的用户信息保存到本地存储
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            return true;
        } catch (error) {
            console.error('更新用户信息失败:', error);
            return false;
        }
    }

    /**
     * 增加用户帖子数量
     * @returns {boolean} 操作是否成功
     */
    static addPostCount(): boolean {
        try {
            const userInfo = this.getUserInfo();
            if (!userInfo) {
                return false;
            }

            userInfo.posts = (userInfo.posts || 0) + 1;
            return this.updateUserInfo(userInfo);
        } catch (error) {
            console.error('增加用户帖子数量失败:', error);
            return false;
        }
    }

    /**
     * 减少用户帖子数量
     * @returns {boolean} 操作是否成功
     */
    static subPostCount(): boolean {
        try {
            const userInfo = this.getUserInfo();
            if (!userInfo || !userInfo.posts || userInfo.posts <= 0) {
                return false;
            }

            userInfo.posts -= 1;
            return this.updateUserInfo(userInfo);
        } catch (error) {
            console.error('减少用户帖子数量失败:', error);
            return false;
        }
    }

    /**
     * 增加用户粉丝数量
     * @returns {boolean} 操作是否成功
     */
    static addFollowerCount(): boolean {
        try {
            const userInfo = this.getUserInfo();
            if (!userInfo) {
                return false;
            }

            userInfo.followers = (userInfo.followers || 0) + 1;
            return this.updateUserInfo(userInfo);
        } catch (error) {
            console.error('增加用户粉丝数量失败:', error);
            return false;
        }
    }

    /**
     * 减少用户粉丝数量
     * @returns {boolean} 操作是否成功
     */
    static subFollowerCount(): boolean {
        try {
            const userInfo = this.getUserInfo();
            if (!userInfo || !userInfo.followers || userInfo.followers <= 0) {
                return false;
            }

            userInfo.followers -= 1;
            return this.updateUserInfo(userInfo);
        } catch (error) {
            console.error('减少用户粉丝数量失败:', error);
            return false;
        }
    }

    /**
     * 增加用户关注数量
     * @returns {boolean} 操作是否成功
     */
    static addFollowingCount(): boolean {
        try {
            const userInfo = this.getUserInfo();
            if (!userInfo) {
                return false;
            }

            userInfo.following = (userInfo.following || 0) + 1;
            return this.updateUserInfo(userInfo);
        } catch (error) {
            console.error('增加用户关注数量失败:', error);
            return false;
        }
    }

    /**
     * 减少用户关注数量
     * @returns {boolean} 操作是否成功
     */
    static subFollowingCount(): boolean {
        try {
            const userInfo = this.getUserInfo();
            if (!userInfo || !userInfo.following || userInfo.following <= 0) {
                return false;
            }

            userInfo.following -= 1;
            return this.updateUserInfo(userInfo);
        } catch (error) {
            console.error('减少用户关注数量失败:', error);
            return false;
        }
    }
}

export default UserInfoUtil;