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
            "action": "query",
            "_id": event._eid
          }
        }))

        var isInGroup = await cloud.callFunction({
          name: 'userdbo_v2',
          data: {
            "action": "checkInGroup",
            "_openid": openid,
            "_gid": eventRecord[0].group || ''
          }
        })

        var record = unPackQuery(await db.where({
          _eid: event._eid,
          sid: openid
        }).get())
        _in = record.length > 0

        receiver = unPackQuery(await cloud.callFunction({
          name: 'addressdbo',
          data: {
            action: "queryCurrent",
            _openid: (_in && record[0].rid) ? record[0].rid : ''
          }
        }))

        return {
          _in: _in,
          event: eventRecord,
          record: record,
          receiver: receiver,
          isInGroup: isInGroup.result
        }
      case 'insert':
        await db.add({ data: { _eid: event._eid, sid: openid, time: new Date().getTime() } })
        return await cloud.callFunction({
          name: 'eventdbo',
          data: {
            "action": "inc",
            "_id": event._eid
          }
        })
      case 'delete':
        await db.where({ _eid: event._eid, sid: openid }).remove()
        return await cloud.callFunction({
          name: 'eventdbo',
          data: {
            "action": "minc",
            "_id": event._eid
          }
        })
      case 'searchIn':
        var inRecords = [[], [], []]
        var searches = unPackQuery(await db.where({ sid: openid }).get())
        for (idx in searches) {
          var unpack = unPackQuery(await cloud.callFunction({
            name: 'eventdbo',
            data: {
              "action": "query",
              "_id": searches[idx]._eid
            }
          }))
          if (unpack[0] && unpack[0].status != 1) {
            var staRecord = {0: 0, 2: 1, 3: 2}
            inRecords[staRecord[unpack[0].status]].push(unpack[0])
          }
        }
        return inRecords
      case 'searchInv2':
        return unPackQuery(await db.where({ sid: event._openid }).get());
    }
  } catch (e) {
    console.log(e)
  }
}