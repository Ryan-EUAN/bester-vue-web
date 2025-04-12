import { UserInfoModel } from "@/model/login";
import { ElNotification } from "element-plus";

function logOut(){
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('tokenExpire')
}

function setUserInfo(userInfo: UserInfoModel) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
}

function getUserInfo(): UserInfoModel {
    return JSON.parse(localStorage.getItem('userInfo') || '{}')
}

function removeUserInfo() {
    localStorage.removeItem('userInfo')
}

function addPosts() {
    let userInfo = getUserInfo();
    userInfo.posts++;
    setUserInfo(userInfo);
}

function subPosts() {
    let userInfo = getUserInfo();
    if (userInfo.posts == 0) return;
    userInfo.posts--;
    setUserInfo(userInfo);
}

export default {
    setUserInfo,
    getUserInfo,
    removeUserInfo,
    addPosts,
    subPosts,
    logOut
}