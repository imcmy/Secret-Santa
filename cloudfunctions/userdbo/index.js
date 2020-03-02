// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database().collection('user')


// 云函数入口函数
exports.main = async (event, context) => {
  var openid = cloud.getWXContext().OPENID
  
  var action = event.action
  if (action === 'ins') {
    try {
      return await db.add({
        data: {
          _openid: openid,
          nickName: event.nickName,
          avatarUrl: event.avatarUrl,
          provinceName: event.provinceName,
          cityName: event.cityName,
          countyName: event.countyName,
          detailInfo: event.detailInfo,
          postalCode: event.postalCode,
          telNumber: event.telNumber,
          recipient: event.recipient,
          fullAddr: event.provinceName + event.cityName + event.countyName + event.detailInfo
        }
      })
    } catch (e) {
      console.log(e)
    }
  } else if (action === 'upd') {
    try {
      return await db.doc(event._id).update({
        data: {
          nickName: event.nickName,
          avatarUrl: event.avatarUrl,
          provinceName: event.provinceName,
          cityName: event.cityName,
          countyName: event.countyName,
          detailInfo: event.detailInfo,
          postalCode: event.postalCode,
          telNumber: event.telNumber,
          recipient: event.recipient,
          fullAddr: event.provinceName + event.cityName + event.countyName + event.detailInfo
        }
      })
    } catch (e) {
      console.log(e)
    }
  } else if (action === 'loc') {
    try {
      return await db.where({
        _openid: openid
      }).get()
    } catch (e) {
      console.log(e)
    }
  }
}