import {
    errorHandler
} from "errors"
import {
    promiseRequest
} from 'requests'
const app = getApp().globalData

export const storeSession = (res) => {
    app.user = res.data.user
    app.sessionId = res.data.session_id
    app.sessionExpire = res.data.session_exp
    try {
        wx.batchSetStorageSync([{
                key: "session_id",
                value: app.sessionId
            }, {
                key: "session_expire",
                value: app.sessionExpire
            }]
        )
    } catch (e) {
        errorHandler(e)
    }
    
}

const isSessionExpired = () => {
    var date = Date.now()
    return app.sessionExpire && (app.sessionExpire < date)
}

export const getLoginCode = () => {
    return new Promise((resolve, reject) => {
        wx.login({
            success: res => {
                if (res.code)
                    resolve(res)
                else
                    reject(res)
            },
            fail: e => {
                reject(e)
            }
        })
    })
}

export const testSetLogin = async (force = false, login = false) => {
    if (force || isSessionExpired()) {
        try {
            let code = await getLoginCode()
            let session = await promiseRequest('/login', {
                code: code.code,
                platform: app.platform
            })
            storeSession(session)
            if (login)
                getApp().syncFullAddr()
        } catch (e) {
            if (login && e.data && e.data.errCode === 0x4)
                return false
            errorHandler(e)
            return false
        }
    }
    return true
}