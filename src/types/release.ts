// 模块信息接口
export interface ModuleInfo {
  plateId: number;    // 修改为 plateId
  name: string;      // 模块名称
  icon: string;      // 模块图标
  count: string;     // 计数
  topics: string;    // 主题数
  posts: string;     // 帖子数
  lastPost: string;  // 最后发帖
  path: string | null; // 路径
}

// 模块分类数据接口
export interface CategoryData {
  title: string;
  plateInfos: ModuleInfo[];
}

// 发布帖子数据接口
export interface PostData {
  title: string;
  content: string;
  images: string[];
  timing: boolean;
  publishTime?: number;
  plateId: number;
} 