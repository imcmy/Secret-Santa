// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database().collection('event')


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

const calcEventStatus = (start, roll, end) => {
  if (start <= roll && roll <= end) {
    var current = new Date().getTime()
    if (start > current) return 1
    else if (start <= current && current <= roll) return 0
    else if (roll < current && current <= end) return 2
    else if (end < current) return 3
    else return -1
  } else {
    return -1
  }
}


// 云函数入口函数
exports.main = async (event, context) => {
  var action = event.action
  var openid = cloud.getWXContext().OPENID
  try {
    switch (action) {
      case 'insert':
        return await db.add({
          data: {
            eventName: event.eventName,
            startTime: event.startTime,
            rollTime: event.rollTime,
            endTime: event.endTime,
            description: event.description,
            rolled: false,
            ended: false,
            creater: openid
          }
        })
      case 'update':
        return await db.doc(event._id).update({
          data: {
            eventName: event.eventName,
            startTime: event.startTime,
            rollTime: event.rollTime,
            endTime: event.endTime,
            description: event.description,
            rolled: false,
            ended: false,
          }
        })
      case 'query':
        var record = unPackQuery(await db.doc(event._id).get())
        record[0].status = calcEventStatus(record[0].startTime, record[0].rollTime, record[0].endTime)
        if (!record[0].ended && record[0].status == 3) {
          var list = unPackQuery(await cloud.callFunction({
            name: 'userdbo',
            data: {
              "action": "queryList",
              "list": record[0]._id_diced
            }
          }))
          record[0]._name_diced = list
          record[0].ended = true
          await db.doc(event._id).update({ data: { _name_diced: list, ended: true } })
        }
        return record
      case 'list':
        var eventRecords = {
          wait: [],
          register: [],
          publish: [],
          end: []
        }

        var records = unPackQuery(await db.get())
        await records.forEach((item, index, _) => {
          item.status = calcEventStatus(item.startTime, item.rollTime, item.endTime)
          switch (item.status) {
            case 0: eventRecords.register.push(item); break;
            case 1: eventRecords.wait.push(item); break;
            case 2: eventRecords.publish.push(item); break;
            case 3: eventRecords.end.push(item); break;
          }
        })

        return eventRecords
    }
  } catch (e) {
    console.log(e)
  }
}