// pages/critical_error/critical_error.js
const app = getApp()

Page({
    data: {
        theme: 'light'
    },
    onLoad(options) {
        var that = this
        wx.hideHomeButton();
        wx.onThemeChange((e) => {
            if (e.theme) {
                that.setData({
                    theme: e.theme
                })
                app.globalData.theme = e.theme
            }
        })
    },
    onShow() {
        this.setData({
            theme: app.globalData.theme
        })
    },
    reportError: () => {
        wx.reportEvent("user_critical_error", {})
    },
    retry: () => {
        wx.redirectTo({
            url: '/pages/launch/launch'
        })
    }
})