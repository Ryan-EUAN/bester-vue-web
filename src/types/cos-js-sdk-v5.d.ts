declare module 'cos-js-sdk-v5' {
  interface ProgressData {
    loaded: number;    // 已上传的字节数
    total: number;     // 总字节数
    speed: number;     // 上传速度
    percent: number;   // 上传进度百分比
  }

  interface COSError {
    statusCode: number;
    code: string;
    message: string;
  }

  interface COSResult {
    Location: string;
    statusCode: number;
    headers: Record<string, string>;
  }

  interface COSOptions {
    getAuthorization: (
      options: {
        Method: string;
        Key?: string;
        Pathname?: string;
      },
      callback: (credentials: {
        TmpSecretId: string;
        TmpSecretKey: string;
        SecurityToken: string;
        StartTime: number;
        ExpiredTime: number;
      }) => void
    ) => void;
  }

  interface PutObjectParams {
    Bucket: string;
    Region: string;
    Key: string;
    Body: File;
    onProgress?: (progressData: ProgressData) => void;
  }

  interface DeleteObjectParams {
    Bucket: string;
    Region: string;
    Key: string;
  }

  interface GetObjectUrlParams {
    Bucket: string;
    Region: string;
    Key: string;
    Sign?: boolean;
    Expires?: number;
  }

  interface GetObjectUrlResult extends COSResult {
    Url: string;
  }

  class COS {
    constructor(options: COSOptions);
    putObject(params: PutObjectParams, callback: (err: COSError | null, data: COSResult) => void): void;
    deleteObject(params: DeleteObjectParams, callback: (err: COSError | null, data: COSResult) => void): void;
    getObjectUrl(params: GetObjectUrlParams, callback: (err: COSError | null, data: GetObjectUrlResult) => void): void;
    headObject(params: DeleteObjectParams, callback: (err: COSError | null, data: COSResult) => void): void;
  }

  export default COS;
} 