// miniprogram/pages/address/address.js
const app = getApp()
var utils = require('../../utils/utils.js')
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog'
import Notify from '../../miniprogram_npm/@vant/weapp/notify/notify';

Page({
  data: {
    loading: true,
    addresses: [],

    isPanelShow: false,
    targetAddress: {},

    uploadingLock: false,
    removeLock: false
  },
  
  onLoad: async function (options) {
    this.fetchAddresses()
  },

  fetchAddresses: async function() {
    var that = this
    await wx.cloud.callFunction({
      name: 'addressdbo',
      data: { action: 'queryAll' },
      success: res => {
        res = res.result
        that.setData({ addresses: res, loading: false })
      }
    })
  },

  changeAddress: async function(e) {
    var addressId = e.currentTarget.id.substring(2)
    this.showPanel({})
  },

  removeAddress: async function(e) {
    if (this.data.removeLock) return
    this.data.removeLock = true

    var that = this
    var addressId = e.currentTarget.id.substring(2)
    if (this.data.addresses.length > 1) {
      Dialog.confirm({
        title: '删除确认',
        message: '请确认是否删除该地址'
      }).then(async () => {
        await wx.cloud.callFunction({
          name: 'addressdbo',
          data: { action: 'remove', _id: addressId },
          success: res => {
            that.data.removeLock = false
            that.onLoad()
          },
          fail: res => {
            that.data.removeLock = false
            Notify({ type: 'error', message: '删除失败' });
          }
        })
      }).catch(() => {
        Dialog.close();
      });
    } else {
      that.data.removeLock = false
      Notify({ type: 'warning', message: '无法删除唯一地址记录' });
    }
  },

  clickAddress: async function (e) {
    var that = this
    var addressId = e.currentTarget.id

    var addresses = this.data.addresses
    for (var i=0; i<addresses.length; i++) {
      if (addresses[i].current && addresses[i]._id === addressId) return
      addresses[i].current = false
    }
    for (var i=0; i<addresses.length; i++) {
      if (addresses[i]._id === addressId) {
        addresses[i].current = true
        break
      }
    }

    await wx.cloud.callFunction({
      name: 'addressdbo',
      data: { action: 'toCurrent', _id: addressId },
      success: res => {
        that.setData({
          addresses: addresses
        })
      },
      fail: res => {
        Notify({ type: 'error', message: '修改主地址失败' });
      }
    })
  },

  showPanel: function (targetAddr) {
    this.setData({ isPanelShow: true })
  },

  hidePanel: function () {
    this.setData({ isPanelShow: false })
  },

  uploadAddress: function () {
    if (this.data.uploadingLock) return
    this.data.uploadingLock = true
    
    var that = this
    var current = this.data.addresses.length == 0 
    wx.chooseAddress().then(addr => {
      wx.cloud.callFunction({
        name: 'addressdbo',
        data: {
          action: 'insert',
          provinceName: addr.provinceName,
          cityName: addr.cityName,
          countyName: addr.countyName,
          detailInfo: addr.detailInfo,
          postalCode: addr.postalCode,
          telNumber: addr.telNumber,
          recipient: addr.userName,
          current: current
        },
      }).then(() => {
        that.data.uploadingLock = false
        that.onLoad()
      })
    }).catch(e => {
      that.data.uploadingLock = false
      console.log(e)
    })
  },

  importWechatAddr: function() {
    var that = this
    wx.getSetting().then(res => {
      if (res.authSetting['scope.address'] === undefined) {
        wx.chooseAddress({
          success: () => { that.uploadAddress() },
          fail: () => { that.openConfirm() }
        })
      } else if (res.authSetting['scope.address']) {
        that.uploadAddress()
      } else {
        that.openConfirm()
      }
    })
  },

  openConfirm: function () {
    Dialog.confirm({
      message: '检测到您没打开地址权限，是否去设置打开？',
      confirmButtonOpenType: 'openSetting'
    }).catch(() => {
      Dialog.close();
    });
  },

  onReady: function () {

  },

  onShow: function () {

  },

  onHide: function () {

  },

  onUnload: function () {

  }
})