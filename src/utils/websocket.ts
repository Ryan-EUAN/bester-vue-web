type MessageListener = (data: any) => void;
type WebSocketMessage = {
    type: string;
    content: string;
    [key: string]: any;
};

class WebSocketService {
    private socket: WebSocket | null;
    private messageListeners: MessageListener[];

    constructor() {
        this.socket = null;
        this.messageListeners = [];
    }

    connect(url: string): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.socket = new WebSocket(url);

            // 监听事件
            this.socket.onopen = (): void => {
                console.log('WebSocket connected');
            };

            this.socket.onmessage = (event: MessageEvent): void => {
                this.messageListeners.forEach(callback => callback(event.data));
            };

            this.socket.onclose = (): void => {
                console.log('WebSocket disconnected');
            };
        }
    }

    sendMessage(message: WebSocketMessage): void {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        }
    }

    addMessageListener(callback: MessageListener): void {
        this.messageListeners.push(callback);
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}

export const webSocketService = new WebSocketService();