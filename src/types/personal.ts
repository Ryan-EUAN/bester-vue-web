// 定义通用响应类型
export interface ApiResponse<T> {
    code: number;
    data: T;
    message: string;
}

// 个人资料接口
export interface ProfileForm {
    username: string;
    realName: string;
    gender: 'male' | 'female';
    birthday: string | null;
    birthplace: string[];
    residence: string[];
    phone: string;
    qq: string;
    email: string;
    signature: string;
}

// 个人资料数据类型 - 从服务层移过来的定义
export interface ProfileData {
    username: string;    // 用户名
    realName: string;    // 真实姓名
    nickName: string;    // 昵称
    gender: 1 | 0;       // 性别(1:男, 0:女)
    birthday: string | null;  // 生日日期，格式为YYYY-MM-DD
    birthplace: string[];     // 出生地，包含省市区的数组
    residence: string[];      // 居住地，包含省市区的数组
    phone: string;       // 手机号码
    qq: string;         // QQ号码
    email: string;      // 电子邮箱
    signature: string;  // 个性签名
}

// 认证信息接口
export interface VerifyForm {
    phone: string;           // 手机号
    phoneVerified: boolean;  // 手机是否已认证
    realName: string;        // 真实姓名
    idCard: string;         // 身份证号
    identityVerified: boolean; // 是否已实名认证
}

// 积分信息接口
export interface PointsInfo {
    current: number;    // 当前积分
    total: number;     // 累计获得
    used: number;      // 已使用
}

// 积分记录接口
export interface PointsRecord {
    id: string;        // 记录ID
    time: string;      // 时间
    type: string;      // 类型
    points: number;    // 积分变动
    remark: string;    // 备注
}

// 积分规则接口
export interface PointsRule {
    id: string;        // 规则ID
    title: string;     // 规则标题
    content: string;   // 规则内容
    points: number;    // 可获得积分
}

// 提现表单接口
export interface WithdrawForm {
    amount: number;
    method: 'alipay' | 'wechat' | 'bank';
    account: string;
}

// 充值表单接口
export interface RechargeForm {
    amount: number;
    method: 'alipay' | 'wechat';
}

// 隐私设置接口
export interface PrivacySettings {
    profileVisible: 'public' | 'friends' | 'private';
    phoneVisible: boolean;
    emailVisible: boolean;
    birthdayVisible: boolean;
    locationVisible: boolean;
}

// 安全设置接口
export interface SecurityForm {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
} 