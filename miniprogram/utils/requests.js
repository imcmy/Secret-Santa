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
                    // console.log(res)
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
    times = 1, delay = 3000) => {
    return new Promise((resolve, reject) => {
        const retry = (time) => {
            data.session_id = app.sessionId
            promiseRequest(requestMapping, data, requestWay, contentType)
                .then(resolve)
                .catch(e => {
                    if (e.data && e.data.errCode === 0x3) {
                        if (time-- === 0)
                            reject(e)
                        else
                            setTimeout(async () => {
                                await testSetLogin(true)
                                retry(time)
                            }, delay)
                    } else {
                        if (--time === 0)
                            reject(e)
                        else
                            setTimeout(() => {
                                retry(time)
                            }, delay)
                    }
                })
        }
        retry(times)
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