// 地区选项数据
export const regionOptions = [
    {
        value: '110000',
        label: '北京市',
        children: [
            {
                value: '110100',
                label: '北京市',
                children: [
                    { value: '110101', label: '东城区' },
                    { value: '110102', label: '西城区' },
                    // ... 其他区域
                ]
            }
        ]
    },
    // ... 其他省份
];

// 这里可以添加其他常量
export const DEFAULT_AVATAR = '/assets/default-avatar.png';
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB 