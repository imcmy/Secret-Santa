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

    isEventsShow: false,
    myEvents: []
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
      data: { action: 'searchIn' }
    })
    this.setData({
      myEvents: myEvents.result
    })
  },

  showCreateEvent: async function () {
    wx.showModal({
      content: '功能尚未实现',
      showCancel: false
    });
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