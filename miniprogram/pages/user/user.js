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
      eventStart: 0,
      eventStartFormatted: '',
      eventRoll: 0,
      eventRollFormatted: '',
      eventEnd: 0,
      eventEndFormatted: '',
      eventDescription: '',

      eventNameError: '',
      eventStartError: '',
      eventRollError: '',
      eventEndError: '',

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

    isJoinGroupShow: false,
    groupKey: '',
    joinLock: false,
    isGroupsShow: false,
    myGroups: {},

    isUpdateLogShow: false
  },

  onLoad: function (options) {
  },
  
  onShow: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        avatarUrl: app.globalData.userInfo.avatarUrl,
        nickName: app.globalData.userInfo.nickName,
        addressInfo: app.globalData.userInfo.fullAddr
      })
    }
  },

  showMyEvents: async function() {
    await this.getMyEvents()
    this.setData({ isEventsShow: true }) 
  },

  hideMyEvents: function () { this.setData({ isEventsShow: false }) },

  getMyEvents: async function() {
    var myEvents = await wx.cloud.callFunction({
      name: 'gift',
      data: { action: 'searchIn' }
    })
    var indexList = []
    var result = []
    if (myEvents.result[0].length > 0) {
      indexList.push('已报名')
      result.push(myEvents.result[0])
    }
    if (myEvents.result[1].length > 0) {
      indexList.push('已抽签')
      result.push(myEvents.result[1])
    }
    if (myEvents.result[2].length > 0) {
      indexList.push('已结束')
      result.push(myEvents.result[2])
    }
    this.setData({
      myEvents: { indexList: indexList, result: result }
    })
  },

  showCreateEvent: function () {
    Notify({ type: 'warning', message: '功能维护中' });
    // this.setData({ isCreateShow: true })
  },

  hideCreateEvent: function () { this.setData({ isCreateShow: false }) },

  createEvent: async function () {
    this.setData({
      'newEvent.eventNameError': '',
      'newEvent.eventStartError': '',
      'newEvent.eventRollError': '',
      'newEvent.eventEndError': ''
    })
    var errorFlag = false
    var newEvent = this.data.newEvent
    if (newEvent.eventName.trim() === '') {
      this.setData({ 'newEvent.eventNameError': '请输入活动名称' })
      errorFlag = true
    }
    if (newEvent.eventStart === 0) {
      this.setData({ 'newEvent.eventStartError': '请输入开始时间' })
      errorFlag = true
    }
    if (newEvent.eventRoll === 0) {
      this.setData({ 'newEvent.eventRollError': '请输入抽签时间' })
      errorFlag = true
    } else if (newEvent.eventStart >= newEvent.eventRoll) {
      this.setData({ 'newEvent.eventRollError': '抽签时间不得早于开始时间' })
      errorFlag = true
    }
    if (newEvent.eventEnd === 0) {
      this.setData({ 'newEvent.eventEndError': '请输入结束时间' })
      errorFlag = true
    } else if (newEvent.eventRoll >= newEvent.eventEnd) {
      this.setData({ 'newEvent.eventEndError': '结束时间不得早于抽签时间' })
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
        endTime: newEvent.eventEnd,
        description: newEvent.eventDescription,
      }
    })
    this.setData({ isCreateShow: false, 'newEvent.uploadLock': false })
    Notify({ type: 'success', message: '创建成功，请通知My过审核' });
  },

  checkEventName: function (value) {
    this.setData({ 'newEvent.eventNameError': '' })
    if (value.detail.trim() === '')
      this.setData({ 'newEvent.eventNameError': '请输入活动名称' })
    this.setData({ 'newEvent.eventName': value.detail })
  },

  checkEventDesc: function (value) {
    this.setData({ 'newEvent.eventDescription': value.detail })
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

  showDatePickerEnd: function () {
    this.setData({
      isDatePickerShow: true,
      'newEvent.dateFlag': 2
    })
  },

  confirmDatePicker: function (value) {
    var dateTime = value.detail // UNIX TIME FORMAT
    if (this.data.newEvent.dateFlag === 0) {
      this.setData({
        'newEvent.eventStart': dateTime,
        'newEvent.eventStartFormatted': utils.unixToFormatted(dateTime),
        'newEvent.eventStartError': ''
      })
    } else if (this.data.newEvent.dateFlag === 1) {
      this.setData({
        'newEvent.eventRoll': dateTime,
        'newEvent.eventRollFormatted': utils.unixToFormatted(dateTime),
        'newEvent.eventRollError': ''
      })
    } else if (this.data.newEvent.dateFlag === 2) {
      this.setData({
        'newEvent.eventEnd': dateTime,
        'newEvent.eventEndFormatted': utils.unixToFormatted(dateTime),
        'newEvent.eventEndError': ''
      })
    }
    this.setData({
      isDatePickerShow: false,
      'newEvent.dateFlag': -1,
    })
  },

  hideDatePicker: function () { this.setData({ isDatePickerShow: false }) },

  getMyGroups: async function () {
    var myGroups = await wx.cloud.callFunction({
      name: 'userdbo_v2',
      data: { action: 'queryGroupsDetail' }
    })
    this.setData({ myGroups: myGroups.result })
  },

  showMyGroups: async function () {
    await this.getMyGroups()
    this.setData({ isGroupsShow: true })
  },

  hideMyGroups: function () { this.setData({ isGroupsShow: false }) },

  showJoinGroup: function () { this.setData({ isJoinGroupShow: true }) },

  hideJoinGroup: function () { this.setData({ isJoinGroupShow: false }) },

  joinGroup: async function () {
    var res = await wx.cloud.callFunction({
      name: 'userdbo_v2',
      data: { action: 'joinGroup', key: this.data.groupKey }
    })
    if (res.result == -1) Notify({ type: 'danger', message: '密钥无效' });
    else if (res.result == 0) {
      Notify({ type: 'success', message: '加入成功' })
      wx.reLaunch({ url: '../index/index', })
    }
    else if (res.result == 1) Notify({ type: 'success', message: '你已经在小组当中了' });
    this.setData({ groupKey: '' })
  },

  checkGroupKey: function (value) { this.setData({ groupKey: value.detail }) },

  showUpdateLog: function () { this.setData({ isUpdateLogShow: true }) },

  hideUpdateLog: function () { this.setData({ isUpdateLogShow: false }) },

  updateUser: function () {
    var that = this
    wx.getSetting().then(res => {
      if (res.authSetting['scope.userInfo'] === undefined) {
        that.openConfirm(true)
      } else if (res.authSetting['scope.userInfo']) {
        that.uploadUserInfo()
      } else {
        that.openConfirm(false)
      }
    })
  },

  uploadUserInfo: function () {
    var that = this
    wx.getUserInfo().then(userInfo => {
      wx.cloud.callFunction({
        name: 'userdbo_v2',
        data: {
          action: 'update',
          _id: app.globalData.userInfo._id,
          nickName: userInfo.userInfo.nickName,
          avatarUrl: userInfo.userInfo.avatarUrl,
        }
      }).then(res => {
        Dialog.alert({
          message: '更新成功',
        }).then(() => {
          this.onShow()
        });
      })
    })
  },

  showAbout: function () {
    Dialog.alert({
      title: '关于',
      message: '感恩有你们',
    })
  },

  openConfirm: function (isFirst) {
    Dialog.confirm({
      message: '检测到您没打开用户信息权限，是否去设置打开？',
      confirmButtonOpenType: isFirst ? 'getUserInfo' : 'openSetting'
    }).catch(() => {
      Dialog.close();
    });
  }
})