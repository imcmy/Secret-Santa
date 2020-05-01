// miniprogram/pages/gift/gift.js
const app = getApp()
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';
var utils = require('../../utils/utils.js')

Page({
  data: {
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

    var that = this
    wx.cloud.callFunction({
      name: 'gift',
      data: {
        'action': 'query',
        '_eid': options.eid
      },
      success: res => {
        res = res.result
        var event = res.event[0]
        that.setData({
          _in: res._in,
          isInGroup: res.isInGroup,

          'event._event': event,
          'event.status': event.status,
          'event.time': event.status == 0 ? utils.cutdown(event.rollTime) : event.status == 1 ? utils.cutdown(event.startTime) : event.status == 2 ? utils.cutdown(event.endTime) : 0,
          record: res.record,
          receiver: res.receiver,
          
          _options: options,
          loading: false
        })

        if (options.inh === 'ins') {
          Notify({ type: 'success', message: '欢迎参与，请耐心等待抽签' });
        } else if (options.inh === 'del') {
          Notify({ type: 'warning', message: '遗憾您的离开，欢迎再来' });
        }
      }
    })
  },

  onIns: function () {
    var that = this
    wx.showModal({
      content: '确定要参加' + that.data.event._event.eventName + '吗？',
      confirmText: "确定",
      cancelText: "继续考虑",
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
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
        }
      }
    });
  },

  onDel: function () {
    var that = this
    wx.showModal({
      content: '确定要离开' + that.data.event._event.eventName + '吗？',
      confirmText: "确定",
      cancelText: "继续考虑",
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
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
        }
      }
    });
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})