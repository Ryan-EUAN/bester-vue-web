<template>
    <div class="points-section">
        <a-tabs v-model:activeKey="activeKey">
            <!-- 我的积分 -->
            <a-tab-pane key="overview" tab="我的积分">
                <div class="points-overview">
                    <a-row :gutter="24">
                        <a-col :span="8">
                            <a-card>
                                <a-statistic 
                                    title="当前积分" 
                                    :value="pointsInfo.current"
                                    :value-style="{ color: '#3f8600' }"
                                >
                                    <template #prefix>
                                        <wallet-outlined />
                                    </template>
                                </a-statistic>
                            </a-card>
                        </a-col>
                        <a-col :span="8">
                            <a-card>
                                <a-statistic 
                                    title="累计获得" 
                                    :value="pointsInfo.total"
                                >
                                    <template #prefix>
                                        <trophy-outlined />
                                    </template>
                                </a-statistic>
                            </a-card>
                        </a-col>
                        <a-col :span="8">
                            <a-card>
                                <a-statistic 
                                    title="已使用" 
                                    :value="pointsInfo.used"
                                >
                                    <template #prefix>
                                        <shopping-outlined />
                                    </template>
                                </a-statistic>
                            </a-card>
                        </a-col>
                    </a-row>
                </div>
            </a-tab-pane>

            <!-- 积分记录 -->
            <a-tab-pane key="records" tab="积分记录">
                <a-table 
                    :columns="columns" 
                    :data-source="pointsRecords"
                    :pagination="pagination"
                    @change="handleTableChange"
                >
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'points'">
                            <span :style="{ color: record.points > 0 ? '#3f8600' : '#cf1322' }">
                                {{ record.points > 0 ? '+' : '' }}{{ record.points }}
                            </span>
                        </template>
                    </template>
                </a-table>
            </a-tab-pane>

            <!-- 积分规则 -->
            <a-tab-pane key="rules" tab="积分规则">
                <a-collapse v-model:activeKey="activeRules">
                    <a-collapse-panel 
                        v-for="rule in pointsRules" 
                        :key="rule.id" 
                        :header="rule.title"
                    >
                        <div class="rule-content">
                            <p>{{ rule.content }}</p>
                            <p class="rule-points">可获得积分：{{ rule.points }}</p>
                        </div>
                    </a-collapse-panel>
                </a-collapse>
            </a-tab-pane>

            <!-- 积分提现 -->
            <a-tab-pane key="withdraw" tab="积分提现">
                <a-form 
                    :model="withdrawForm"
                    :rules="withdrawRules"
                    layout="vertical"
                >
                    <a-form-item label="提现金额" name="amount">
                        <a-input-number 
                            v-model:value="withdrawForm.amount"
                            :min="100"
                            :max="pointsInfo.current"
                            style="width: 200px"
                        />
                        <span class="form-tip">
                            可提现积分：{{ pointsInfo.current }}
                        </span>
                    </a-form-item>
                    <a-form-item label="提现方式" name="method">
                        <a-radio-group v-model:value="withdrawForm.method">
                            <a-radio value="alipay">支付宝</a-radio>
                            <a-radio value="wechat">微信</a-radio>
                            <a-radio value="bank">银行卡</a-radio>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item label="收款账号" name="account">
                        <a-input 
                            v-model:value="withdrawForm.account"
                            placeholder="请输入收款账号"
                            style="width: 300px"
                        />
                    </a-form-item>
                    <a-form-item>
                        <a-button type="primary" @click="handleWithdraw">
                            申请提现
                        </a-button>
                    </a-form-item>
                </a-form>
            </a-tab-pane>

            <!-- 充值积分 -->
            <a-tab-pane key="recharge" tab="充值积分">
                <a-form 
                    :model="rechargeForm"
                    :rules="rechargeRules"
                    layout="vertical"
                >
                    <a-form-item label="充值金额" name="amount">
                        <a-input-number 
                            v-model:value="rechargeForm.amount"
                            :min="10"
                            style="width: 200px"
                        />
                    </a-form-item>
                    <a-form-item label="支付方式" name="method">
                        <a-radio-group v-model:value="rechargeForm.method">
                            <a-radio value="alipay">支付宝</a-radio>
                            <a-radio value="wechat">微信</a-radio>
                        </a-radio-group>
                    </a-form-item>
                    <a-form-item>
                        <a-button type="primary" @click="handleRecharge">
                            立即充值
                        </a-button>
                    </a-form-item>
                </a-form>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
    WalletOutlined,
    TrophyOutlined,
    ShoppingOutlined
} from '@ant-design/icons-vue';
import type { 
    PointsInfo, 
    PointsRecord, 
    PointsRule,
    WithdrawForm,
    RechargeForm
} from '@/types/personal';
import PersonalApi from '@/services/personal';

// 积分信息
const pointsInfo = ref<PointsInfo>({
    current: 0,
    total: 0,
    used: 0
});

// 当前选中的标签页
const activeKey = ref('overview');

// 积分记录表格列定义
const columns = [
    {
        title: '时间',
        dataIndex: 'time',
        key: 'time',
        width: 180
    },
    {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
        width: 120
    },
    {
        title: '积分变动',
        dataIndex: 'points',
        key: 'points',
        width: 120
    },
    {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark'
    }
];

// 积分记录数据
const pointsRecords = ref<PointsRecord[]>([]);

// 分页配置
const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
});

// 积分规则
const pointsRules = ref<PointsRule[]>([]);
const activeRules = ref<string[]>([]);

// 提现表单
const withdrawForm = ref<WithdrawForm>({
    amount: 0,
    method: 'alipay',
    account: ''
});

// 提现表单验证规则
const withdrawRules = {
    amount: [
        { required: true, message: '请输入提现金额' },
        { type: 'number', min: 100, message: '最小提现金额为100积分' }
    ],
    method: [{ required: true, message: '请选择提现方式' }],
    account: [{ required: true, message: '请输入收款账号' }]
};

// 充值表单
const rechargeForm = ref<RechargeForm>({
    amount: 0,
    method: 'alipay'
});

// 充值表单验证规则
const rechargeRules = {
    amount: [
        { required: true, message: '请输入充值金额' },
        { type: 'number', min: 10, message: '最小充值金额为10元' }
    ],
    method: [{ required: true, message: '请选择支付方式' }]
};

// 获取积分信息
const getPointsInfo = async () => {
    try {
        const res = await PersonalApi.GET_POINTS_INFO_API();
        if (res.code === 200) {
            pointsInfo.value = res.data;
        }
    } catch (error) {
        message.error('获取积分信息失败');
    }
};

// 获取积分记录
const getPointsRecords = async (page = 1) => {
    try {
        const res = await PersonalApi.GET_POINTS_RECORDS_API({
            page,
            size: pagination.value.pageSize
        });
        if (res.code === 200) {
            pointsRecords.value = res.data.records;
            pagination.value.total = res.data.total;
        }
    } catch (error) {
        message.error('获取积分记录失败');
    }
};

// 获取积分规则
const getPointsRules = async () => {
    try {
        const res = await PersonalApi.GET_POINTS_RULES_API();
        if (res.code === 200) {
            pointsRules.value = res.data;
        }
    } catch (error) {
        message.error('获取积分规则失败');
    }
};

// 处理表格分页变化
const handleTableChange = (pag: any) => {
    pagination.value.current = pag.current;
    getPointsRecords(pag.current);
};

// 处理提现
const handleWithdraw = async () => {
    try {
        const res = await PersonalApi.WITHDRAW_POINTS_API(withdrawForm.value);
        if (res.code === 200) {
            message.success('提现申请已提交');
            getPointsInfo();
            withdrawForm.value = {
                amount: 0,
                method: 'alipay',
                account: ''
            };
        }
    } catch (error) {
        message.error('提现申请失败');
    }
};

// 处理充值
const handleRecharge = async () => {
    try {
        const res = await PersonalApi.RECHARGE_POINTS_API(rechargeForm.value);
        if (res.code === 200) {
            message.success('充值成功');
            getPointsInfo();
            rechargeForm.value = {
                amount: 0,
                method: 'alipay'
            };
        }
    } catch (error) {
        message.error('充值失败');
    }
};

onMounted(() => {
    getPointsInfo();
    getPointsRecords();
    getPointsRules();
});
</script>

<style lang="less" scoped>
.points-section {
    .points-overview {
        margin-bottom: 24px;
    }

    .rule-content {
        .rule-points {
            color: #3f8600;
            margin-top: 8px;
        }
    }

    .form-tip {
        margin-left: 12px;
        color: #666;
    }
}
</style> 