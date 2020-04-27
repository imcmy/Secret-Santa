// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database().collection('pair')
const userDB = cloud.database().collection('user')

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
  var action = event.action
  var openid = cloud.getWXContext().OPENID
  
  try {
    switch (action) {
      case 'query':
        var eventRecord = unPackQuery(await cloud.callFunction({
          name: 'eventdbo',
          data: {
            "action": "queryFormatted",
            "_id": event._eid
          }
        }))

        var recordsCount = await db.where({ _eid: event._eid }).count()
        var record = unPackQuery(await db.where({
          _eid: event._eid,
          sid: openid
        }).get())

        _in = record.length > 0
        receiver = unPackQuery(await cloud.callFunction({
          name: 'userdbo',
          data: {
            "action": "queryAddr",
            "rid": (_in && record[0].rid) ? record[0].rid : ''
          }
        }))

        return {
          event: eventRecord,
          recordsCount: recordsCount.total,
          record: record,
          _in: _in,
          receiver: receiver
        }
      case 'insert':
        return await db.add({ data: {_eid: event._eid, sid: openid} })
      case 'delete':
        return await db.where({ _eid: event._eid, sid: openid }).remove()
      case 'searchIn':
        var inRecords = []
        var searches = unPackQuery(await db.where({ sid: openid }).get())
        for (idx in searches) {
          var unpack = unPackQuery(await cloud.callFunction({
            name: 'eventdbo',
            data: {
              "action": "query",
              "_id": searches[idx]._eid
            }
          }))
          if (unpack[0])
            inRecords.push(unpack[0])
        }
        return inRecords
    }
  } catch (e) {
    console.log(e)
  }
}