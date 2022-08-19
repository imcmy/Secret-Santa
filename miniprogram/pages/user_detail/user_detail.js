const app = getApp()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'
import * as utils from "../../utils/utils"


Page({
    data: {
        theme: 'light',
        avatarUrl: defaultAvatarUrl,
        nickName: '',
        address: '',
        isAgree: false,
        isReg: true,

        addresses: {
            lists: [],
            dialogButtons: [{
                    type: 'primary',
                    text: '微信导入',
                },
                {
                    type: 'default',
                    text: '手动新增'
                }
            ],
            show: false,
            loaded: false,
            maskClosable: true,
            uploadingLock: false,
            removeLock: false
        },
        targetAddress: {
            _id: '',
            show: false,
            formData: {
                recipient: '',
                telNumber: '',
                fullAddr: '',
                postalCode: ''
            },
            dialogButtons: [{
                    type: 'default',
                    text: '取消',
                },
                {
                    type: 'primary',
                    text: '确认'
                }
            ],
            rules: [{
                name: 'recipient',
                rules: {
                    required: true,
                    message: '请填写收件人'
                }
            }, {
                name: 'telNumber',
                rules: {
                    required: true,
                    message: '请填写收货手机号'
                }
            }, {
                name: 'fullAddr',
                rules: {
                    required: true,
                    message: '请填写规范地址'
                }
            }, {
                name: 'postalCode',
                rules: {
                    required: true,
                    message: '请填写邮政编码'
                }
            }],
            showError: {
                recipient: false,
                telNumber: false,
                fullAddr: false,
                postalCode: false
            }
        },

        canvasW: 0,
        canvasH: 0
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
        if (app.globalData.userInfo && !app.globalData.userInfo.unReg) {
            this.setData({
                theme: app.globalData.theme,
                avatarUrl: app.globalData.userInfo.avatar,
                nickName: app.globalData.userInfo.nickName,
                address: app.globalData.userInfo.fullAddr,
                isReg: false
            })
        } else {
            this.setData({
                theme: app.globalData.theme
            })
        }
        this.fetchAddresses()
    },
    onReady() {},
    onShow() {},
    onHide() {},
    onUnload() {},

    // User detail input and button handler
    onChooseAvatar(e) {
        const {
            avatarUrl
        } = e.detail
        this.setData({
            avatarUrl
        })
    },
    bindNicknameChange(e) {
        this.setData({
            nickName: e.detail.value
        })
        console.log(this.data.nickName)
    },
    bindAgreeChange(e) {
        if (e.detail.value[0] === "agree") {
            this.setData({
                isAgree: true
            })
        } else {
            this.setData({
                isAgree: false
            })
        }
    },
    async bindCancel() {
        this.delayNavigate(0)
    },
    async bindSubmit(e) {
        var avatarStorage = this.data.avatarUrl
        if (!this.data.isReg || this.data.isAgree) {
            wx.showToast({
                title: "信息更新中",
                icon: 'loading'
            })
            this.preProcessAvatar(avatarStorage)
            wx.hideToast()
            this.delayNavigate(2000)
        } else {
            wx.showToast({
                title: '请同意后再注册',
                icon: 'error'
            })
        }
    },
    delayNavigate(delay) {
        setTimeout(() => {
            var pages = getCurrentPages()
            var prevPage = pages[pages.length - 2]
            wx.navigateBack({
                success: () => {
                    prevPage.onLoad()
                }
            })
        }, delay)
    },

    // User detail opearting helper 
    async commitUser() {
        var localData = this.data
        if (localData.isReg) {
            await utils.syncRequest('/users', {
                openid: app.globalData.openid,
                action: 'insert',
                nickName: localData.nickName
            })
        } else {
            await utils.syncRequest('/users', {
                _id: app.globalData.userInfo._id,
                action: 'update',
                nickName: localData.nickName
            })
        }
        wx.showToast({
            title: '操作成功',
            icon: 'success'
        })
    },

    // Avatar processing helper
    async preProcessAvatar(imgPath) {
        var that = this
        var maxSize = 256
        var imageInfo = await wx.getImageInfo({
            src: imgPath
        })
        var imgWidth = imageInfo.width
        var imgHeight = imageInfo.height
        if (imgWidth > maxSize || imgHeight > maxSize) {
            if (imgWidth / imgHeight > 1) {
                imgWidth = maxSize;
                imgHeight = Math.round(maxSize * (imgHeight / imageInfo.width));
            } else {
                imgWidth = Math.round(maxSize * (imgWidth / imageInfo.height));
                imgHeight = maxSize;
            }

            this.setData({
                canvasW: imgWidth,
                canvasH: imgHeight
            });

            wx.createSelectorQuery()
                .select('#avatar-crop')
                .fields({
                    node: true,
                    size: true
                })
                .exec(async (res) => {
                    const canvas = res[0].node
                    canvas.width = imgWidth
                    canvas.height = imgHeight
                    const ctx = canvas.getContext('2d')
                    ctx.clearRect(0, 0, imgWidth, imgHeight)
                    const imagePromise = new Promise((resolve, reject) => {
                        const image = canvas.createImage()
                        image.src = imgPath
                        image.onload = () => {
                            ctx.drawImage(image, 0, 0, imgWidth, imgHeight)
                            resolve()
                        }
                        image.onerror = () => {
                            reject()
                        }
                    })
                    imagePromise.then(async () => {
                        var tempFile = await wx.canvasToTempFilePath({
                            canvas: canvas
                        })
                        that.storeAvatar(tempFile.tempFilePath)
                    })
                })
        }
        this.storeAvatar(imgPath)
    },
    async storeAvatar(imgPath) {
        var that = this
        utils.storeImage(imgPath, '/avatar.png')
            .then(async () => {
                await that.commitUser()
            }).catch((e) => {
                wx.showToast({
                    title: '头像录入失败',
                    icon: 'error'
                })
            })
    },

    // Address UI handler
    showAddressDialog(e) {
        this.setData({
            'addresses.show': true
        })
    },
    addrTap(e) {
        if (e.detail.index == 0) {
            var that = this
            wx.chooseAddress({
                success: async addr => {
                    that.data.targetAddress.formData.recipient = addr.userName
                    that.data.targetAddress.formData.telNumber = addr.telNumber
                    that.data.targetAddress.formData.fullAddr = addr.provinceName + addr.cityName + addr.countyName + addr.detailInfo
                    that.data.targetAddress.formData.postalCode = addr.postalCode
                    await that.uploadAddress()
                    await that.fetchAddresses()
                }
            })
        } else {
            this.setData({
                'targetAddress.show': true,
                'addresses.maskClosable': false
            })
        }
    },
    async clickAddress(e) {
        var that = this
        let addressId = e.currentTarget.id
        let addressList = this.data.addresses.lists

        for (var i = 0; i < addressList.length; i++)
            if (addressList[i].current && addressList[i]._id === addressId) return

        await utils.syncRequest('/addresses', {
            action: 'toCurrent',
            _id: addressId
        }).then(() => {
            for (let i = 0; i < addressList.length; i++) {
                if (addressList[i]._id === addressId) {
                    addressList[i].current = true
                    app.globalData.userInfo.fullAddr = addressList[i].fullAddr
                    break
                } else {
                    addressList[i].current = false
                }
            }
            that.setData({
                address: app.globalData.userInfo.fullAddr,
                'addresses.show': false
            })
            that.fetchAddresses()
        }).catch(() => {
            wx.showToast({
                title: '修改主地址失败',
                icon: 'error'
            })
        })
    },

    // Addresses operation helpers
    fetchAddresses: async function () {
        this.fetchLoading = true
        this.setData({
            'addresses.loaded': false
        })
        let addresses = await utils.syncRequest('/addresses', {
            openid: app.globalData.openid,
            action: 'queryAll'
        })
        for (let addr of addresses.data) {
            addr.slideButtons = [{
                    type: 'default',
                    text: '修改',
                    data: addr._id
                },
                {
                    type: 'warn',
                    text: '删除',
                    data: addr._id
                }
            ];
            if (addr.current) {
                if (!app.globalData.userInfo)
                    app.globalData.userInfo = {unReg: true}
                app.globalData.userInfo.fullAddr = addr.fullAddr
            }
        }
        this.setData({
            'addresses.lists': addresses.data,
            'addresses.loaded': true,
            address: addresses.data.length ? app.globalData.userInfo.fullAddr : ''
        })
        this.fetchLoading = false
    },
    operateAddress(e) {
        var that = this
        var addressId = e.detail.data

        if (e.detail.index == 0) {
            this.clearTargetAddr()
            var addressList = this.data.addresses.lists
            for (var i = addressList.length - 1; i >= 0; i--) {
                if (addressList[i]._id === addressId) {
                    this.setData({
                        'targetAddress._id': addressId,
                        'targetAddress.formData.recipient': addressList[i].recipient,
                        'targetAddress.formData.telNumber': addressList[i].telNumber,
                        'targetAddress.formData.fullAddr': addressList[i].fullAddr,
                        'targetAddress.formData.postalCode': addressList[i].postalCode,
                        'targetAddress.show': true,
                        'addresses.maskClosable': false
                    })
                }
            }
        } else {
            if (this.data.addresses.lists.length <= 1 && !this.data.isReg) {
                wx.showToast({
                    title: '删除失败',
                    icon: 'error'
                })
                return
            }

            if (this.data.addresses.removeLock) return
            this.data.addresses.removeLock = true
            wx.showModal({
                content: '确认是否删除该地址',
                async success(res) {
                    if (res.confirm) {
                        wx.showLoading({
                            title: '删除中',
                        })
                        await utils.syncRequest('/addresses', {
                            action: 'remove',
                            _id: addressId
                        }).then(async () => {
                            wx.hideLoading()
                            await that.fetchAddresses()
                        }).catch((e) => {
                            wx.hideLoading()
                            wx.showToast({
                                title: '删除失败',
                                icon: 'error'
                            })
                        })
                    }
                }
            })
            this.data.addresses.removeLock = false
        }
    },

    // Input validator 
    inputAddrRecipient(e) {
        this.data.targetAddress.formData.recipient = e.detail.value
    },
    inputAddrNumber(e) {
        this.data.targetAddress.formData.telNumber = e.detail.value
    },
    inputAddrFull(e) {
        this.data.targetAddress.formData.fullAddr = e.detail.value
    },
    inputAddrCode(e) {
        this.data.targetAddress.formData.postalCode = e.detail.value
    },
    clearTargetAddr: function () {
        this.setData({
            'targetAddress._id': '',
            'targetAddress.formData.recipient': '',
            'targetAddress.formData.telNumber': '',
            'targetAddress.formData.fullAddr': '',
            'targetAddress.formData.postalCode': ''
        })
    },

    uploadAddress: async function () {
        if (this.data.addresses.uploadingLock) return
        let that = this
        let current = this.data.addresses.lists.length == 0

        this.data.addresses.uploadingLock = true
        wx.showLoading({
            title: '上传中',
        })
        await utils.syncRequest('/addresses', {
            _id: that.data.targetAddress._id,
            action: that.data.targetAddress._id == '' ? 'insert' : 'update',
            postalCode: that.data.targetAddress.formData.postalCode,
            telNumber: that.data.targetAddress.formData.telNumber,
            recipient: that.data.targetAddress.formData.recipient,
            fullAddr: that.data.targetAddress.formData.fullAddr,
            current: current
        }).then(() => {
            wx.hideLoading()
        }).catch(() => {
            wx.hideLoading()
            wx.showToast({
                title: '新增失败',
                icon: 'error'
            })
        })
        that.data.addresses.uploadingLock = false
    },
    targetAddrTap(e) {
        var that = this
        if (e.detail.index == 0) {
            this.setData({
                'targetAddress.show': false,
                'addresses.maskClosable': true
            })
        } else {
            this.setData({
                [`targetAddress.formData.recipient`]: that.data.targetAddress.formData.recipient,
                [`targetAddress.formData.telNumber`]: that.data.targetAddress.formData.telNumber,
                [`targetAddress.formData.fullAddr`]: that.data.targetAddress.formData.fullAddr,
                [`targetAddress.formData.postalCode`]: that.data.targetAddress.formData.postalCode
            })
            this.selectComponent('#form')
                .validate(async (valid, errors) => {
                    if (valid) {
                        await that.uploadAddress()
                        that.setData({
                            'targetAddress.show': false,
                            'addresses.maskClosable': true
                        })
                        await that.fetchAddresses()
                        that.clearTargetAddr()
                    }
                })
        }
    },
    targetAddrClose(e) {
        this.setData({
            'addresses.maskClosable': true
        })
    }
})