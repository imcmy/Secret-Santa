//index.js
const app = getApp()
var util = require('../../utils/utils.js')


Page({
  data: {
    avatarUrl: '',
    nickName: '',
    addressInfo: '',
    logged: false,

    event: {}
  },

  onLoad: function() {
    var that = this

    if (!wx.cloud) {
      wx.showModal({
        content: '请使用 2.2.3 或以上的基础库以使用云能力',
        showCancel: false,
      })
      return
    }

    if (!app.globalData.openid) {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          app.globalData.openid = res.result.openid
        }
      })
    }

    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: userInfo => {
              wx.cloud.callFunction({
                name: 'userdbo',
                data: {action: 'loc'},
                success: res => {
                  var data = res.result.data
                  if (data.length !== 0) {
                    app.globalData.userInfo = data[0]
                    
                    that.setData({
                      logged: true,
                      avatarUrl: data[0].avatarUrl,
                      nickName: data[0].nickName,
                      addressInfo: data[0].fullAddr
                    })

                    wx.cloud.callFunction({
                      name: 'eventdbo',
                      data: { "action": "get" },
                      success: res => {
                        that.setData({ event: res.result })
                      }
                    })
                  } else {
                    wx.chooseAddress({
                      success: addr => {
                        wx.cloud.callFunction({
                          name: 'userdbo',
                          data: {
                            action: 'ins',
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
                          success: res => {
                            that.onLoad()
                            return
                          }
                        })
                      }, fail: function () {
                        that.openConfirm()
                        return
                      }
                    })
                  }
                }
              })
            }
          })
        }
      }
    })
  },

  onGetUserInfo: function(e) {
    if (e.detail.userInfo) {
      this.onLoad()
    }
  },

  openConfirm: function () {
    wx.showModal({
      content: '检测到您没打开地址权限，是否去设置打开？',
      confirmText: "确认",
      cancelText: "取消",
      success: function (res) {
        if (res.confirm) {
          wx.openSetting({
            success: (res) => { }   //打开设置面板
          })
        }
      }
    });
  },

  onTapUser: function () {
    wx.navigateTo({
      url: '../user/user',
    })
  },

  onShareAppMessage: function() {
    
  }
})
