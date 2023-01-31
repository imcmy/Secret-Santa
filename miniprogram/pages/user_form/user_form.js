import {
    syncRequest
} from '../../utils/requests'
import {
    getLoginCode,
    storeSession
} from '../../utils/states'
import * as utils from "../../utils/utils"

const app = getApp().globalData
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'


Page({
    data: {
        theme: 'light',
        isReg: true,

        avatarUrl: defaultAvatarUrl,
        nickname: '',
        address: '',
        isAgree: false,

        addresses: {
            show: false,
            lists: [],
            errors: {
                nickname: false,
                address: false,
                agree: false
            }
        },

        inputEditorId: '',
        inputEditorRecipient: '',
        inputEditorTel: '',
        inputEditorAddr: '',
        inputEditorPos: '',
        editor: {
            show: false,
            errors: {
                recipient: false,
                tel: false,
                addr: false,
                pos: false
            }
        }
    },

    onLoad(options) {
        var that = this
        wx.onThemeChange((e) => {
            if (e.theme) {
                that.setData({
                    theme: e.theme
                })
                app.theme = e.theme
            }
        })
    },
    onShow() {
        if (!app.user)
            return

        this.setData({
            theme: app.theme,
            avatarUrl: app.user.avatar,
            nickname: app.user.nickname,
            address: app.user.fullAddr,
            'addresses.lists': app.user.addresses,
            isReg: false
        })
    },

    // User detail input and button handler
    onChooseAvatar(e) {
        const {
            avatarUrl
        } = e.detail
        this.setData({
            avatarUrl
        })
    },
    onAgree(e) {
        this.setData({
            isAgree: !this.data.isAgree
        })
    },
    onUserCancel() {
        wx.navigateBack()
    },
    async onUserSubmit(e) {
        let localData = this.data
        let avatarUrl = this.data.avatarUrl
        let errors = this.data.addresses.errors

        errors.nickname = (e.detail.value.nickname === '')
        errors.address = this.data.address === ''
        errors.agree = this.data.isReg && !this.data.isAgree

        this.setData({
            'addresses.errors.nickname': errors.nickname,
            'addresses.errors.address': errors.address,
            'addresses.errors.agree': errors.agree
        })
        if (errors.nickname || errors.address || errors.agree)
            return

        wx.showLoading({
            title: "信息更新中"
        })
        if (avatarUrl !== defaultAvatarUrl) {
            wx.compressImage({
                src: avatarUrl,
                compressedWidth: 200,
                success(res) {
                    utils.storeImage(res.tempFilePath, '/avatar.png')
                },
                fail() {
                    wx.hideLoading()
                    wx.showToast({
                        title: '头像录入失败',
                        icon: 'error'
                    })
                    exit(1)
                }
            })
        }

        var params = {
            nickname: e.detail.value.nickname,
            addresses: localData.addresses.lists
        }

        if (localData.isReg) {
            try {
                let code = await getLoginCode()
                params.platform = app.platform
                params.code = code.code
                params.action = 'insert'
            } catch (err) {
                console.log(err);
            }
        } else {
            params.action = 'update'
        }

        syncRequest('/users', params)
            .then((session) => {
                wx.hideLoading()
                wx.showToast({
                    title: '操作成功',
                    icon: 'success'
                })
                if (localData.isReg) {
                    storeSession(session)
                    wx.reLaunch({
                        url: '/pages/launch/launch',
                    })
                } else {
                    app.user.nickname = localData.nickname
                    app.user.addresses = localData.addresses.lists
                    app.user.avatar = `${wx.env.USER_DATA_PATH}` + '/avatar.png'
                    getApp().syncFullAddr()
                    utils.delayBack(2000)
                }
            }).catch((e) => {
                wx.hideLoading()
                if (e.data.errCode === 0x11) {
                    wx.showToast({
                        title: '您已注册',
                        icon: 'error'
                    })
                } else if (e.data.errCode === 0x4) {
                    wx.showToast({
                        title: '昵称未通过内容安全检测',
                        icon: 'error'
                    })
                } else {
                    wx.showToast({
                        title: '未知错误',
                        icon: 'error'
                    })
                }
            })
    },

    // Address UI handler
    onAddrDialogShow(e) {
        this.setData({
            'addresses.show': true
        })
    },
    onAddrDialogHide(e) {
        this.setData({
            'addresses.show': false
        })
    },
    onAddrImport(e) {
        var that = this
        wx.chooseAddress({
            success: async addr => {
                that.data.inputEditorRecipient = addr.userName
                that.data.inputEditorTel = addr.telNumber
                that.data.inputEditorAddr = addr.provinceName + addr.cityName + addr.countyName + addr.detailInfo
                that.data.inputEditorPos = addr.postalCode
                that.uploadAddress()
            },
            fail: errMsg => {}
        })
    },
    onAddrManual(e) {
        this.setData({
            'editor.show': true
        })
    },
    onAddrChange(e) {
        let addressList = this.data.addresses.lists
        let id = e.currentTarget.id
        for (var i = 0; i < addressList.length; i++) {
            if (addressList[i]._id === id) {
                this.setData({
                    inputEditorId: addressList[i]._id,
                    inputEditorRecipient: addressList[i].recipient,
                    inputEditorTel: addressList[i].telNumber,
                    inputEditorAddr: addressList[i].fullAddr,
                    inputEditorPos: addressList[i].postalCode,
                    'editor.show': true
                })
                return
            }
        }
    },
    onAddrRemove(e) {
        let addressList = this.data.addresses.lists
        if (this.data.addresses.lists.length <= 1) {
            wx.showToast({
                title: '删除失败',
                icon: 'error'
            })
            return
        }

        let id = e.currentTarget.id
        var i = 0,
            current = false;
        for (; i < addressList.length; i++) {
            if (addressList[i]._id === id) {
                current = addressList[i].current
                break
            }
        }
        addressList.splice(i, 1)

        if (current) {
            addressList[0].current = true
            this.setData({
                address: addressList[0].fullAddr
            })
        }
        this.setData({
            'addresses.lists': addressList
        })
    },
    onAddrClick(e) {
        var that = this
        let addressId = e.currentTarget.id
        let addressList = this.data.addresses.lists

        for (let i = 0; i < addressList.length; i++) {
            if (addressList[i]._id === addressId) {
                addressList[i].current = true
                this.data.address = addressList[i].fullAddr
            } else {
                addressList[i].current = false
            }
        }
        this.setData({
            address: that.data.address,
            'addresses.lists': that.data.addresses.lists
        })
    },

    onEditorDialogHide(e) {
        this.setData({
            'editor.show': false
        })
    },
    onEditorSubmit(e) {
        let data = this.data
        let errors = data.editor.errors

        errors.recipient = data.inputEditorRecipient === ''
        errors.tel = data.inputEditorTel === ''
        errors.addr = data.inputEditorAddr === ''
        errors.pos = data.inputEditorPos === ''

        this.setData({
            'editor.errors.recipient': errors.recipient,
            'editor.errors.tel': errors.tel,
            'editor.errors.addr': errors.addr,
            'editor.errors.pos': errors.pos
        })
        if (errors.recipient || errors.tel || errors.addr || errors.pos)
            return

        this.uploadAddress()
        this.onEditorDialogHide()
    },

    // Input validator 
    uploadAddress: function () {
        let that = this
        let isCurrent = this.data.addresses.lists.length == 0
        if (this.data.inputEditorId === '') {
            this.data.addresses.lists.push({
                _id: utils.uuid(),
                postalCode: this.data.inputEditorPos,
                telNumber: this.data.inputEditorTel,
                recipient: this.data.inputEditorRecipient,
                fullAddr: this.data.inputEditorAddr,
                current: isCurrent
            })
        } else {
            for (var addr of this.data.addresses.lists) {
                if (addr._id === this.data.inputEditorId) {
                    addr.postalCode = this.data.inputEditorPos,
                        addr.telNumber = this.data.inputEditorTel,
                        addr.recipient = this.data.inputEditorRecipient,
                        addr.fullAddr = this.data.inputEditorAddr
                    isCurrent = addr.current
                    break
                }
            }
        }
        this.setData({
            address: isCurrent ? that.data.inputEditorAddr : that.data.address,
            'addresses.lists': that.data.addresses.lists,
            'inputEditorId': '',
            'inputEditorRecipient': '',
            'inputEditorTel': '',
            'inputEditorAddr': '',
            'inputEditorPos': ''
        })
    }
})