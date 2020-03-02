// miniprogram/pages/user/user.js
const app = getApp()
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl: '',
    nickName: '',
    addressInfo: '',
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

  updateUser: function () {
    var that = this
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo'] && res.authSetting['scope.address']) {
          wx.getUserInfo({
            success: userInfo => {
              wx.chooseAddress({
                success: addr => {
                  wx.cloud.callFunction({
                    name: 'userdbo',
                    data: {
                      action: 'upd',
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
                    },
                    success: res => {
                      wx.showModal({
                        content: '更新成功',
                        showCancel: false,
                        success: function (res) {
                          wx.reLaunch({
                            url: '../index/index',
                          })
                        }
                      });
                    }
                  })
                }
              })
            }
          })
        } else {
          that.openConfirm()
          return
        }
      }
    })
  },

  showAbout: function () {
    wx.showModal({
      content: '感恩有你们',
      showCancel: false
    });
  },

  openConfirm: function () {
    wx.showModal({
      content: '检测到您没打开权限，是否去设置打开？',
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
})