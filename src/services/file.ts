import COS from 'cos-js-sdk-v5';
import type { Result } from '@/model/result';
import request from '@/utils/request';

// COS 配置
// @ts-ignore
const cos = new COS({
  getAuthorization: async (_options: any, callback: any) => {
    try {
      // 获取临时密钥
      const res = await request({
        url: '/file/cos/credentials',
        method: 'get'
      }) as Result<COSCredentials>;

      if (res.code === 200 && res.data) {
        const credentials = res.data.credentials;
        callback({
          TmpSecretId: credentials.tmpSecretId,
          TmpSecretKey: credentials.tmpSecretKey,
          SecurityToken: credentials.sessionToken,
          StartTime: res.data.startTime,
          ExpiredTime: res.data.expiredTime,
        });
      } else {
        console.error('获取 COS 临时密钥失败');
      }
    } catch (error) {
      console.error('获取 COS 临时密钥出错:', error);
    }
  },
  Protocol: 'https:',
  UseAcceleration: true,
  ForcePathStyle: false,
  SystemClockOffset: 0,
  UploadCheckContentMd5: true,
  Headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': '*'
  }
} as any);

// COS 配置参数
const COS_CONFIG = {
  Bucket: 'euan-1306554881',
  Region: 'ap-chengdu',
  Domain: 'euan-1306554881.cos.ap-chengdu.myqcloud.com',
  BaseDir: 'bester' // 基础目录
};

/**
 * 文件上传响应类型
 */
interface UploadResponse {
  url: string;          // 文件访问地址
  key: string;         // 文件在 COS 中的唯一标识
  size: number;        // 文件大小（字节）
  mimeType: string;    // 文件类型
}

/**
 * 获取临时密钥响应类型
 */
interface COSCredentials {
  credentials: {
    sessionToken: string;    // 临时 token
    tmpSecretId: string;     // 临时密钥 ID
    tmpSecretKey: string;    // 临时密钥 Key
  };
  expiredTime: number;       // 密钥过期时间
  startTime: number;         // 密钥开始时间
}

/**
 * 生成文件访问URL
 * @param key 文件key
 * @returns 完整的访问URL
 */
const generateFileUrl = (key: string): string => {
  const url = `https://${COS_CONFIG.Domain}/${key}`;
  console.log('生成的文件URL:', url);
  return url;
};

/**
 * 生成唯一的文件名
 * @param file 文件对象
 * @param type 文件类型（image/video/document）
 * @returns 文件名
 */
const generateUniqueFileName = (file: File, type: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const ext = file.name.split('.').pop();
  return `${COS_CONFIG.BaseDir}/${type}/${timestamp}-${random}.${ext}`;
};

/**
 * 生成带签名的临时访问URL
 * @param key 文件key
 * @returns Promise<string> 临时访问URL
 */
const generateSignedUrl = (key: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    cos.getObjectUrl({
      Bucket: COS_CONFIG.Bucket,
      Region: COS_CONFIG.Region,
      Key: key,
      Sign: true,
      Expires: 7200, // 签名有效期2小时
    }, (err, data) => {
      if (err) {
        console.error('获取签名URL失败:', err);
        reject(err);
      } else {
        resolve(data.Url);
      }
    });
  });
};

/**
 * 上传文件到 COS
 * @param file 要上传的文件
 * @param type 文件类型（image/video/document）
 * @returns 上传结果
 */
const UPLOAD_FILE_API = (file: File, type: 'image' | 'video' | 'document'): Promise<Result<UploadResponse>> => {
  return new Promise(async (resolve, reject) => {
    const key = generateUniqueFileName(file, type);
    console.log('生成的文件key:', key);

    try {
      const uploadResult = await new Promise((uploadResolve, uploadReject) => {
        cos.putObject({
          Bucket: COS_CONFIG.Bucket,
          Region: COS_CONFIG.Region,
          Key: key,
          Body: file,
          onProgress: (progressData) => {
            console.log('上传进度:', JSON.stringify(progressData));
          }
        }, (err, data) => {
          if (err) {
            uploadReject(err);
          } else {
            uploadResolve(data);
          }
        });
      });

      console.log('上传成功，返回数据:', uploadResult);
      
      // 获取带签名的访问URL
      const signedUrl = await generateSignedUrl(key);
      console.log('生成的签名URL:', signedUrl);

      const response = {
        code: 200,
        message: '上传成功',
        data: {
          url: signedUrl,
          key: key,
          size: file.size,
          mimeType: file.type
        }
      };
      console.log('返回给前端的数据:', response);
      resolve(response);
    } catch (error) {
      console.error('上传或生成签名URL失败:', error);
      reject({
        code: 500,
        message: '上传失败',
        data: error
      });
    }
  });
};

/**
 * 批量上传文件
 * @param files 文件列表
 * @param type 文件类型
 * @returns 上传结果列表
 */
const BATCH_UPLOAD_FILES_API = async (files: File[], type: 'image' | 'video' | 'document'): Promise<Result<UploadResponse[]>> => {
  try {
    const uploadPromises = files.map(file => UPLOAD_FILE_API(file, type));
    const results = await Promise.all(uploadPromises);
    
    // 过滤出成功的上传结果
    const successResults = results.filter(result => result.code === 200).map(result => result.data);
    
    return {
      code: 200,
      message: '批量上传成功',
      data: successResults
    };
  } catch (error) {
    return {
      code: 500,
      message: '批量上传失败',
      data: []
    };
  }
};

/**
 * 从 COS 删除文件
 * @param key 文件在 COS 中的唯一标识
 * @returns 删除结果
 */
const DELETE_FILE_API = (key: string): Promise<Result<null>> => {
  return new Promise((resolve, reject) => {
    cos.deleteObject({
      Bucket: COS_CONFIG.Bucket,
      Region: COS_CONFIG.Region,
      Key: key
    }, (err, data) => {
      console.log('删除文件:', err, data);
      if (err) {
        reject({
          code: 500,
          message: '删除失败',
          data: err
        });
      } else {
        resolve({
          code: 200,
          message: '删除成功',
          data: null
        });
      }
    });
  });
};

/**
 * 批量删除文件
 * @param keys 文件key列表
 * @returns 删除结果
 */
const BATCH_DELETE_FILES_API = async (keys: string[]): Promise<Result<null>> => {
  try {
    const deletePromises = keys.map(key => DELETE_FILE_API(key));
    await Promise.all(deletePromises);
    
    return {
      code: 200,
      message: '批量删除成功',
      data: null
    };
  } catch (error) {
    return {
      code: 500,
      message: '批量删除失败',
      data: null
    };
  }
};

/**
 * 获取文件临时访问链接
 * @param key 文件在 COS 中的唯一标识
 * @param expires 链接有效期（秒），默认3600秒
 * @returns 临时访问链接
 */
const GET_FILE_TEMP_URL_API = (key: string, expires: number = 3600): Promise<Result<string>> => {
  return new Promise((resolve, reject) => {
    cos.getObjectUrl({
      Bucket: COS_CONFIG.Bucket,
      Region: COS_CONFIG.Region,
      Key: key,
      Sign: true,
      Expires: expires
    }, (err, data) => {
      if (err) {
        reject({
          code: 500,
          message: '获取临时链接失败',
          data: err
        });
      } else {
        resolve({
          code: 200,
          message: '获取临时链接成功',
          data: data.Url
        });
      }
    });
  });
};

/**
 * 检查文件是否存在
 * @param key 文件在 COS 中的唯一标识
 * @returns 文件是否存在
 */
const CHECK_FILE_EXISTS_API = (key: string): Promise<Result<boolean>> => {
  return new Promise((resolve, reject) => {
    cos.headObject({
      Bucket: COS_CONFIG.Bucket,
      Region: COS_CONFIG.Region,
      Key: key
    }, (err, data) => {
      console.log('检查文件是否存在:', err, data);
      if (err) {
        // 如果是文件不存在的错误
        if (err.statusCode === 404) {
          resolve({
            code: 200,
            message: '文件不存在',
            data: false
          });
        } else {
          reject({
            code: 500,
            message: '检查文件失败',
            data: err
          });
        }
      } else {
        resolve({
          code: 200,
          message: '文件存在',
          data: true
        });
      }
    });
  });
};

// 命名导出
export {
    generateSignedUrl,
    generateFileUrl
};

// 默认导出
export default {
    UPLOAD_FILE_API,
    BATCH_UPLOAD_FILES_API,
    DELETE_FILE_API,
    BATCH_DELETE_FILES_API,
    GET_FILE_TEMP_URL_API,
    CHECK_FILE_EXISTS_API,
    generateSignedUrl,
    generateFileUrl
}; 