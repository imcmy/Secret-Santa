// miniprogram/pages/gift/gift.js
const app = getApp()
import * as utils from "../../utils/utils"

Page({
    data: {
        theme: 'light',
        _options: {},

        _in: false,
        isInGroup: false,
        nickName: '',
        loading: true,

        event: {
            _event: {},
            status: -1,
            status_text: ['报名中', '未开始', '已抽签', '已结束'],
            status_style: ['primary', 'end', 'primary', 'end'],
            time: '',
        },
        record: {},
        receiver: {},
        recordsCount: 0
    },

    onLoad: function (options) {
        if (app.globalData.userInfo) {
            this.setData({
                nickName: app.globalData.userInfo.nickName,
            })
        } else {
            wx.switchTab({
                url: '../index/index'
            })
        }
        var that = this
        wx.onThemeChange((e) => {
            if (e.theme) {
                that.setData({
                    theme: e.theme
                })
                app.globalData.theme = e.theme
            }
        })
        this.data._options = options
        this.fetchGift()
    },
    onShow() {
        this.setData({
            theme: app.globalData.theme
        })
    },

    fetchGift: async function () {
        this.fetchLoading = true
        var that = this

        let res = await utils.syncRequest("/gifts", {
            action: 'query',
            '_eid': that.data._options.eid
        })
        if (!res.data)
            return
        res = res.data
        let event = res.event[0]
        this.setData({
            _in: res._in,
            isInGroup: res.isInGroup,
            loading: false,
            'event._event': event,
            'event.status': event.status,
            'event.time': event.status == 0 ? utils.unixToFormatted(event.rollTime) : event.status == 1 ? utils.unixToFormatted(event.startTime) : event.status == 2 ? utils.unixToFormatted(event.endTime) : '',
            record: res.record,
            receiver: res.receiver
        })

        this.fetchLoading = false
    },

    onButton(e) {
        if (this.data._in)
            this.onDel()
        else
            this.onIns()
    },

    onIns: function () {
        var that = this
        wx.showModal({
            title: '参加活动',
            content: '确定要参加' + that.data.event._event.eventName + '吗？',
            confirmText: "确定",
            cancelText: "继续考虑",
            async success(res) {
                if (res.confirm) {
                    await utils.syncRequest('/gifts', {
                        action: 'insert',
                        '_eid': that.data._options.eid
                    }).then(async () => {
                        await that.fetchGift()
                    }).catch((e) => {
                        wx.showToast({
                            title: '报名失败',
                            icon: 'error'
                        })
                    })
                }
            }
        })
    },

    onDel: function () {
        var that = this
        wx.showModal({
            title: '离开活动',
            content: '确定要离开' + that.data.event._event.eventName + '吗？',
            confirmText: "确定",
            cancelText: "继续考虑",
            async success(res) {
                if (res.confirm) {
                    await utils.syncRequest('/gifts', {
                        action: 'delete',
                        '_eid': that.data._options.eid
                    }).then(async () => {
                        await that.fetchGift()
                    }).catch((e) => {
                        wx.showToast({
                            title: '离开失败',
                            icon: 'error'
                        })
                    })
                }
            }
        })
    },

    onPullDownRefresh: function () {
        if (!this.fetchLoading)
            this.fetchGift().then(() => {
                wx.stopPullDownRefresh()
            })
    },

    // onShareAppMessage: function () {

    // }
})