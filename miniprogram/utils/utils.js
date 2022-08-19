const app = getApp()

export const cutdown = time => {
    var cutdown = new Date().getTime() - time
    return cutdown > 0 ? cutdown : 0 - cutdown
}

export const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

export const secondsNo = timeStamp => {
    var date = new Date(timeStamp)
    date.setSeconds(0, 0)
    return date.getTime()
}

export const unixToFormatted = timeStamp => {
    var date = new Date(timeStamp)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
}

export const nextOKTime = () => {
    var date = new Date()
    if (date.getMinutes() < 30) {
        date.setMinutes(30)
    } else if (date.getMinutes() > 30) {
        date.setMinutes(0)
        date.setHours(date.getHours() + 1)
    }
    return date.getTime()
}

const _syncRequest = (requestMapping, data, requestWay, contentType) => {
    return new Promise(function (resolve, reject) {
        data.openid = app.globalData.openid
        wx.request({
            url: app.globalData.url + requestMapping,
            data: data,
            header: {
                'content-type': contentType
            },
            method: requestWay,
            success(res) {
                if (res.data.success === false || res.data.statusCode === 404) {
                    reject(res)
                } else {
                    resolve(res)
                }
            },
            fail(e) {
                reject(e)
            }
        })
    })
}

export const syncRequest = (requestMapping, data, requestWay = 'GET',
    contentType = 'application/json', times = 1, delay = 3000) => {
    return new Promise((resolve, reject) => {
        const retry = () => {
            _syncRequest(requestMapping, data, requestWay, contentType)
                .then(resolve)
                .catch(e => {
                    if (--times === 0) {
                        wx.reportEvent("request_error", e)
                        reject(e)
                    }
                    setTimeout(() => {
                        retry()
                    }, delay)
                })
        }
        retry()
    })
}

export const storeImage = (tempPath, permanentPath) => {
    return new Promise((resolve, reject) => {
        let fs = wx.getFileSystemManager()
        fs.readFile({
            filePath: tempPath,
            encoding: 'base64',
            success: data => {
                try {
                    let res = fs.writeFileSync(
                        `${wx.env.USER_DATA_PATH}` + permanentPath,
                        data.data,
                        'base64'
                    )
                    resolve(res)
                } catch (e) {
                    reject(e)
                }
            },
            fail: e => {
                reject(e)
            }
        })
    })
}