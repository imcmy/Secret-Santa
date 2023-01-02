const app = getApp().globalData
import {
    testSetLogin
} from '../../utils/states'
import * as utils from "../../utils/utils"


Page({
    data: {
        theme: 'light',
        themeBg: 'green',
        logged: false,
        
        avatarUrl: '',
        nickName: '',
        addressInfo: ''
    },

    onLoad: function (options) {
        var that = this
        wx.onThemeChange((e) => {
            if (e.theme) {
                that.setData({
                    theme: e.theme,
                    themeBg: e.theme === 'light' ? app.themeBg : 'dark',
                    'prefs.darkModeSwitch': e.theme === 'dark'
                })
                app.theme = e.theme
            }
        })
    },

    onShow: function (options) {
        if (!app.user)
            return

        this.setData({
            theme: app.theme,
            // themeBg: app.theme === 'light' ? app.settings.background : 'dark',
            themeBg: app.settings.background.red ? 'red' : 'green',
            avatarUrl: app.user.avatar,
            nickName: app.user.nickname,
            addressInfo: app.user.fullAddr,
            logged: true
        })
    },

    async onLogin() {
        let res = await testSetLogin(true, true)
        if (res)
            wx.reLaunch({
                url: '/pages/index/index',
            })
        else
            wx.navigateTo({
                url: '/pages/user_detail/user_detail',
            })
    },
    onTapRegister: function (e) {
        wx.navigateTo({
            url: '/pages/user_detail/user_detail',
        })
    }
})