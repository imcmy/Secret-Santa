// components/tag/tag.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        type: {
            type: String,
            value: 'primary'
        },
        plain: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        color: '#28a745'
    },

    /**
     * 组件的方法列表
     */
    methods: {

    },
    lifetimes: {
        ready() {
            let color = '#28a745'
            if (this.properties.type === 'primary') {
                color = '#28a745'
            } else if (this.properties.type === 'end') {
                color = '#6c757d'
            }
            this.setData({
                color: color
            })
        }
    }
})