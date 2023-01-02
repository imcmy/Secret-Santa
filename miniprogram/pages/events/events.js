import * as utils from '../../utils/utils'

Page({
    data: {
        pickerValue: null,
        pickerMin: null,
        pickerMax: null,
        filter(type, options) {
            return type === 'minute' ? options.filter(option => option % 30 === 0) : options;
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
            dateFlag: -1,
            minDate: utils.pickerDate()[0],
            uploadLock: false
        },
        
    },

    onLoad(options) {

    },
    onShow() {
        var date = utils.pickerDate()
        console.log(date)
        this.setData({
            pickerValue: date[0],
            pickerMin: date[0],
            pickerMax: date[1]
        })
    },

    onCreateEvent() {
        this.setData({
            'newEvent.minDate': utils.pickerDate()[0],
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
})