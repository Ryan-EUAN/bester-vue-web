function setStorage(title: string, data: any) {
    localStorage.setItem(title, JSON.stringify(data))
}

function getStorage(title: string): any {
    return JSON.parse(localStorage.getItem(title) || '')
}

function removeStorage(title:string) {
    localStorage.removeItem(title)
}

export default {
    setStorage,
    getStorage,
    removeStorage
}