import { Client, IMessage, StompSubscription } from '@stomp/stompjs';

type MessageListener = (data: any) => void;
type WebSocketMessage = {
    type: string;
    content: string;
    [key: string]: any;
};

class WebSocketService {
    private client: Client | null = null;
    private messageListeners: MessageListener[] = [];
    private subscription: StompSubscription | null = null;

    constructor() {
        this.client = null;
        this.messageListeners = [];
        this.subscription = null;
    }

    connect(url: string): void {
        if (!this.client || !this.client.connected) {
            this.client = new Client({
                brokerURL: url,
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: () => {
                    console.log('STOMP连接成功');
                    this.subscribe('/topic/messages');
                },
                onDisconnect: () => {
                    console.log('STOMP断开连接');
                },
                onStompError: (frame) => {
                    console.error('STOMP错误:', frame);
                }
            });

            this.client.activate();
        }
    }

    private subscribe(destination: string): void {
        if (this.client && this.client.connected) {
            this.subscription = this.client.subscribe(destination, (message: IMessage) => {
                try {
                    const data = JSON.parse(message.body);
                    this.messageListeners.forEach(callback => callback(data));
                } catch (e) {
                    console.error('消息解析错误:', e);
                    this.messageListeners.forEach(callback => callback(message.body));
                }
            });
        }
    }

    sendMessage(message: WebSocketMessage): void {
        if (this.client && this.client.connected) {
            this.client.publish({
                destination: '/app/chat',
                body: JSON.stringify(message)
            });
        } else {
            console.warn('STOMP客户端未连接，无法发送消息');
        }
    }

    addMessageListener(callback: MessageListener): void {
        this.messageListeners.push(callback);
    }

    disconnect(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
            this.subscription = null;
        }
        
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
    }
}

export const webSocketService = new WebSocketService();