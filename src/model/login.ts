export interface LoginModel {
    username: string,
    password: string
}
export interface LoginEmailModel {
    email: string,
    code: string
}
export interface AuthResponse {
    token: string,
    info: UserInfoModel
}
export interface UserInfoModel {
    id: number,
    name: string,
    avatar: string,
    followers: number,
    following: number,
    posts: number
}
export interface LoginMobileModel {
    email?: string,
    code: string
}
export interface LoginMobileDesc {
    email: string,
    code: string,
    code_btn: string
}