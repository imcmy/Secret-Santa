App({
    data: {
        url: 'https://fc-mp-6e650b7d-9aea-45a9-be79-0602370af57a.next.bspapp.com',
        platform: 'wechat',
        theme: 'light',
        settings: {
            background: {
                red: true,
                green: false
            },
            darkMode: {
                enable: false,
                followSystem: false
            }
        },
        user: undefined,
        sessionId: '',
        sessionExpire: Date.now()
    },
    onLaunch: function () {
        this.globalData = this.data
    },
    syncFullAddr() {
        for (let address in this.data.user.addresses) {
            if (this.data.user.addresses[address].current) {
                this.data.user.fullAddr = this.data.user.addresses[address].fullAddr
                break
            }
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
