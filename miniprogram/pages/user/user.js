// miniprogram/pages/user/user.js
const app = getApp()
var utils = require('../../utils/utils.js')
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';


Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '',
    nickName: '',
    addressInfo: '',

    isCreateShow: false,
    isDatePickerShow: false,
    newEvent: {
      eventName: '',
      eventStart: '',
      eventStartFormatted: '',
      eventRoll: '',
      eventRollFormatted: '',
      eventDescription: '',

      eventNameError: '',
      eventStartError: '',
      eventRollError: '',

      dateFlag: -1,
      minDate: utils.nextOKTime(),

      uploadLock: false
    },
    filter(type, options) {
      if (type === 'minute') {
        return options.filter(option => option % 30 === 0)
      }

      return options;
    },

    isEventsShow: false,
    myEvents: {},

    isUpdateLogShow: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        avatarUrl: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName,
        addressInfo: app.globalData.userInfo.fullAddr
      })
    }
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

  },

  showMyEvents: async function() {
    await this.getMyEvents()
    this.setData({ isEventsShow: true }) 
  },

  hideMyEvents: function () {
    this.setData({ isEventsShow: false }) 
  },

  getMyEvents: async function() {
    var myEvents = await wx.cloud.callFunction({
      name: 'gift',
      data: { action: 'searchInv2' }
    })
    var indexList = []
    var result = []
    if (myEvents.result[0].length > 0) {
      indexList.push('进行中')
      result.push(myEvents.result[0])
    }
    if (myEvents.result[1].length > 0) {
      indexList.push('已结束')
      result.push(myEvents.result[1])
    }
    this.setData({
      myEvents: { indexList: indexList, result: result }
    })
  },

  showCreateEvent: async function () {
    this.setData({ isCreateShow: true })
  },

  hideCreateEvent: function () {
    this.setData({ isCreateShow: false })
  },

  createEvent: async function () {
    this.setData({
      'newEvent.eventNameError': '',
      'newEvent.eventStartError': '',
      'newEvent.eventRollError': ''
    })
    var errorFlag = false
    var newEvent = this.data.newEvent
    if (newEvent.eventName.trim() === '') {
      this.setData({ 'newEvent.eventNameError': '请输入活动名称' })
      errorFlag = true
    }
    if (newEvent.eventStart === '') {
      this.setData({ 'newEvent.eventStartError': '请输入开始时间' })
      errorFlag = true
    }
    if (newEvent.eventRoll === '') {
      this.setData({ 'newEvent.eventRollError': '请输入截止时间' })
      errorFlag = true
    } else if (newEvent.eventStart >= newEvent.eventRoll) {
      this.setData({ 'newEvent.eventRollError': '截止时间不得早于开始时间' })
      errorFlag = true
    }
    if (errorFlag || newEvent.uploadLock)
      return
    this.setData({ 'newEvent.uploadLock': true })
    var result = await wx.cloud.callFunction({
      name: 'eventdbo',
      data: {
        action: 'insert',
        eventName: newEvent.eventName,
        startTime: newEvent.eventStart,
        rollTime: newEvent.eventRoll,
        description: newEvent.eventDescription,
      }
    })
    this.setData({ isCreateShow: false, 'newEvent.uploadLock': false })
    Notify({ type: 'success', message: '创建成功' });
  },

  checkEventName: function (value) {
    this.setData({ 'newEvent.eventNameError': '' })
    value = value.detail.trim()
    if (value === '')
      this.setData({ 'newEvent.eventNameError': '请输入活动名称' })
    this.setData({ 'newEvent.eventName': value })
  },

  showDatePickerStart: function () {
    this.setData({ 
      isDatePickerShow: true,
      'newEvent.dateFlag': 0
    })
  },

  showDatePickerRoll: function () {
    this.setData({
      isDatePickerShow: true,
      'newEvent.dateFlag': 1
    })
  },

  confirmDatePicker: function (value) {
    var dateTime = value.detail // UNIX TIME FORMAT
    if (this.data.newEvent.dateFlag === 0) {
      this.setData({
        isDatePickerShow: false,
        'newEvent.dateFlag': -1,
        'newEvent.eventStart': dateTime,
        'newEvent.eventStartFormatted': utils.unixToFormatted(dateTime),
        'newEvent.eventStartError': ''
      })
    } else if (this.data.newEvent.dateFlag === 1) {
      this.setData({
        isDatePickerShow: false,
        'newEvent.dateFlag': -1,
        'newEvent.eventRoll': dateTime,
        'newEvent.eventRollFormatted': utils.unixToFormatted(dateTime),
        'newEvent.eventRollError': ''
      })
    }
  },

  hideDatePicker: function () {
    this.setData({ isDatePickerShow: false })
  },

  showUpdateLog: function () {
    this.setData({ isUpdateLogShow: true })
  },

  hideUpdateLog: function () {
    this.setData({ isUpdateLogShow: false })
  },

  updateUser: function () {
    var that = this
    wx.getSetting().then(res => {
      if (res.authSetting['scope.userInfo'] && res.authSetting['scope.address']) {
        wx.getUserInfo().then(userInfo => {
          that.uploadAddress(userInfo)
        })
      } else {
        that.openConfirm()
        return
      }
    })
  },

  uploadAddress: function (userInfo) {
    var that = this
    wx.chooseAddress().then(addr => {
      wx.cloud.callFunction({
        name: 'userdbo',
        data: {
          action: 'update',
          _id: app.globalData.userInfo._id,
          nickName: userInfo.userInfo.nickName,
          avatarUrl: userInfo.userInfo.avatarUrl,
          provinceName: addr.provinceName,
          cityName: addr.cityName,
          countyName: addr.countyName,
          detailInfo: addr.detailInfo,
          postalCode: addr.postalCode,
          telNumber: addr.telNumber,
          recipient: addr.userName,
        }
      }).then(res => {
        wx.showModal({
          content: '更新成功',
          showCancel: false,
        }).then(() => {
          wx.reLaunch({url: '../index/index',})
        })
      })
    }).catch(err => {
      if (!err.errMsg.includes('cancel'))
        that.openConfirm()
    })
  },

  showAbout: function () {
    wx.showModal({
      content: '感恩有你们',
      showCancel: false
    });
  },

  openConfirm: function () {
    Dialog.confirm({
      message: '检测到您没打开地址权限，是否去设置打开？',
      confirmButtonOpenType: 'openSetting'
    }).catch(() => {
      Dialog.close();
    });
  },
})