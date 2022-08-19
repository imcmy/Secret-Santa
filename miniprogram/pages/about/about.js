// pages/about/about.js
const app = getApp()
Page({
    data: {
        theme: 'light'
    },
    onLoad(options) {
        var that = this
        wx.onThemeChange((e) => {
            if (e.theme) {
                that.setData({
                    theme: e.theme
                })
                app.globalData.theme = e.theme
            }
        })
    },
    onReady() {},
    onShow() {
        this.setData({
            theme: app.globalData.theme
        })
    }
})