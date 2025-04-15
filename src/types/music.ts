/**
 * 音乐列表项接口
 */
export interface MusicItem {
    id: string;                   // 音乐ID
    title: string;                // 音乐标题
    artist: string;               // 艺术家
    cover: string;                // 封面图片URL
    url: string;                  // 音乐文件URL
    duration: number;             // 时长（秒）
    playCount: number;            // 播放次数
    categoryId: string;           // 分类ID
    categoryName: string;         // 分类名称
    publishTime: string;          // 发布时间
    description?: string;         // 描述
    likeCount: number;            // 点赞数
    isFavorite?: boolean;         // 是否收藏
}

/**
 * 搜索结果VO接口
 */
export interface SearchVO {
    id: string;         // 歌曲ID
    name: string;       // 歌曲名称
    artist: string;     // 歌手名称
    album: string;      // 专辑名称
    pic_id: string;     // 歌曲图片ID
    type: string;       // 歌曲平台类型
}

/**
 * 音乐信息VO接口
 */
export interface MusicInfoVO {
    name: string;       // 歌曲昵称
    album: string;      // 专辑
    artist: string;     // 歌手
    picid: string;      // 封面ID
    url: string;        // 歌曲播放路径
    pic: string;        // 封面图片路径
    lrc: string;        // 歌词
}

/**
 * 歌单VO接口
 */
export interface MusicListVO {
    songId: string[];    // 歌曲ID列表
    songName: string[];  // 歌曲名称列表
    albumName: string[]; // 专辑名称列表
    artistName: string[]; // 歌手名称列表
}

/**
 * 音乐详情接口
 */
export interface MusicDetail extends MusicItem {
    lyrics?: string;             // 歌词
    albumName?: string;          // 专辑名称
    albumId?: string;            // 专辑ID
    comments?: MusicComment[];   // 评论列表
    relatedMusics?: MusicItem[]; // 相关音乐
    tags?: string[];             // 标签
}

/**
 * 音乐评论接口
 */
export interface MusicComment {
    id: string;                   // 评论ID
    content: string;              // 评论内容
    userId: string;               // 用户ID
    username: string;             // 用户名
    avatar: string;               // 用户头像
    createTime: string;           // 创建时间
    likeCount: number;            // 点赞数
    replyCount: number;           // 回复数
    replies?: MusicCommentReply[]; // 回复列表
}

/**
 * 音乐评论回复接口
 */
export interface MusicCommentReply {
    id: string;                   // 回复ID
    content: string;              // 回复内容
    userId: string;               // 用户ID
    username: string;             // 用户名
    avatar: string;               // 用户头像
    createTime: string;           // 创建时间
    likeCount: number;            // 点赞数
    replyUserId?: string;         // 回复目标用户ID
    replyUsername?: string;       // 回复目标用户名
}

/**
 * 音乐分类接口
 */
export interface MusicCategory {
    id: string;                   // 分类ID
    name: string;                 // 分类名称
    icon?: string;                // 分类图标
    count: number;                // 分类下的音乐数量
    description?: string;         // 分类描述
    parentId?: string;            // 父分类ID
}

/**
 * 音乐列表查询参数接口
 */
export interface MusicListParams {
    page?: number;                // 页码
    size?: number;                // 每页数量
    categoryId?: string;          // 分类ID
    keyword?: string;             // 关键词搜索
    orderBy?: 'latest' | 'hot' | 'recommend'; // 排序方式
    tags?: string[];              // 标签过滤
    artistId?: string;            // 艺术家ID
    albumId?: string;             // 专辑ID
    useExternalApi?: boolean;     // 是否使用外部API
} 