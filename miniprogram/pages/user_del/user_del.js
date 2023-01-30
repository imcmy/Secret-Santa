import {
    syncRequest
} from '../../utils/requests'

Page({
    onLoad(options) {},
    onShow() {},
    unReg: function () {
        wx.showModal({
            title: '输入"注销"进行注销',
            content: '',
            editable: true,
            async success(res) {
                if (res.confirm && res.content === '注销') {
                    try {
                        await syncRequest('/users', {
                            action: 'unreg'
                        })
                        getApp().clearAll()
                        wx.showToast({
                            title: '注销成功',
                            icon: 'success',
                            success() {
                                setTimeout(function () {
                                    wx.reLaunch({
                                        url: '../launch/launch',
                                    })
                                }, 1500)
                            }
                        })
                    } catch (e) {
                        console.log(e)
                        if (e.data.errCode === 0x13) {
                            wx.showToast({
                                title: '管理员无法注销',
                                icon: 'error'
                            })
                        } else {
                            wx.showToast({
                                title: '未知错误',
                                icon: 'error'
                            })
                        }
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