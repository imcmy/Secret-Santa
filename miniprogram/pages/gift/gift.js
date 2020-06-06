// miniprogram/pages/gift/gift.js
const app = getApp()
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify'
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'
var utils = require('../../utils/utils.js')

Page({
  data: {
    _options: {},

    _in: false,
    isInGroup: false,
    nickName: '',
    loading: true,

    event: {
      _event: {},
      status: -1,
      time: 0,
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
    }
    this.data._options = options
    this.fetchGift()
  },

  fetchGift: async function () {
    this.fetchLoading = true
    var that = this
    wx.cloud.callFunction({
      name: 'gift',
      data: {
        'action': 'query',
        '_eid': that.data._options.eid
      },
      success: res => {
        res = res.result
        var event = res.event[0]
        that.setData({
          _in: res._in,
          isInGroup: res.isInGroup,
          loading: false,

          'event._event': event,
          'event.status': event.status,
          'event.time': event.status == 0 ? utils.cutdown(event.rollTime) : event.status == 1 ? utils.cutdown(event.startTime) : event.status == 2 ? utils.cutdown(event.endTime) : 0,
          record: res.record,
          receiver: res.receiver
        })

        if (that.data._options.inh === 'ins') {
          Notify({ type: 'success', message: '欢迎参与，请耐心等待抽签' });
        } else if (that.data._options.inh === 'del') {
          Notify({ type: 'warning', message: '遗憾您的离开，欢迎再来' });
        }
      }
    })
    this.fetchLoading = false
  },

  onIns: function () {
    var that = this
    Dialog.confirm({
      title: '参加活动',
      message: '确定要参加' + that.data.event._event.eventName + '吗？',
      confirmButtonText: "确定",
      cancelButtonText: "继续考虑",
    }).then(async () => {
      await wx.cloud.callFunction({
        name: 'gift',
        data: {
          'action': 'insert',
          '_eid': that.data._options.eid
        },
        success: res => {
          that.data._options['inh'] = 'ins'
          that.onLoad(that.data._options)
        }
      })
    }).catch(() => {
      Dialog.close();
    });
  },

  onDel: function () {
    var that = this
    Dialog.confirm({
      title: '离开活动',
      message: '确定要离开' + that.data.event._event.eventName + '吗？',
      confirmButtonText: "确定",
      cancelButtonText: "继续考虑",
    }).then(async () => {
      await wx.cloud.callFunction({
        name: 'gift',
        data: {
          'action': 'delete',
          '_eid': that.data._options.eid
        },
        success: res => {
          that.data._options['inh'] = 'del'
          that.onLoad(that.data._options)
        }
      })
    }).catch(() => {
      Dialog.close();
    });
  },

  onPullDownRefresh: function () {
    if (!this.fetchLoading) {
      this.data._options.inh = ''
      this.fetchGift().then(() => {
        wx.stopPullDownRefresh()
      })
    }
  },
  
  onShareAppMessage: function () {

  }
})