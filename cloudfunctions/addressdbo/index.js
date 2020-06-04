// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database().collection('address')
const _ = cloud.database().command


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
        return await db.add({
          data: {
            _openid: openid,
            postalCode: event.postalCode,
            telNumber: event.telNumber,
            recipient: event.recipient,
            fullAddr: event.fullAddr,
            current: event.current
          }
        })
      case 'update':
        return await db.doc(event._id).update({
          data: {
            postalCode: event.postalCode,
            telNumber: event.telNumber,
            recipient: event.recipient,
            fullAddr: event.fullAddr
          }
        })
      case 'remove':
        var current = unPackQuery(await db.doc(event._id).get())[0].current
        await db.doc(event._id).remove()
        if (current) await db.where({ _openid: openid }).limit(1).update({data: {current: true}})
        return 0
      case 'toCurrent':
        await db.where({ _openid: openid, current: true }).update({ data: { current: false } })
        return await db.doc(event._id).update({ data: { current: true } })
      case 'query':
        return unPackQuery(await db.doc(event._id).get())
      case 'queryIndexPage':
        return unPackQuery(await db.where({ _openid: openid, current: true }).get())
      case 'queryAddr':
        var unPack = unPackQuery(await db.doc(event._id).get())
        return {
          "nickName": unPack[0].nickName,
          "fullAddr": unPack[0].fullAddr,
          "telNumber": unPack[0].telNumber,
          "postalCode": unPack[0].postalCode,
          "recipient": unPack[0].recipient
        }
      case 'queryAll':
        return unPackQuery(await db.where({ _openid: openid }).get())
    }
  } catch (e) {
    console.log(e)
  }
}

