/**
 * COS 临时密钥凭证
 */
export interface Credentials {
    tmpSecretId: string;
    tmpSecretKey: string;
    sessionToken: string;
    signature?: string;
}

/**
 * COS 临时密钥响应
 */
export interface COSCredentials {
    credentials: Credentials;
    startTime: number;
    expiredTime: number;
    requestId?: string;
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
    url: string;          // 文件访问地址
    key: string;         // 文件在 COS 中的唯一标识
    size: number;        // 文件大小（字节）
    mimeType: string;    // 文件类型
} 