import {
    syncRequest
} from '../../utils/requests'
import * as utils from "../../utils/utils"

Page({
    data: {
        icons: ["location-o", "like-o", "star-o", "phone-o", "setting-o", "fire-o", "coupon-o", "cart-o", "shopping-cart-o", "cart-circle-o", "friends-o", "comment-o", "gem-o", "gift-o", "point-gift-o", "send-gift-o", "service-o", "bag-o", "todo-list-o", "balance-list-o", "close", "clock-o", "question-o", "passed", "add-o", "gold-coin-o", "info-o", "play-circle-o", "pause-circle-o", "stop-circle-o", "warning-o", "phone-circle-o", "music-o", "smile-o", "thumb-circle-o", "comment-circle-o", "browsing-history-o", "underway-o", "more-o", "video-o", "shop-o", "shop-collect-o", "share-o", "chat-o", "smile-comment-o", "vip-card-o", "award-o", "diamond-o", "volume-o", "cluster-o", "wap-home-o", "photo-o", "gift-card-o", "expand-o", "medal-o", "good-job-o", "manager-o", "label-o", "bookmark-o", "bill-o", "hot-o", "hot-sale-o", "new-o", "new-arrival-o", "goods-collect-o", "eye-o", "delete-o", "font-o", "balance-o", "refund-o", "birthday-cake-o", "user-o", "orders-o", "tv-o", "envelop-o", "flag-o", "flower-o", "filter-o", "bar-chart-o", "chart-trending-o", "brush-o", "bullhorn-o", "hotel-o", "cashier-o", "newspaper-o", "warn-o", "notes-o", "calendar-o", "bulb-o", "user-circle-o", "desktop-o", "apps-o", "home-o", "back-top", "search", "points", "edit", "qr", "qr-invalid", "closed-eye", "down", "scan", "revoke", "free-postage", "certificate", "logistics", "contact", "cash-back-record", "after-sale", "exchange", "upgrade", "ellipsis", "description", "records", "sign", "completed", "failure", "ecard-pay", "peer-pay", "balance-pay", "credit-pay", "debit-pay", "cash-on-deliver", "other-pay", "tosend", "pending-payment", "paid", "aim", "discount", "idcard", "replay", "shrink", "shield-o", "guide-o"],

        popup: false,

        icon: '',
        name: '',
        description: '',
        token: '',
        allowCreate: false,
        errors: {
            icon: false,
            name: false,
            description: false,
            token: false
        }
    },

    onLoad(options) {

    },
    onShow() {

    },

    onIconsShow() {
        this.setData({
            popup: true
        })
    },
    onIconsHide() {
        this.setData({
            popup: false
        })
    },
    onChooseIcon(e) {
        let icon = e.currentTarget.id
        this.setData({
            icon: icon,
            popup: false
        })
    },

    onCreate(e) {
        let that = this
        let values = e.detail.value
        let errors = this.data.errors

        errors.icon = (values.icon === '')
        errors.name = (values.name === '')
        errors.token = (values.token === '')

        this.setData({
            'errors.icon': errors.icon,
            'errors.name': errors.name,
            'errors.token': errors.token
        })
        if (!Object.values(errors).every(e => e === false))
            return

        wx.showLoading({
            title: "组建小组中"
        })

        var params = values
        params.action = 'create'

        syncRequest('/groups', params)
            .then(() => {
                wx.hideLoading()
                wx.showToast({
                    title: '组建成功',
                    icon: 'success'
                })
                utils.delayBack(2000)
            }).catch((e) => {
                wx.hideLoading()
                if (e.data.errCode === 0x24) {
                    wx.showToast({
                        title: '名称或描述未通过内容安全检测',
                        icon: 'error'
                    })
                    this.setData({
                        'errors.icon': false,
                        'errors.name': true,
                        'errors.description': true,
                        'errors.token': false
                    })
                } else if (e.data.errCode === 0x23) {
                    wx.showToast({
                        title: '口令冲突，请更换口令',
                        icon: 'error'
                    })
                    this.setData({
                        'errors.icon': false,
                        'errors.name': false,
                        'errors.description': false,
                        'errors.token': true
                    })
                } else {
                    wx.showToast({
                        title: '未知错误',
                        icon: 'error'
                    })
                }
            })
    },

    onCancel() {
        wx.navigateBack()
    }
})
