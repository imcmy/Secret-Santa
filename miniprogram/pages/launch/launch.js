const app = getApp().globalData
import {
    errorHandler
} from "../../utils/errors"
import {
    testSetLogin
} from "../../utils/states"

Page({
    data: {},
    onLoad(options) {
        this.launchLogin()
    },
    async launchLogin() {
        try {
            var valueList = wx.batchGetStorageSync(['session_id', 'session_expire', 'settings'])
            app.sessionId = valueList[0]
            app.sessionExpire = valueList[1]
            if (valueList[2])
                app.settings = valueList[2]

            app.theme = wx.getSystemInfoSync().theme
        } catch (e) {
            errorHandler(e)
        }

        if (app.sessionId && app.sessionId !== '') {
            let exist = await testSetLogin(true)
            if (exist) {
                app.user.avatar = `${wx.env.USER_DATA_PATH}` + '/avatar.png'
                getApp().syncFullAddr()
            } else {
                wx.clearStorage()
            }
        }

        wx.switchTab({
            url: '/pages/index/index'
        })
    }
})