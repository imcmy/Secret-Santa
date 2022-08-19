// pages/launch/launch.js
// Loading the necessary information
const app = getApp()
import * as utils from "../../utils/utils"

Page({
    data: {},
    onLoad(options) {
        this.launchLogin()
    },
    async launchLogin() {
        if (!app.globalData.openid)
            await this.loginRequest()

        if (!app.globalData.openid) {
            wx.redirectTo({
                url: '/pages/critical_error/critical_error'
            })
            return
        }

        try {
            let sysInfo = wx.getSystemInfoSync()
            app.globalData.theme = sysInfo.theme
            let followSys = wx.getStorageSync('followSys')
            if (followSys === '') {
                followSys = true
                wx.setStorageSync('followSys', followSys)
            }
            app.globalData.followSys = followSys
            let themeBg = wx.getStorageSync('themeBg')
            if (themeBg === '') {
                themeBg = 'green'
                wx.setStorageSync('themeBg', themeBg)
            }
            app.globalData.themeBg = themeBg
        } catch (e) {
            console.log(e)
            return
        }

        let userQuery = await utils.syncRequest('/users', {
            action: 'query'
        })
        let userData = userQuery.data
        if (userData.length === 0) {
            wx.switchTab({
                url: '/pages/index/index'
            })
            return
        }
        app.globalData.userInfo = userData[0]
        app.globalData.userInfo.avatar = `${wx.env.USER_DATA_PATH}` + '/avatar.png'
        
        let addressQuery = await utils.syncRequest('/addresses', {
            action: 'queryIndexPage'
        })
        let addressData = addressQuery.data
        if (addressData.length == 0) {
            wx.switchTab({
                url: '/pages/user/user'
            })
            return
        }
        app.globalData.userInfo.fullAddr = addressData[0].fullAddr

        wx.switchTab({
            url: '/pages/index/index'
        })
    },
    loginRequest() {
        return new Promise(function (resolve, reject) {
            wx.login({
                success(res) {
                    utils.syncRequest('/login', {
                        code: res.code
                    }).then(res => {
                        app.globalData.openid = res.data.openid
                        app.globalData.session_key = res.data.session_key
                        resolve(res)
                    }).catch(e => {
                        reject(e)
                    })
                }
            })
        })
    }
})