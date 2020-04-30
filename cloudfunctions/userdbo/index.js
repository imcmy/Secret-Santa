// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database().collection('user')


const unPackQuery = obj => {
  var queried = []
  var data = obj.data ? obj.data : (obj.result ? obj.result : [])
  if (Array.isArray(data))
    data.forEach((value, index, _) => {
      queried.push(value)
    })
  else
    queried.push(data)
  return queried
}

// 云函数入口函数
exports.main = async (event, context) => {
  var openid = cloud.getWXContext().OPENID
  
  var action = event.action
  try {
    switch (action) {
      case 'insert':
        var userCheck = await db.where({ _openid: openid }).count()
        if (userCheck > 0) return
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
            fullAddr: event.provinceName + event.cityName + event.countyName + event.detailInfo,
            privilege: 0
          }
        })
      case 'update':
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
      case 'query':
        return unPackQuery(await db.where({ _openid: openid }).get())
      case 'queryAddr':
        var unPack = unPackQuery(await db.where({ _openid: event.rid }).get())
        return {
          "nickName": unPack[0].nickName,
          "fullAddr": unPack[0].fullAddr,
          "telNumber": unPack[0].telNumber,
          "postalCode": unPack[0].postalCode,
          "recipient": unPack[0].recipient
        }
      case 'queryList':
        var list = [[], []]
        for (var key in event.list) {
          var user = unPackQuery(await db.where({ _openid: event.list[key] }).get())
          list[0].push(user[0].nickName)
          list[1].push(user[0].nickName + '(' + user[0].recipient + ')')
        }
        return list
    }
  } catch (e) {
    console.log(e)
  }
}