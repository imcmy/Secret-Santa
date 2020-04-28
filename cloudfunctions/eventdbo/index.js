// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database().collection('event')

const formatTime = date => {
  var date = new Date(date + '-0800')
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const aWeekLater = date => {
  var date = new Date(date)
  date.setDate(date.getDate() + 7)
  return new Date(date)
}

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
    var current = Date.now()
    if (start > current)
      return [1, false]
    else if (start <= current && current <= roll)
      return [0, false]
    else if (roll < current && current <= end)
      return [2, false]
    else if (end < current)
      return [2, true]
    else
      return [-1, true] // Never
  } else {
    return [-1, true]
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
            startTime: new Date(event.startTime),
            rollTime: new Date(event.rollTime),
            endTime: aWeekLater(new Date(event.rollTime)),
            description: event.description,
            rolled: false,
            creater: openid
          }
        })
      case 'update':
        return await db.doc(event._id).update({
          data: {
            eventName: event.eventName,
            startTime: new Date(event.startTime),
            rollTime: new Date(event.rollTime),
            endTime: aWeekLater(new Date(event.rollTime)),
            description: event.description,
            rolled: false
          }
        })
      case 'query':
        return unPackQuery(await db.doc(event._id).get())
      case 'queryFormatted':
        var record = unPackQuery(await db.doc(event._id).get())

        record[0].startTimeFormatted = formatTime(record[0].startTime)
        record[0].rollTimeFormatted = formatTime(record[0].rollTime)
        
        var curTime = Date.now()
        record[0].diffStart = curTime - record[0].startTime
        record[0].diffRoll = curTime - record[0].rollTime

        var status = calcEventStatus(record[0].startTime, record[0].rollTime, record[0].endTime)
        record[0].status = status[0]
        record[0]._ended = status[1]

        return record
      case 'list':
        var eventRecords = {
          wait: [],
          current: [],
          end: []
        }

        var records = unPackQuery(await db.get())
        await records.forEach((item, index, _) => {
          item.startTimeFormatted = formatTime(item.startTime)
          item.rollTimeFormatted = formatTime(item.rollTime)
          var status = calcEventStatus(item.startTime, item.rollTime, item.endTime)[0]
          switch (status) {
            case 0: eventRecords.current.push(item); break;
            case 1: eventRecords.wait.push(item); break;
            case 2: eventRecords.end.push(item); break;
          }
        })

        return eventRecords
    }
  } catch (e) {
    console.log(e)
  }
}