import {
    syncRequest
} from '../../utils/requests'
import {
    showModalPromisified
} from '../../utils/promisify'

Page({
    data: {
        sheetShow: false,
        actions: [{
                name: '组建小组',
                id: 'create_group'
            },
            {
                name: '加入小组',
                id: 'join_group'
            },
            {
                name: '离开小组',
                id: 'leave_group'
            },
            {
                name: '创建活动',
                id: 'create_event'
            }
        ],

        groups: [],
        groupId: 0,

        group: {},
        popup: true,
        group_members: [],

        activeCollapse: []
    },

    onLoad(options) {

    },
    onShow() {
        this.loadGroups()
    },
    onPullDownRefresh() {

    },

    onOpenSheet() {
        this.setData({
            sheetShow: true
        })
    },
    onCloseSheet() {
        this.setData({
            sheetShow: false
        })
    },
    async onSelectSheet(e) {
        try {
            if (e.detail.id === 'create_group') {
                wx.navigateTo({
                    url: '/pages/group_create/group_create'
                })
            } else if (e.detail.id === 'join_group') {
                var res = await showModalPromisified({
                    title: '加入小组',
                    placeholderText: '请输入口令',
                    content: '',
                    editable: true
                })
                if (res.confirm) {
                    res.content = res.content.trim()
                    if (res.content !== '') {
                        res = await syncRequest('/groups', {
                            action: 'join',
                            token: res.content
                        })
                        wx.showToast({
                            title: '加入成功',
                            icon: 'success'
                        })
                        setTimeout(() => {
                            wx.reLaunch({
                                url: '/pages/launch/launch'
                            })
                        }, 1500)
                    }
                }
            } else if (e.detail.id === 'leave_group') {

            } else if (e.detail.id === 'create_event') {
                wx.navigateTo({
                    url: '/pages/events/events'
                })
            }
        } catch (e) {
            var title = '未知错误'
            if (e.data.errCode === 0x21) {
                wx.showToast({
                    title: '未匹配到小组',
                    icon: 'error'
                })
            } else if (e.data.errCode === 0x22) {
                wx.showToast({
                    title: '已在组内',
                    icon: 'error'
                })
            } else if (e.data.errCode === 0x25) {
                wx.showToast({
                    title: '等待审核',
                    icon: 'loading'
                })
            } else if (e.data.errCode === 0x26) {
                wx.showToast({
                    title: '已在审核中',
                    icon: 'error'
                })
            } else {
                wx.showToast({
                    title: '未知错误',
                    icon: 'error'
                })
            }
        }
    },

    onSelectGroup(e) {
        let id = e.detail
        this.setData({
            groupId: id
        })
    },

    async loadGroups() {
        try {
            let res = await syncRequest('/users', {
                action: 'load_groups'
            })
            this.setData({
                groups: res.data.groups,
                group: res.data.group,
                groupId: res.data.group._id
            })
        } catch (e) {
            wx.showToast({
                title: '未知错误',
                icon: 'error'
            })
        }
    },

    onChangeCollapse(e) {
        this.setData({
            activeCollapse: e.detail
        })
    },
    async onOpenCollapse(e) {
        try {
            let group_id = this.data.group._id
            if (e.detail === "group_members") {
                let res = await syncRequest('/groups', {
                    action: 'load_members',
                    group_id: group_id
                })
                this.setData({
                    group_members: res.data.data,
                    groupMembersLoading: false
                })
            }
        } catch (e) {
            wx.showToast({
                title: '未知错误',
                icon: 'error'
            })
        }

    }
})