import http from '@/utils/request';
import type { Result } from '@/model/result';
import type {
    WithdrawForm,
    RechargeForm,
} from '@/types/personal';


// 个人资料数据类型
interface ProfileData {
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

// 添加认证表单接口定义
interface VerifyForm {
    phone: string;           // 手机号
    phoneVerified: boolean;  // 手机是否已认证
    realName: string;        // 真实姓名
    idCard: string;         // 身份证号
    identityVerified: boolean; // 是否已实名认证
}

// 积分相关接口定义
interface PointsInfo {
    current: number;    // 当前积分
    total: number;     // 累计获得
    used: number;      // 已使用
}

interface PointsRecord {
    id: string;        // 记录ID
    time: string;      // 时间
    type: string;      // 类型
    points: number;    // 积分变动
    remark: string;    // 备注
}

interface PointsRule {
    id: string;        // 规则ID
    title: string;     // 规则标题
    content: string;   // 规则内容
    points: number;    // 可获得积分
}

/**
 * 获取用户个人资料
 * @returns 返回用户的详细个人信息，包括用户名、真实姓名、昵称等基本信息
 */
async function GET_PROFILE_API(): Promise<Result<ProfileData>> {
    return await http({
        url: '/user/profile',
        method: 'GET'
    }) as Result<ProfileData>
}

/**
 * 更新用户个人资料
 * @param data 需要更新的个人资料信息
 * @returns 更新结果
 */
async function UPDATE_PROFILE_API(data: ProfileData): Promise<Result<null>> {
    return await http({
        url: '/user/profile',
        method: 'PUT',
        data
    }) as Result<null>
}

/**
 * 获取用户认证信息
 * @returns 返回用户的认证状态，包括手机认证和身份认证的信息
 */
async function GET_VERIFY_INFO_API(): Promise<Result<VerifyForm>> {
    return await http({
        url: '/user/verify',
        method: 'GET'
    }) as Result<VerifyForm>
}

/**
 * 发送手机验证码
 * @param phone 手机号码
 * @returns 发送验证码的结果
 */
async function SEND_VERIFY_CODE_API(phone: string): Promise<Result<null>> {
    return await http({
        url: '/user/verify/code',
        method: 'POST',
        data: { phone }
    }) as Result<null>
}

/**
 * 验证手机号码
 * @param data 包含手机号和验证码的对象
 * @returns 手机验证的结果
 */
async function VERIFY_PHONE_API(data: { phone: string; code: string }): Promise<Result<null>> {
    return await http({
        url: '/user/verify/phone',
        method: 'POST',
        data
    }) as Result<null>
}

/**
 * 实名认证
 * @param data 包含真实姓名和身份证号的对象
 * @returns 实名认证的结果
 */
async function VERIFY_IDENTITY_API(data: { realName: string; idCard: string }): Promise<Result<null>> {
    return await http({
        url: '/user/verify/identity',
        method: 'POST',
        data
    }) as Result<null>
}

/**
 * 获取用户积分信息
 * @returns 返回用户的积分统计信息，包括当前积分、累计获得和已使用积分
 */
async function GET_POINTS_INFO_API(): Promise<Result<PointsInfo>> {
    return await http({
        url: '/user/points',
        method: 'GET'
    }) as Result<PointsInfo>
}

/**
 * 获取积分记录列表
 * @param params 分页参数，包含页码和每页数量
 * @returns 返回分页的积分变动记录和总记录数
 */
async function GET_POINTS_RECORDS_API(params: { page: number; size: number }): Promise<Result<{
    records: PointsRecord[];
    total: number;
}>> {
    return await http({
        url: '/user/points/records',
        method: 'GET',
        params
    }) as Result<{ records: PointsRecord[]; total: number; }>
}

/**
 * 获取积分规则列表
 * @returns 返回所有积分规则信息
 */
async function GET_POINTS_RULES_API(): Promise<Result<PointsRule[]>> {
    return await http({
        url: '/user/points/rules',
        method: 'GET'
    }) as Result<PointsRule[]>
}

/**
 * 积分提现
 * @param data 提现表单数据
 * @returns 提现操作的结果
 */
async function WITHDRAW_POINTS_API(data: WithdrawForm): Promise<Result<null>> {
    return await http({
        url: '/user/points/withdraw',
        method: 'POST',
        data
    }) as Result<null>
}

/**
 * 积分充值
 * @param data 充值表单数据
 * @returns 充值操作的结果
 */
async function RECHARGE_POINTS_API(data: RechargeForm): Promise<Result<null>> {
    return await http({
        url: '/user/points/recharge',
        method: 'POST',
        data
    }) as Result<null>
}

// 更新导出
export default {
    GET_PROFILE_API,
    UPDATE_PROFILE_API,
    GET_VERIFY_INFO_API,
    SEND_VERIFY_CODE_API,
    VERIFY_PHONE_API,
    VERIFY_IDENTITY_API,
    GET_POINTS_INFO_API,
    GET_POINTS_RECORDS_API,
    GET_POINTS_RULES_API,
    WITHDRAW_POINTS_API,
    RECHARGE_POINTS_API
}; 