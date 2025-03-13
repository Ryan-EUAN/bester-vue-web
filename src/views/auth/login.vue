<template>
    <el-card>
        <template #header>
            <div style="user-select: none;">终于等到你~</div>
        </template>
        <a-flex vertical class="top_nav">
            <strong>欢迎来到CSDN</strong>
            <strong>专业开发社区</strong>
            <div style="font-size: 0.8rem;">请登陆后完成操作</div>
        </a-flex>
        <LoginMobileView v-if="isMobile" />
        <loginPCView v-else />
    </el-card>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import LoginMobileView from './loginMobile.vue'
import loginPCView from './loginPC.vue'

const isMobile = ref<boolean>(window.innerWidth <= 768)
//每秒定时器
const timer = ref()
//开启计时器
function startTimer() {
    timer.value = setInterval(() => {

    }, 1000);

}
//停止计时器
function stopTimer() {
    clearInterval(timer.value)
}

function updateMobile() {
    isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
    window.addEventListener('resize', updateMobile)
    startTimer()
})

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateMobile)
    stopTimer()
})
</script>
<style lang="scss" scoped>
.el-card {
    width: 30vw;
    position: fixed;
    right: 2vw;
    top: 50%;
    transform: translateY(-50%);
}

.top_nav {
    font-size: 1rem;
    margin-top: -1vh;
    font-family: 'Microsoft YaHei';
    // margin-bottom: 2vh;
    height: 10vh;
    line-height: 3vh;
}

@media screen and (max-width: 768px) {
    .el-card {
        width: 90vw;
        position: fixed;
        right: 5vw;
        top: 50%;
        transform: translateY(-50%);
        border-radius: 10px;
    }

}
</style>