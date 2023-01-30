import {
    errorHandler
} from "./utils/errors"

App({
    data: {
        url: 'https://api.secret-santa.top',
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
        sessionExpire: 0,
        event: undefined
    },
    onLaunch() {
        this.globalData = this.data
    },
    clearAll() {
        try {
            wx.clearStorageSync()
            this.data.user = undefined
            this.data.sessionId = ''
            this.data.sessionExpire = 0
            this.data.event = undefined
        } catch (e) {
            errorHandler(e)
        }
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