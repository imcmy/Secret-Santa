const app = getApp()
import * as utils from "../../utils/utils"


Page({
    data: {
        logged: false,
        theme: 'light',
        themeBg: 'green',

        avatarUrl: '',
        nickName: '',
        addressInfo: '',

        event: {},
        currentTab: 0,
        tabList: [{
            name: '我的活动'
        }, {
            name: '报名中'
        }, {
            name: '未开始'
        }]
    },
    onLoad() {
        var that = this
        wx.onThemeChange((e) => {
            if (e.theme) {
                that.setData({
                    theme: e.theme,
                    themeBg: e.theme === 'light' ? app.globalData.themeBg : 'dark'
                })
                app.globalData.theme = e.theme
            }
        })
    },
    onShow: function (e) {
        wx.hideHomeButton();
        if (app.globalData.userInfo && !app.globalData.userInfo.unReg) {
            this.setData({
                theme: app.globalData.theme,
                themeBg: app.globalData.theme === 'light' ? app.globalData.themeBg : 'dark',
                avatarUrl: app.globalData.userInfo.avatar,
                nickName: app.globalData.userInfo.nickName,
                addressInfo: app.globalData.userInfo.fullAddr,
                logged: true
            })
            this.fetchEvents()
            wx.getStorage({
                key: 'v1.6',
                fail() {
                    wx.showModal({
                        title: '更新头像',
                        content: '因接口调整，请更新头像',
                        success(res) {
                            wx.setStorage({
                                key: "v1.6",
                                data: true
                            })
                            if (res.confirm)
                                wx.navigateTo({
                                    url: '../user_detail/user_detail'
                                })
                        }
                    })
                }
            })
        } else {
            wx.hideTabBar()
        }
    },

    fetchEvents: async function () {
        this.loading = true

        let events = await utils.syncRequest('/events', {
            action: 'list'
        })
        for (let key in events.data) {
            events.data[key].forEach((item, _) => {
                if (item.status == 0) item.timeFormatted = utils.unixToFormatted(item.rollTime)
                else if (item.status == 1) item.timeFormatted = utils.unixToFormatted(item.startTime)
                else if (item.status == 2 || item.status == 3) item.timeFormatted = utils.unixToFormatted(item.endTime)
            })
        }
        this.setData({
            event: events.data,
            myEventLength: events.data.applied.length + events.data.publish.length
        })

        this.loading = false
    },

    // Event Handler
    onTapRegister: function (e) {
        wx.navigateTo({
            url: '/pages/user_detail/user_detail',
        })
    },
    onTapUser: function () {
        wx.navigateTo({
            url: '/pages/user/user',
        })
    },

    // UI interaction helper functions
    onPullDownRefresh: function () {
        if (!this.data.loading) {
            this.fetchEvents().then(() => {
                wx.stopPullDownRefresh()
            })
        }
    },
    handleClick: function (e) {
        let currentTab = e.currentTarget.dataset.index
        this.setData({
            currentTab
        })
    },
    handleSwiper: function (e) {
        let {
            current,
            source
        } = e.detail
        if (source === 'autoplay' || source === 'touch') {
            const currentTab = current
            this.setData({
                currentTab
            })
        }
    },
})