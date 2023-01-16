const app = getApp().globalData
import * as utils from "../../utils/utils"
import {
    syncRequest
} from "../../utils/requests"

Page({
    data: {
        step: 0,
        steps: [{
            text: '未开始'
        }, {
            text: '报名中'
        }, {
            text: '已抽签'
        }, {
            text: '已结束'
        }],

        theme: 'light',
        event: {}
    },

    onLoad: function (options) {
        var that = this
        wx.onThemeChange((e) => {
            if (e.theme) {
                that.setData({
                    theme: e.theme
                })
                app.theme = e.theme
            }
        })
    },
    async onShow() {
        await this.fetchEvent()
    },

    async fetchEvent() {
        this.fetchLoading = true

        let res = await syncRequest("/events", {
            action: 'list_one',
            'event_id': app.event._id
        })
        app.event.event_creator = res.data.event_creator
        app.event.event_start = utils.formattedTime(app.event.event_start)
        app.event.event_roll = utils.formattedTime(app.event.event_start)
        app.event.event_end = utils.formattedTime(app.event.event_start)
        app.event.event_participates = res.data.event_participates
        this.setData({
            step: res.data.step,
            event: app.event
        })

        this.fetchLoading = false
    },

    async onInOutEvent(e) {
        console.log(e)
        try {
            let res = await syncRequest("/events", {
                action: this.data.event.joined ? 'leave' : 'join',
                'event_id': app.event._id
            })
            this.setData({
                'event.joined': !this.data.event.joined,
                'event.event_participates': res.data
            })
        } catch (e) {
            console.log(e)
        }
    },

    onPullDownRefresh: function () {
        if (!this.fetchLoading)
            this.fetchEvent().then(() => {
                wx.stopPullDownRefresh()
            })
    },
})