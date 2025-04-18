import { ref } from 'vue';

const isDarkMode = ref(false);

// 监听系统主题变化
const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

// 初始化主题
isDarkMode.value = darkModeMediaQuery.matches;

// 监听系统主题变化
darkModeMediaQuery.addEventListener('change', (e) => {
    isDarkMode.value = e.matches;
});

export function useTheme() {
    // 切换主题
    const toggleTheme = () => {
        isDarkMode.value = !isDarkMode.value;
    };

    // 设置主题
    const setTheme = (dark: boolean) => {
        isDarkMode.value = dark;
    };

    return {
        isDarkMode,
        toggleTheme,
        setTheme
    };
} 