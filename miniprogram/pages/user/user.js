// miniprogram/pages/user/user.js
const app = getApp()
import * as utils from "../../utils/utils"


Page({

    /**
     * 页面的初始数据
     */
    data: {
        theme: 'light',
        themeBg: 'green',
        avatarUrl: '',
        nickName: '',
        addressInfo: '',

        isCreateShow: false,
        isDatePickerShow: false,

        prefs: {
            show: false,
            themeRed: false,
            themeGreen: false,

            darkModeSwitch: false,
            darkFollowSysSwitch: false
        },

        newEvent: {
            show: false,
            formData: {
                eventName: '',
                eventGroup: '',
                eventGroupID: '',
                eventStart: 0,
                eventStartFormatted: '',
                eventRoll: 0,
                eventRollFormatted: '',
                eventEnd: 0,
                eventEndFormatted: '',
                eventDescription: '',
            },
            dialogButtons: [{
                    type: 'default',
                    text: '取消',
                },
                {
                    type: 'primary',
                    text: '创建'
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
            },
            dateFlag: -1,
            minDate: utils.nextOKTime(),
            uploadLock: false
        },
        filter(type, options) {
            return type === 'minute' ? options.filter(option => option % 30 === 0) : options;
        },

        groups: {
            loaded: false,
            show: false,
            dialogButtons: [{
                type: 'primary',
                text: '加入小组',
            }],
            lists: [],
            nameLists: []
        },

        isGroupPickerShow: false,

        isJoinGroupShow: false,
        joinLock: false,
        isGroupsShow: false,
        myGroups: {},
        myGroupsColumns: [],

        isUpdateLogShow: false
    },

    onLoad: function (options) {
        var that = this
        wx.onThemeChange((e) => {
            if (e.theme) {
                that.setData({
                    theme: e.theme,
                    themeBg: e.theme === 'light' ? app.globalData.themeBg : 'dark',
                    'prefs.darkModeSwitch': e.theme === 'dark'
                })
                app.globalData.theme = e.theme
            }
        })
    },

    onShow: function (options) {
        if (app.globalData.userInfo) {
            this.setData({
                theme: app.globalData.theme,
                themeBg: app.globalData.theme === 'light' ? app.globalData.themeBg : 'dark',
                'prefs.darkModeSwitch': app.globalData.theme === 'dark',
                'prefs.darkFollowSysSwitch': app.globalData.followSys,
                'prefs.themeGreen': app.globalData.themeBg === 'green',
                'prefs.themeRed': app.globalData.themeBg === 'red',
                avatarUrl: app.globalData.userInfo.avatar,
                nickName: app.globalData.userInfo.nickName,
                addressInfo: app.globalData.userInfo.fullAddr
            })
        }
    },

    onMyGroups() {
        this.fetchGroups()
        this.setData({
            'groups.show': true
        })
    },
    async fetchGroups() {
        this.setData({
            'groups.loaded': false
        })
        let groupLists = await utils.syncRequest("/users", {
            action: 'queryGroupLists'
        })
        let groupNames = groupLists.data.map((value, idx, _) => {
            return value.groupName
        })
        this.setData({
            'groups.lists': groupLists.data,
            'groups.nameLists': groupNames,
            'groups.loaded': true
        })
    },
    async tapJoinGroup() {
        wx.showModal({
            title: '请输入小组口令',
            content: '',
            editable: true,
            async success(res) {
                if (res.confirm && res.content) {
                    let gRes = await utils.syncRequest('/users', {
                        action: 'joinGroup',
                        key: res.content
                    })
                    if (gRes.data) {
                        wx.showToast({
                            title: '加入成功',
                            icon: 'success',
                            duration: 3000,
                            success() {
                                setTimeout(function () {
                                    wx.switchTab({
                                        url: '../index/index',
                                    })
                                }, 3000)
                            }
                        })
                    } else {
                        wx.showToast({
                            title: '加入失败',
                            icon: 'error',
                            duration: 3000
                        })
                    }
                }
            }
        })
    },
    closeJoinGroup() {
        this.setData({
            'groups.show': false
        })
    },

    onCreateEvent() {
        this.setData({
            'newEvent.minDate': utils.nextOKTime(),
            'newEvent.show': true
        })
    },
    checkEventDesc: function (value) {
        this.setData({
            'newEvent.eventDescription': value.detail
        })
    },
    confirmDatePicker: function (value) {
        // UNIX TIME FORMAT
        var dateTime = utils.secondsNo(value.detail)
        if (this.data.newEvent.dateFlag === 0) {
            this.setData({
                'newEvent.eventStart': dateTime,
                'newEvent.eventStartFormatted': utils.unixToFormatted(dateTime),
                'newEvent.eventStartError': ''
            })
        } else if (this.data.newEvent.dateFlag === 1) {
            this.setData({
                'newEvent.eventRoll': dateTime,
                'newEvent.eventRollFormatted': utils.unixToFormatted(dateTime),
                'newEvent.eventRollError': ''
            })
        } else if (this.data.newEvent.dateFlag === 2) {
            this.setData({
                'newEvent.eventEnd': dateTime,
                'newEvent.eventEndFormatted': utils.unixToFormatted(dateTime),
                'newEvent.eventEndError': ''
            })
        }
        this.setData({
            isDatePickerShow: false,
            'newEvent.dateFlag': -1,
        })
    },

    onCustomize() {
        this.setData({
            'prefs.show': true
        })
    },
    closeCustomize() {
        this.setData({
            'prefs.show': false
        })
    },
    onBgChange(e) {
        let themeBg = e.detail.value
        this.setData({
            themeBg: this.data.theme === 'light' ? themeBg : 'dark'
        })
        app.globalData.themeBg = themeBg
        wx.setStorage({
            key: 'themeBg',
            data: themeBg
        })
    },
    onDarkModeSwitch(e) {
        let theme = e.detail.value ? 'dark' : 'light'
        this.setData({
            theme: theme,
            themeBg: theme === 'light' ? 'green-bg' : 'dark-bg',
        })
        app.setTheme(theme)
    },
    onDarkFollowSysSwitch(e) {
        let value = e.detail.value
        try {
            wx.setStorageSync('followSys', value)
            app.globalData.followSys = value
        } catch (e) {
            console.log(e)
        }
    }
})