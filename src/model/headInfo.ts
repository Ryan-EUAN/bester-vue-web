export interface HeadNavInfoModal {
    label: string,
    path: string
    key: number,
    icon: string,
    children?: HeadNavInfoModal[]
}

export interface HeadUserInfoModal {
    id: number,
    name: string,
    avatar: string,
}