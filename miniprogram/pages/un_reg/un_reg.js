// pages/un_reg/un_reg.js
const app = getApp()
import * as utils from "../../utils/utils"


Page({
    data: {
        theme: 'light'
    },
    onLoad(options) {
        var that = this
        wx.onThemeChange((e) => {
            if (e.theme) {
                that.setData({
                    theme: e.theme
                })
                app.globalData.theme = e.theme
            }
        })
    },
    onReady() {

    },
    onShow() {
        this.setData({
            theme: app.globalData.theme
        })
    },
    unReg: function () {
        wx.showModal({
            title: '输入"注销"进行注销',
            content: '',
            editable: true,
            async success(res) {
                if (res.confirm && res.content === '注销') {
                    let unRes = await utils.syncRequest('/users', {
                        action: 'unReg'
                    })
                    console.log(unRes)
                    if (unRes.data) {
                        wx.showToast({
                            title: '注销成功',
                            icon: 'success',
                            duration: 3000,
                            success() {
                                setTimeout(function () {
                                    wx.reLaunch({
                                        url: '../launch/launch',
                                    })
                                }, 3000)
                            }
                        })
                    } else {
                        wx.showToast({
                            title: '注销失败',
                            icon: 'error',
                            duration: 3000
                        })
                    }
                }
            }
        })
    },
    back() {
        wx.navigateBack({
          delta: 0,
        })
    }
})