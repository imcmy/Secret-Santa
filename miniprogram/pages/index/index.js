//index.js
const app = getApp()
var util = require('../../utils/utils.js')
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'


Page({
  data: {
    avatarUrl: '',
    nickName: '',
    addressInfo: '',
    logged: false,
    event: {}
  },

  onLoad: async function() {
    if (!wx.cloud) {
      wx.showModal({
        content: '请使用 2.2.3 或以上的基础库以使用云能力',
        showCancel: false,
      })
      return
    }

    if (!app.globalData.openid) {
      var login = await wx.cloud.callFunction({
        name: 'login',
        data: {}
      })
      app.globalData.openid = login.result.openid
    }
    
    if (app.globalData.openid) {
      var that = this
      var res = await wx.cloud.callFunction({
        name: 'userdbo',
        data: { action: 'query' }
      })
      var data = res.result
      if (data.length !== 0) {
        app.globalData.userInfo = data[0]
        that.setData({
          logged: true,
          avatarUrl: data[0].avatarUrl,
          nickName: data[0].nickName,
          addressInfo: data[0].fullAddr
        })
        that.fetchEvents()
      }
    }
  },

  uploadAddress: function(userInfo) {
    var that = this
    wx.chooseAddress().then(addr => {
      wx.cloud.callFunction({
        name: 'userdbo',
        data: {
          action: 'insert',
          nickName: userInfo.userInfo.nickName,
          avatarUrl: userInfo.userInfo.avatarUrl,
          provinceName: addr.provinceName,
          cityName: addr.cityName,
          countyName: addr.countyName,
          detailInfo: addr.detailInfo,
          postalCode: addr.postalCode,
          telNumber: addr.telNumber,
          recipient: addr.userName,
        },
      }).then(() => {
        // wx.reLaunch({ url: '../index/index', })
        that.onLoad()
      })
    }).catch(err => {
      that.openConfirm()
    })
  },

  onGetUserInfo: function(e) {
    var that = this
    if (e.detail.userInfo) {
      wx.getSetting().then(res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo().then(userInfo => {
            that.uploadAddress(userInfo)
          })
        }
      })
    }
  },

  openConfirm: function () {
    Dialog.confirm({
      message: '检测到您没打开地址权限，是否去设置打开？',
      confirmButtonOpenType: 'openSetting'
    }).catch(() => {
      Dialog.close();
    });
  },

  onTapUser: function () {
    wx.navigateTo({
      url: '../user/user',
    })
  },

  onShareAppMessage: function() {},

  fetchEvents: function() {
    this.loading = true

    return wx.cloud.callFunction({
      name: 'eventdbo',
      data: { 'action': 'list' }
    }).then(res => {
      this.setData({ event: res.result })
      this.loading = false
    })
  },

  onPullDownRefresh() {
    if (!this.loading) {
      this.fetchEvents().then(() => {
        wx.stopPullDownRefresh()
      })
    }
  },
})
