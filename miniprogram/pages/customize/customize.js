const app = getApp().globalData

Page({
    data: {
        settings: {}
    },
    onLoad(options) {
    },
    onShow() {
        this.setData({
            settings: app.settings
        })
    },
    syncSettings() {
        app.settings = this.data.settings
        wx.setStorage({
            key: 'settings',
            data: app.settings
        })
    },

    onBackgroundSelect(e) {
        let background = e.detail.value
        this.setData({
            'settings.background.red': background === 'red',
            'settings.background.green': background === 'green'
        })
        this.syncSettings()
    },
    onDarkModeSwitch(e) {
        let enable = e.detail.value
        this.setData({
            'settings.darkMode.enable': enable
        })
        this.syncSettings()
        // let theme = e.detail.value ? 'dark' : 'light'
        // this.setData({
        //     theme: theme,
        //     themeBg: theme === 'light' ? 'green-bg' : 'dark-bg',
        // })
        // app.setTheme(theme)
    },
    onFollowSystemSwitch(e) {
        let enable = e.detail.value
        this.setData({
            'settings.darkMode.followSystem': enable
        })
        this.syncSettings()
        // let value = e.detail.value
        // try {
        //     wx.setStorageSync('followSys', value)
        //     app.followSys = value
        // } catch (e) {
        //     console.log(e)
        // }
    }
})