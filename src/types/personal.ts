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

// 认证信息接口
export interface VerifyForm {
    phone: string;
    phoneVerified: boolean;
    realName: string;
    idCard: string;
    identityVerified: boolean;
}

// 积分信息接口
export interface PointsInfo {
    current: number;
    total: number;
    used: number;
}

// 积分记录接口
export interface PointsRecord {
    id: string;
    time: string;
    type: string;
    points: number;
    remark: string;
}

// 积分规则接口
export interface PointsRule {
    id: string;
    title: string;
    content: string;
    points: number;
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