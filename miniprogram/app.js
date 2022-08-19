//app.js
App({
    onLaunch: function () {
        this.globalData = {
            openid: '',
            session_key: '',
            version: '1.6.220817',
            theme: 'light',
            url: 'https://c1b28ba0-3d60-440e-b797-c927294b93f2.bspapp.com'
        }
    },
    setTheme(theme) {
        const colors = {
            "light": {
                "bgColor": "#F6F6F6",
                "bgTextStyle": "light",
                "nbBackgroundColor": "#FFFFFF",
                "nbFrontColor": "#000000"
            },
            "dark": {
                "bgColor": "#000000",
                "bgTextStyle": "dark",
                "nbBackgroundColor": "#000000",
                "nbFrontColor": "#FFFFFF"
            }
        }
        wx.setBackgroundColor({
          backgroundColor: colors[theme].bgColor,
        })
        wx.setBackgroundTextStyle({
          textStyle: colors[theme].bgTextStyle,
        })
        wx.setNavigationBarColor({
          backgroundColor: colors[theme].nbBackgroundColor,
          frontColor: colors[theme].nbFrontColor
        })
        this.globalData.theme = theme
    }
})
