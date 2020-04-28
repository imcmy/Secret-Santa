//app.js
App({
  onLaunch: function () {
    
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'env-gift204',
        traceUser: true,
      })
    }

    this.globalData = {
      version: '1.1.200428'
    }
  }
})
