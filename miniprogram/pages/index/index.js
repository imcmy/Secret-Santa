const app = getApp().globalData
import * as utils from "../../utils/utils"
import {
    syncRequest
} from "../../utils/requests"


Page({
    data: {
        logged: false,
        theme: 'light',
        themeBg: 'green',

        avatarUrl: '',
        nickName: '',
        addressInfo: '',

        events: {},
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
                    themeBg: e.theme === 'light' ? app.themeBg : 'dark'
                })
                app.theme = e.theme
            }
        })
    },
    onShow: function (e) {
        wx.hideHomeButton();
        if (!app.user)
            return
        
        this.setData({
            theme: app.theme,
            themeBg: app.settings.background.red ? 'red' : 'green',
            avatarUrl: app.user.avatar,
            nickName: app.user.nickname,
            addressInfo: app.user.fullAddr,
            logged: true
        })
        this.fetchEvents()
    },

    fetchEvents: async function () {
        this.loading = true

        let events = await syncRequest('/events', {
            action: 'list'
        })
        for (let key in events.data) {
            events.data[key].forEach((item, _) => {
                if (key === 'notStarted')
                    item.timeFormatted = utils.formattedTime(item.event_start)
                else if (key === 'started' || key === 'underway')
                    item.timeFormatted = utils.formattedTime(item.event_roll)
                else if (key === 'rolled' || key === 'ended')
                    item.timeFormatted = utils.formattedTime(item.event_end)
            })
        }
        this.setData({
            events: events.data
        })

        this.loading = false
    },
    onPullDownRefresh: function () {
        if (!this.data.loading) {
            this.fetchEvents().then(() => {
                wx.stopPullDownRefresh()
            })
        }
    },

    onNavigateEvent(e) {
        let id = e.currentTarget.id
        let parts = id.split("-")
        for (let idx in this.data.events[parts[0]]) {
            if (this.data.events[parts[0]][idx]._id === parts[1]) {
                app.event = this.data.events[parts[0]][idx]
                wx.navigateTo({
                    url: '/pages/gift/gift'
                })
                return
            }
        }
    }
})