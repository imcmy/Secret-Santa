import {
    syncRequest
} from '../../utils/requests'

const app = getApp().globalData

Page({
    data: {
        idx: -1,
        wishlist: [],

        popup: false,

        nameField: '',
        commentField: '',
        nameError: false
    },
    onLoad(options) {
    },
    onShow() {
        if (!app.user)
            return
        this.setData({
            wishlist: app.user.wishlist
        })
    },
    onUnload() {
        app.user.wishlist = this.data.wishlist
        syncRequest('/users', {
            action: 'wish',
            wishlist: app.user.wishlist
        })
    },

    onCreateWish() {
        this.setData({
            idx: -1,
            nameField: '',
            commentField: '',
            nameError: false,
            popup: true
        })
    },
    onPopupHide() {
        this.setData({
            popup: false
        })
    },
    onPopupSubmit() {
        let localData = this.data

        localData.nameError = (localData.nameField === '')

        this.setData({
            nameError: localData.nameError
        })
        if (localData.nameError)
            return

        wx.showLoading({
            title: "信息更新中"
        })
        
        if (localData.idx == -1)
            localData.wishlist.push({
                name: localData.nameField,
                comment: localData.commentField
            })
        else {
            localData.wishlist[localData.idx].name = localData.nameField,
            localData.wishlist[localData.idx].comment = localData.commentField
        }
            

        this.setData({
            nameField: '',
            commentField: '',
            wishlist: localData.wishlist,
            idx: -1,
            popup: false
        })

        wx.hideLoading()
    },

    onWishModify(e) {
        let index = parseInt(e.currentTarget.id)
        var that = this
        this.setData({
            idx: index,
            nameField: that.data.wishlist[index].name,
            commentField: that.data.wishlist[index].comment,
            popup: true
        })
    },
    onWishRemove(e) {
        let index = parseInt(e.currentTarget.id)
        var that = this
        this.data.wishlist.splice(index, 1);
        this.setData({
            wishlist: that.data.wishlist
        })
    },


    onWishDown(e) {
        let index = parseInt(e.currentTarget.id)
        if (index === this.data.wishlist.length - 1)
            return
        var that = this
        var temp = this.data.wishlist[index]
        this.data.wishlist[index] = this.data.wishlist[index + 1]
        this.data.wishlist[index + 1] = temp
        this.setData({
            wishlist: that.data.wishlist
        })
    },
    onWishUp(e) {
        let index = parseInt(e.currentTarget.id)
        if (index === 0)
            return
        var that = this
        var temp = this.data.wishlist[index]
        this.data.wishlist[index] = this.data.wishlist[index - 1]
        this.data.wishlist[index - 1] = temp
        this.setData({
            wishlist: that.data.wishlist
        })
    }
})