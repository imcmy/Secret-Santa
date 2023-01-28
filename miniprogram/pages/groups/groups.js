import {
    syncRequest
} from '../../utils/requests'
import {
    showModalPromisified
} from '../../utils/promisify'
import * as utils from '../../utils/utils'

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
                name: '创建活动',
                id: 'create_event'
            },
            {
                name: '离开小组',
                id: 'leave_group'
            }
        ],

        groups: [],
        group: {},
        groupId: '',

        event: {},
        event_show: false,

        group_members: [],
        group_events: [],
        waiting_members: [],
        waiting_events: [],

        activeCollapse: []
    },

    onLoad(options) {

    },
    onShow() {
        this.loadGroups()
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
                if (this.data.group.is_manager) {} else {

                }
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
                    icon: 'success'
                })
            } else if (e.data.errCode === 0x26) {
                wx.showToast({
                    title: '已在审核中',
                    icon: 'error'
                })
            } else {
                console.log(e)
                wx.showToast({
                    title: '未知错误',
                    icon: 'error'
                })
            }
        }
    },

    async onSelectGroup(e) {
        try {
            let res = await syncRequest('/groups', {
                action: 'load_group',
                group_id: e.detail
            })
            var actions = this.data.actions
            if(res.data.is_manager)
                actions = actions.slice(0, 3)
            else if (actions.length === 3)
                actions.push({
                    name: '离开小组',
                    id: 'leave_group'
                })
            this.setData({
                actions: actions,
                group: res.data,
                groupId: res.data._id,
                group_members: [],
                group_events: [],
                waiting_members: [],
                waiting_events: []
            })
        } catch (e) {
            wx.showToast({
                title: '未知错误',
                icon: 'error'
            })
        }
    },

    async loadGroups() {
        try {
            let res = await syncRequest('/users', {
                action: 'load_groups'
            })
            var actions = this.data.actions
            if(res.data.group.is_manager)
                actions = actions.slice(0, 3)
            else if (actions.length === 3)
                actions.push({
                    name: '离开小组',
                    id: 'leave_group'
                })
            this.setData({
                actions: actions,
                groups: res.data.groups,
                group: res.data.group,
                groupId: res.data.group._id,
                group_members: [],
                group_events: [],
                waiting_members: [],
                waiting_events: []
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
            } else if (e.detail === "group_events") {
                let res = await syncRequest('/groups', {
                    action: 'load_events',
                    group_id: group_id
                })
                res.data.data.map(o => {
                    o.event_rolled = o.event_rolled === 'true'
                    o.event_ended = o.event_ended === 'true'
                })
                this.setData({
                    group_events: res.data.data
                })
            } else if (e.detail === "waiting_members") {
                let res = await syncRequest('/groups', {
                    action: 'load_waiting_members',
                    group_id: group_id
                })
                this.setData({
                    waiting_members: res.data.data
                })
            } else if (e.detail === "waiting_events") {
                let res = await syncRequest('/groups', {
                    action: 'load_waiting_events',
                    group_id: group_id
                })
                res.data.data.map(o => o.event_start = utils.formattedTime(o.event_start))
                this.setData({
                    waiting_events: res.data.data
                })
            }
        } catch (e) {
            console.log(e)
            wx.showToast({
                title: '未知错误',
                icon: 'error'
            })
        }
    },

    async onAuditEvent(e) {
        let res = await syncRequest('/events', {
            action: 'query',
            event_id: e.currentTarget.id
        })
        var event = res.data.data
        event.event_start = utils.formattedTime(event.event_start)
        event.event_roll = utils.formattedTime(event.event_roll)
        event.event_end = utils.formattedTime(event.event_end)
        this.setData({
            event: event,
            event_show: true
        })
    },
    async onPassAudit(e) {
        try {
            await syncRequest('/events', {
                action: 'audit',
                result: 'pass',
                event_id: this.data.event._id,
                group_id: this.data.groupId
            })
            this.data.waiting_events = this.data.waiting_events.filter(o => {
                if (o._id !== this.data.event._id) {
                    return true
                } else {
                    this.data.group_events.push(o)
                    return false
                }
            });
            this.setData({
                event_show: false,
                waiting_events: this.data.waiting_events,
                group_events: this.data.group_events,
                'group.waiting_events': this.data.group.waiting_events - 1,
                'group.group_events': this.data.group.group_events + 1,
            })
        } catch (e) {
            wx.showToast({
                title: '未知错误',
                icon: 'error'
            })
        }
    },
    async onFailAudit(e) {
        try {
            await syncRequest('/events', {
                action: 'audit',
                result: 'fail',
                event_id: this.data.event._id,
                group_id: this.data.groupId
            })
            this.data.waiting_events = this.data.waiting_events.filter(o => {
                return o._id !== this.data.event._id
            });
            this.setData({
                event_show: false,
                waiting_events: this.data.waiting_events,
                'group.waiting_events': this.data.group.waiting_events - 1
            })
        } catch (e) {
            wx.showToast({
                title: '未知错误',
                icon: 'error'
            })
        }
    },
    onPopupClose() {
        this.setData({
            event_show: false
        })
    },

    async onAcceptAudit(e) {
        try {
            await syncRequest('/groups', {
                action: 'audit',
                result: 'accept',
                group_id: this.data.groupId,
                user_id: e.currentTarget.id
            })
            this.data.waiting_members = this.data.waiting_members.filter(o => {
                if (o._id !== e.currentTarget.id) {
                    return true
                } else {
                    this.data.group_members.push(o)
                    return false
                }
            });
            this.setData({
                waiting_members: this.data.waiting_members,
                group_members: this.data.group_members,
                'group.waiting_members': this.data.group.waiting_members - 1,
                'group.group_members': this.data.group.group_members + 1,
            })
        } catch (e) {
            wx.showToast({
                title: '未知错误',
                icon: 'error'
            })
        }
    },
    async onRejectAudit(e) {
        try {
            await syncRequest('/groups', {
                action: 'audit',
                result: 'reject',
                group_id: this.data.groupId,
                user_id: e.currentTarget.id
            })
            this.data.waiting_members = this.data.waiting_members.filter(o => {
                return o._id !== e.currentTarget.id
            });
            this.setData({
                waiting_members: this.data.waiting_members,
                'group.waiting_members': this.data.group.waiting_members - 1
            })
        } catch (e) {
            wx.showToast({
                title: '未知错误',
                icon: 'error'
            })
        }
    },

    onTransferManager(e) {
        console.log(e)
    }
})