import { ElNotification } from 'element-plus';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

type MessageListener = (data: any) => void;
type WebSocketMessage = {
    type: string;
    content: string;
    [key: string]: any;
};

class WebSocketService {
    private stompClient: any = null;
    private messageListeners: MessageListener[] = [];
    private connected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectTimeout: number | null = null;
    private debugMode: boolean = false;
    private url: string = '';

    /**
     * 初始化WebSocket服务
     * @param debug 是否开启调试模式
     */
    constructor(debug: boolean = false) {
        this.debugMode = debug;
    }

    /**
     * 连接到WebSocket服务器
     * @param url WebSocket服务器地址
     * @param headers 连接头信息
     * @returns Promise<boolean> 连接是否成功
     */
    connect(url: string, headers: any = {}): Promise<boolean> {
        this.url = url;
        return new Promise((resolve, reject) => {
            try {
                // 如果已经连接，先断开
                if (this.stompClient && this.connected) {
                    this.disconnect();
                }

                const socket = new SockJS(url);
                this.stompClient = Stomp.over(socket);

                // 完全禁用STOMP调试输出
                this.stompClient.debug = null;

                // 连接服务器
                this.stompClient.connect(
                    headers,
                    (frame: any) => {
                        this.connected = true;
                        this.reconnectAttempts = 0;
                        console.log('WebSocket连接成功');
                        this.subscribeToTopics();
                        resolve(true);
                    },
                    (error: any) => {
                        console.error('WebSocket连接错误:', error);
                        this.connected = false;
                        this.handleReconnect();
                        reject(error);
                    }
                );
            } catch (err) {
                console.error('WebSocket初始化错误:', err);
                this.connected = false;
                reject(err);
            }
        });
    }

    /**
     * 订阅消息主题
     * @private
     */
    private subscribeToTopics(): void {
        if (!this.stompClient || !this.connected) return;

        // 订阅主题
        this.stompClient.subscribe('/topic/messages', (response: any) => {
            try {
                const message = JSON.parse(response.body);
                console.log('收到消息:', message);
                ElNotification({
                    title: message.type,
                    message: message.content,
                    type: 'success'
                });
                // 通知所有监听器
                this.notifyListeners(message);
            } catch (e) {
                console.error('解析消息错误:', e);
                // 如果解析失败，传递原始消息
                this.notifyListeners(response.body);
            }
        });
    }

    /**
     * 通知所有消息监听器
     * @param message 收到的消息
     * @private
     */
    private notifyListeners(message: any): void {
        this.messageListeners.forEach(listener => {
            try {
                listener(message);
            } catch (e) {
                console.error('消息监听器错误:', e);
            }
        });
    }

    /**
     * 处理WebSocket重连
     * @private
     */
    private handleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.warn('WebSocket重连失败，已达最大重试次数');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(30000, Math.pow(2, this.reconnectAttempts) * 1000);

        console.log(`WebSocket将在${delay / 1000}秒后尝试重新连接，第${this.reconnectAttempts}次重试`);

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        this.reconnectTimeout = window.setTimeout(() => {
            console.log('WebSocket尝试重新连接...');
            this.reconnect();
        }, delay);
    }

    /**
     * 重新连接WebSocket
     * @private
     */
    private reconnect(): void {
        if (this.stompClient) {
            this.disconnect();
            // 重新连接到默认地址
            this.connect(this.url == '' ? 'http://139.159.243.123/ws' : this.url)
                .catch(() => {
                    // 连接失败会自动触发handleReconnect
                });
        }
    }

    /**
     * 发送消息到WebSocket服务器
     * @param message 要发送的消息对象或内容
     * @param destination 消息目的地
     * @returns boolean 是否成功发送
     */
    sendMessage(message: WebSocketMessage, destination: string = '/app/sendMessage'): boolean {
        if (!this.stompClient || !this.connected) {
            console.warn('WebSocket未连接，无法发送消息');
            return false;
        }

        try {
            this.stompClient.send(destination, {}, JSON.stringify(message));

            if (this.debugMode) {
                console.log('消息已发送:', message);
            }
            return true;
        } catch (e) {
            console.error('发送消息错误:', e);
            return false;
        }
    }

    /**
     * 添加消息监听器
     * @param listener 消息监听回调函数
     */
    addMessageListener(listener: MessageListener): void {
        if (typeof listener === 'function') {
            this.messageListeners.push(listener);
        }
    }

    /**
     * 移除消息监听器
     * @param listener 要移除的监听器函数
     */
    removeMessageListener(listener: MessageListener): void {
        const index = this.messageListeners.indexOf(listener);
        if (index !== -1) {
            this.messageListeners.splice(index, 1);
        }
    }

    /**
     * 断开WebSocket连接
     */
    disconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        if (this.stompClient && this.connected) {
            this.stompClient.disconnect(() => {
                console.log('WebSocket已断开连接');
            });
            this.connected = false;
        }
    }

    /**
     * 获取连接状态
     * @returns boolean 当前连接状态
     */
    getConnectionStatus(): boolean {
        return this.connected;
    }
}

// 创建单例实例
export const webSocketService = new WebSocketService(true);