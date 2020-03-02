// miniprogram/pages/gift/gift.js
const app = getApp()
import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast';
var utils = require('../../utils/utils.js')

Page({
  data: {
    event: {},
    status: '',
    time: 0,
    color: '',
    recordsCount: 0,
    _in: false,
  },

  onLoad: function (options) {
    var that = this
    wx.cloud.callFunction({
      name: 'gift',
      data: {
        'action': 'load',
        '_eid': options.eid
      },
      success: res => {
        that.setData({
          event: res.result.event.result.data,
          status: options.status,
          time: options.status == '0' ? utils.cutdown(res.result.event.result.data.diffRoll) : options.status == '1' ? utils.cutdown(res.result.event.result.data.diffStart) : 0,
          recordsCount: res.result.recordsCount,
          
          _in: res.result._in,
          _options: options
        })

        if (options.inh === 'ins') {
          Toast('欢迎您的参与，请耐心等待抽签');
        } else if (options.inh === 'del') {
          Toast('遗憾您的离开，欢迎再来');
        }
      }
    })
  },

  onIns: function () {
    var that = this
    wx.showModal({
      content: '确定要参加' + that.data.event.eventName + '吗？',
      confirmText: "确定",
      cancelText: "继续考虑",
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'gift',
            data: {
              'action': 'ins',
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
      content: '确定要离开' + that.data.event.eventName + '吗？',
      confirmText: "确定",
      cancelText: "继续考虑",
      success: function (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'gift',
            data: {
              'action': 'del',
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