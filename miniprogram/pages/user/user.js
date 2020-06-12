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
      eventGroup: '',
      eventGroupID: '',
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
      return type === 'minute' ? options.filter(option => option % 30 === 0) : options;
    },

    isGroupPickerShow: false,

    isJoinGroupShow: false,
    groupKey: '',
    joinLock: false,
    isGroupsShow: false,
    myGroups: {},
    myGroupsColumns: [],

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

  showCreateEvent: function () { this.setData({ minDate: utils.nextOKTime(), isCreateShow: true }) },

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
    if (newEvent.eventGroupID === '') {
      errorFlag = true
    }
    if (errorFlag || newEvent.uploadLock)
      return
    this.setData({ 'newEvent.uploadLock': true })
    await wx.cloud.callFunction({
      name: 'eventdbo',
      data: {
        action: 'insert',
        eventName: newEvent.eventName,
        eventGroup: newEvent.eventGroupID,
        startTime: newEvent.eventStart,
        rollTime: newEvent.eventRoll,
        endTime: newEvent.eventEnd,
        description: newEvent.eventDescription,
      }
    })
    this.setData({ isCreateShow: false, 'newEvent.uploadLock': false })
    Notify({ type: 'success', message: '创建成功，请通知小组管理员过审核' });
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
    var dateTime = utils.secondsNo(value.detail) // UNIX TIME FORMAT
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

  getGroupsAndColumns: async function () {
    var myGroups = await wx.cloud.callFunction({
      name: 'userdbo_v2',
      data: { action: 'queryGroupsDetail' }
    })
    var groupNames = myGroups.result.map((value, idx, _) => { return value.groupName })
    this.setData({
      myGroups: myGroups.result,
      myGroupsColumns: groupNames
    })
  },

  showGroupPicker: function () {
    this.getGroupsAndColumns()
    this.setData({ isGroupPickerShow: true })
  },

  confirmGroupPicker: function (event) {
    var that = this
    const { picker, value, index } = event.detail;
    this.data.myGroups.every((val, idx, _) => {
      if (val.groupName === value) {
        that.setData({
          'newEvent.eventGroup': val.groupName,
          'newEvent.eventGroupID': val._id,
          'isGroupPickerShow': false
        })
        return false
      }
      return true
    })

  },

  hideGroupPicker: function () { this.setData({ isGroupPickerShow: false }) },

  showMyGroups: async function () {
    this.getGroupsAndColumns()
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
      message: '感恩有你们，版本' + app.globalData.version,
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