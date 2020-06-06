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
    targetAddress: {
      _id: '',
      recipient: '',
      telNumber: '',
      fullAddr: '',
      postalCode: '',

      recipientErr: '',
      telErr: '',
      addrErr: '',
      codeErr: ''
    },

    uploadingLock: false,
    removeLock: false
  },
  
  onLoad: async function (options) {
    this.fetchAddresses()
  },

  fetchAddresses: async function() {
    this.fetchLoading = true
    var that = this
    await wx.cloud.callFunction({
      name: 'addressdbo',
      data: { action: 'queryAll' },
      success: res => {
        res = res.result
        that.setData({ addresses: res, loading: false })
      }
    })
    this.fetchLoading = false
  },

  clearTargetAddr: function () {
    this.setData({
      'targetAddress._id': '',
      'targetAddress.recipient': '',
      'targetAddress.telNumber': '',
      'targetAddress.fullAddr': '',
      'targetAddress.postalCode': '',
      'targetAddress.recipientErr': '',
      'targetAddress.telErr': '',
      'targetAddress.addrErr': '',
      'targetAddress.codeErr': ''
    })
  },

  clearAddrErr: function () {
    this.setData({
      'targetAddress.recipientErr': '',
      'targetAddress.telErr': '',
      'targetAddress.addrErr': '',
      'targetAddress.codeErr': ''
    })
  },

  changeAddress: async function(e) {
    this.clearTargetAddr()

    var addressId = e.currentTarget.id.substring(2)
    var addressList = this.data.addresses
    for (var i = addressList.length - 1; i >= 0; i--) {
      if (addressList[i]._id === addressId) {
        this.setData({
          'targetAddress._id': addressId,
          'targetAddress.recipient': addressList[i].recipient,
          'targetAddress.telNumber': addressList[i].telNumber,
          'targetAddress.fullAddr': addressList[i].fullAddr,
          'targetAddress.postalCode': addressList[i].postalCode,
          isPanelShow: true
        })
      }
    }
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
            that.onLoad()
          },
          fail: res => {
            Notify({ type: 'error', message: '删除失败' });
          }
        })
      }).catch(() => {
        Dialog.close();
      });
    } else {
      Notify({ type: 'warning', message: '无法删除唯一地址记录' });
    }
    
    that.data.removeLock = false
  },

  clickAddress: async function (e) {
    var that = this
    var addressId = e.currentTarget.id

    await wx.cloud.callFunction({
      name: 'addressdbo',
      data: { action: 'toCurrent', _id: addressId },
      success: res => {
        var addresses = that.data.addresses
        for (var i = 0; i < addresses.length; i++) {
          if (addresses[i].current && addresses[i]._id === addressId) return
          addresses[i].current = false
        }
        for (var i = 0; i < addresses.length; i++) {
          if (addresses[i]._id === addressId) {
            addresses[i].current = true
            app.globalData.userInfo.fullAddr = addresses[i].fullAddr
            break
          }
        }
        that.setData({ addresses: addresses })
      },
      fail: res => {
        Notify({ type: 'error', message: '修改主地址失败' });
      }
    })
  },

  onImportManualAddr: function () {
    this.clearTargetAddr()
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
    wx.cloud.callFunction({
      name: 'addressdbo',
      data: {
        action: that.data.targetAddress._id == '' ? 'insert' : 'update',
        _id: that.data.targetAddress._id,
        postalCode: that.data.targetAddress.postalCode,
        telNumber: that.data.targetAddress.telNumber,
        recipient: that.data.targetAddress.recipient,
        fullAddr: that.data.targetAddress.fullAddr,
        current: current
      },
    }).then(() => {
      that.data.uploadingLock = false
    })
  },

  onImportWechatAddr: function() {
    var that = this
    wx.getSetting().then(res => {
      if (res.authSetting['scope.address'] === undefined) {
        wx.chooseAddress({
          success: () => { that.importWechatAddr() },
          fail: () => { that.openConfirm() }
        })
      } else if (res.authSetting['scope.address']) {
        that.importWechatAddr()
      } else {
        that.openConfirm()
      }
    })
  },

  importWechatAddr: function () {
    var that = this
    wx.chooseAddress({
      success: addr => {
        that.data.targetAddress.recipient = addr.userName
        that.data.targetAddress.telNumber = addr.telNumber
        that.data.targetAddress.fullAddr = addr.provinceName + addr.cityName + addr.countyName + addr.detailInfo
        that.data.targetAddress.postalCode = addr.postalCode
        that.uploadAddress()
        that.onLoad()
      }
    })
  },

  inputAddrRecipient: function (value) {
    this.data.targetAddress.recipient = value.detail
  },

  inputAddrNumber: function (value) {
    this.data.targetAddress.telNumber = value.detail
  },

  inputAddrFull: function (value) {
    this.data.targetAddress.fullAddr = value.detail
  },

  inputAddrCode: function (value) {
    this.data.targetAddress.postalCode = value.detail
  },

  checkAddress: async function () {
    this.clearAddrErr()

    var errorFlag = false
    var targetAddr = this.data.targetAddress
    if (targetAddr.recipient.trim() === '') {
      this.setData({ 'targetAddress.recipientErr': '请输入联系人' })
      errorFlag = true
    }
    if (targetAddr.telNumber.trim() === '') {
      this.setData({ 'targetAddress.telErr': '请输入手机号码' })
      errorFlag = true
    }
    if (targetAddr.fullAddr.trim() === '') {
      this.setData({ 'targetAddress.addrErr': '请输入详细地址' })
      errorFlag = true
    }
    if (targetAddr.postalCode.trim() === '') {
      this.setData({ 'targetAddress.codeErr': '请输入邮政编码' })
      errorFlag = true
    }
    
    if (errorFlag) return
    this.uploadAddress()
    this.setData({ isPanelShow: false })
    this.clearTargetAddr()
    this.onLoad()
  },

  openConfirm: function () {
    Dialog.confirm({
      message: '检测到您没打开地址权限，是否去设置打开？',
      confirmButtonOpenType: 'openSetting'
    }).catch(() => {
      Dialog.close();
    });
  },

  onPullDownRefresh() {
    if (!this.fetchLoading) {
      this.fetchAddresses().then(() => {
        wx.stopPullDownRefresh()
      })
    }
  },
})