Page({
    onLoad(options) {
        wx.hideHomeButton()
    },
    retry() {
        wx.reLaunch({
            url: '/pages/launch/launch'
        })
    }
})
