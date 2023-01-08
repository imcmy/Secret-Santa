import {
    syncRequest
} from '../../utils/requests'
import * as utils from '../../utils/utils'

Page({
    data: {
        popup: false,
        scene: 0,

        pickerTitle: '',
        pickerValue: null,
        pickerMin: null,
        pickerMax: null,
        filter(type, options) {
            return type === 'minute' ? options.filter(option => option % 30 === 0) : options;
        },
        pickerGroups: [],
        pickerGroupsId: [],

        name: '',
        group: '',
        groupId: '',
        description: '',
        start: 0,
        startFormatted: '',
        roll: 0,
        rollFormatted: '',
        end: 0,
        endFormatted: '',
        errors: {
            name: false,
            group: false,
            description: false,
            start: false,
            roll: false,
            end: false
        }
    },

    onLoad(options) {

    },
    onShow() {},

    onPopupClose() {
        this.setData({
            popup: false,
            scene: 0,
            pickerTitle: ''
        })
    },
    onConfirmPicker(e) {
        let time = utils.trimSeconds(e.detail)
        var data = {
            popup: false,
            scene: 0,
            pickerTitle: ''
        }
        switch (this.data.scene) {
            case 1:
                data = Object.assign(data, {
                    start: time,
                    startFormatted: utils.formattedTime(time),
                    roll: 0,
                    rollFormatted: '',
                    end: 0,
                    endFormatted: ''
                })
                break
            case 2:
                data = Object.assign(data, {
                    roll: time,
                    rollFormatted: utils.formattedTime(time),
                    end: 0,
                    endFormatted: ''
                })
                break
            case 3:
                data = Object.assign(data, {
                    end: time,
                    endFormatted: utils.formattedTime(time)
                })
                break
            case 4:
                data = Object.assign(data, {
                    group: e.detail.value,
                    groupId: this.data.pickerGroupsId[e.detail.index]
                })
                break
        }
        this.setData(data)
    },

    onClickStart(e) {
        var date = utils.pickerDate()
        this.setData({
            popup: true,
            scene: 1,
            pickerTitle: '开始时间',
            pickerValue: date[0],
            pickerMin: date[0],
            pickerMax: date[1]
        })
    },
    onClickRoll(e) {
        if (this.data.start === 0)
            return

        var date = utils.pickerDate(this.data.start)
        this.setData({
            popup: true,
            scene: 2,
            pickerTitle: '抽签时间',
            pickerValue: date[0],
            pickerMin: date[0],
            pickerMax: date[1]
        })
    },
    onClickEnd(e) {
        if (this.data.roll === 0)
            return

        var date = utils.pickerDate(this.data.roll)
        this.setData({
            popup: true,
            scene: 3,
            pickerTitle: '结束时间',
            pickerValue: date[0],
            pickerMin: date[0],
            pickerMax: date[1]
        })
    },
    async onClickGroup() {
        try {
            if (this.data.pickerGroups.length > 0) {
                this.setData({
                    popup: true,
                    scene: 4,
                    pickerTitle: '选择小组'
                })
            } else {
                let res = await syncRequest('/users', {
                    action: 'load_groups_allow_create'
                })
                this.setData({
                    popup: true,
                    scene: 4,
                    pickerTitle: '选择小组',
                    pickerGroups: res.data.groups,
                    pickerGroupsId: res.data.groups_id
                })
            }
        } catch (e) {
            if (e.data.errCode === 0x21) {
                wx.showToast({
                    title: '无符合的小组',
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

    onCreate(e) {
        let that = this
        let values = e.detail.value
        let errors = this.data.errors

        errors.name = (values.name === '')
        errors.group = (values.group === '')
        errors.start = (this.data.start === 0)
        errors.roll = (this.data.roll === 0)
        errors.end = (this.data.end === 0)

        this.setData({
            'errors.name': errors.name,
            'errors.group': errors.group,
            'errors.start': errors.start,
            'errors.roll': errors.roll,
            'errors.end': errors.end
        })
        if (!Object.values(errors).every(e => e === false))
            return

        wx.showLoading({
            title: "创建活动中"
        })

        var params = values
        params.action = 'create'
        params.group = this.data.groupId
        params.start = this.data.start
        params.roll = this.data.roll
        params.end = this.data.end
        
        syncRequest('/events', params)
            .then(() => {
                wx.hideLoading()
                wx.showToast({
                    title: '创建成功',
                    icon: 'success'
                })
                utils.delayBack(2000)
            }).catch((e) => {
                wx.hideLoading()
                if (e.data.errCode === 0x31) {
                    wx.showToast({
                        title: '名称或描述未通过内容安全检测',
                        icon: 'error'
                    })
                    this.setData({
                        'errors.name': true,
                        'errors.description': true
                    })
                } else if (e.data.errCode === 0x32) {
                    wx.showToast({
                        title: '没有创建权限',
                        icon: 'error'
                    })
                } else {
                    console.log(e)
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



    // onCreateEvent() {
    //     this.setData({
    //         'newEvent.minDate': utils.pickerDate()[0],
    //         'newEvent.show': true
    //     })
    // },
    // checkEventDesc: function (value) {
    //     this.setData({
    //         'newEvent.eventDescription': value.detail
    //     })
    // },
    // confirmDatePicker: function (value) {
    //     // UNIX TIME FORMAT
    //     var dateTime = utils.secondsNo(value.detail)
    //     if (this.data.newEvent.dateFlag === 0) {
    //         this.setData({
    //             'newEvent.eventStart': dateTime,
    //             'newEvent.eventStartFormatted': utils.unixToFormatted(dateTime),
    //             'newEvent.eventStartError': ''
    //         })
    //     } else if (this.data.newEvent.dateFlag === 1) {
    //         this.setData({
    //             'newEvent.eventRoll': dateTime,
    //             'newEvent.eventRollFormatted': utils.unixToFormatted(dateTime),
    //             'newEvent.eventRollError': ''
    //         })
    //     } else if (this.data.newEvent.dateFlag === 2) {
    //         this.setData({
    //             'newEvent.eventEnd': dateTime,
    //             'newEvent.eventEndFormatted': utils.unixToFormatted(dateTime),
    //             'newEvent.eventEndError': ''
    //         })
    //     }
    //     this.setData({
    //         isDatePickerShow: false,
    //         'newEvent.dateFlag': -1,
    //     })
    // },
})