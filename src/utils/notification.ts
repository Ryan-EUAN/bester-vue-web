import { ElNotification } from "element-plus";

function success(message: string, title: string = "系统提示", time: number = 3000, showClose: boolean = false) {
    ElNotification({
        title: title,
        message: message,
        type: 'success',
        duration: time,
        showClose: showClose
    })
}

function error(message: string, title: string = "系统提示", time: number = 3000, showClose: boolean = false) {
    ElNotification({
        title: title,
        message: message,
        type: 'error',
        duration: time,
        showClose: showClose
    })
}

function warning(message: string, title: string = "系统提示", time: number = 3000, showClose: boolean = false) {
    ElNotification({
        title: title,
        message: message,
        type: 'warning',
        duration: time,
        showClose: showClose
    })
}

function info(message: string, title: string = "系统提示", time: number = 3000, showClose: boolean = false) {
    ElNotification({
        title: title,
        message: message,
        type: 'info',
        duration: time,
        showClose: showClose
    })
}

export default {
    success,
    error,
    warning,
    info
}