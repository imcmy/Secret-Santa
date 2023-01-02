const app = getApp().globalData

export const uuid = function () {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid
}

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

export const pickerDate = (time = null) => {
    const minutes = 30;
    const ms = 1000 * 60 * minutes;

    var minDate = time ? time : new Date()
    minDate = new Date(Math.ceil(minDate.getTime() / ms) * ms);
    
    var maxDate = new Date(minDate.getTime())
    maxDate = new Date(maxDate.setMonth(maxDate.getMonth() + 3));
    
    return [minDate.getTime(), maxDate.getTime()]
}

export const delayBack = (delay) => {
    setTimeout(() => {
        var pages = getCurrentPages()
        var prevPage = pages[pages.length - 1]
        wx.navigateBack({
            success: () => {
                prevPage.onLoad()
            }
        })
    }, delay)
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
