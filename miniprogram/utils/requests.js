import {
    testSetLogin
} from 'states'

const app = getApp().globalData

export const promiseRequest = (requestMapping, data,
    requestWay = 'GET', contentType = 'application/json') => {
    return new Promise((resolve, reject) => {
        wx.request({
            url: app.url + requestMapping,
            method: requestWay,
            data: data,
            header: {
                'content-type': contentType
            },
            success(res) {
                if (res.statusCode !== 200 || res.data.success === false || res.data.errCode) {
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

const _retryRequest = (requestMapping, data,
    requestWay = 'GET', contentType = 'application/json',
    times = 0, delay = 3000) => {
    return new Promise((resolve, reject) => {
        const retry = (time, ensure_login) => {
            data.session_id = app.sessionId
            promiseRequest(requestMapping, data, requestWay, contentType)
                .then(resolve)
                .catch(e => {
                    if (!ensure_login) {
                        if (e.data && e.data.errCode === 0x3) {
                            setTimeout(async () => {
                                await testSetLogin(true)
                                retry(time, true)
                            }, delay)
                            return
                        }
                    }
                    if (times-- <= 0)
                        reject(e)
                    else
                        setTimeout(() => {
                            retry(time, false)
                        }, delay)
                })
        }
        retry(times, false)
    })
}

export const syncRequest = (requestMapping, data,
    requestWay = 'GET', contentType = 'application/json') => {
    return new Promise((resolve, reject) => {
        testSetLogin()
        _retryRequest(requestMapping, data, requestWay, contentType)
            .then(resolve)
            .catch(reject)
    })
}