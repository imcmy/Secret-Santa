// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database().collection('pair')
const userDB = cloud.database().collection('user')

// 云函数入口函数
exports.main = async (event, context) => {
  var action = event.action
  var openid = cloud.getWXContext().OPENID
  try {
    if (action === 'load') {
      var curTime = Date.now()
      var eventRecord = await cloud.callFunction({
        name: 'eventdbo',
        data: {
          "action": "fdoc",
          "_id": event._eid
        }
      })

      var recordsCount = await db.where({_eid: event._eid}).count()
      var record = await db.where({
        _eid: event._eid,
        sid: openid
      }).get()

      _in = record.data.length > 0
      receiver = await cloud.callFunction({
        name: 'userdbo',
        data: {
          "action": "getAddress",
          "rid": (_in && record.data[0].rid) ? record.data[0].rid : ''
        }
      })
      
      return {
        event: eventRecord,
        recordsCount: recordsCount.total,
        record: record,
        _in: _in,
        receiver: receiver
      }
    } else if (action === 'ins') {
      return await db.add({
        data: {
          _eid: event._eid,
          sid: openid
        }
      })
    } else if (action === 'del') {
      return await db.where({
        _eid: event._eid,
        sid: openid
      }).remove()
    }

    // else if (action === 'upd') {
    //   return await db.doc(event._id).update({
    //     data: {
    //       eventName: event.eventName,
    //       startTime: event.startTime,
    //       rollTime: event.rollTime,
    //     }
    //   })
    // } else if (action === 'loc') {
    //   return await db.loc(event._id).get()
    // } else if (action === 'get') {
    //   var eventRecords = {
    //     wait: [],
    //     current: [],
    //     end: []
    //   }
    //   var records = await db.get()
    //   var curTime = Date.now()

    //   await records.data.forEach((item, index, arr) => {
    //     item.startTimeFormatted = formatTime(item.startTime)
    //     item.rollTimeFormatted = formatTime(item.rollTime)
    //     if (item.startTime > curTime)
    //       eventRecords.wait.push(item)
    //     else if (item.startTime <= curTime && curTime <= item.rollTime)
    //       eventRecords.current.push(item)
    //     else if (item.rollTime < curTime)
    //       eventRecords.end.push(item)
    //   })

    //   return eventRecords
    // }
  } catch (e) {
    console.log(e)
  }
}