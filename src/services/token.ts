function getToken() {
    return localStorage.getItem("token")
}

function setToken(token: string) {
    if (typeof token !== "string") {
        localStorage.setItem("token", JSON.stringify(token))
    } else {
        localStorage.setItem("token", token)
    }
}

function removeToken() {
    localStorage.removeItem("token")
}

export default {
    //获取token
    getToken,
    //设置token
    setToken,
    //删除token
    removeToken
}