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