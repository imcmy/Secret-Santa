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

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const aWeekLater = date => {
  var date = new Date(date + '-0800')
  date = date.setDate(date.getDate() + 7)
  return new Date(date)
}


// 云函数入口函数
exports.main = async (event, context) => {
  var action = event.action
  try {
    if (action === 'ins') {
      return await db.add({
        data: {
          eventName: event.eventName,
          startTime: event.startTime,
          rollTime: event.rollTime,
          endTime: aWeekLater(event.rollTime),
          description: event.description
        }
      })
    } else if (action === 'upd') {
      return await db.doc(event._id).update({
        data: {
          eventName: event.eventName,
          startTime: event.startTime,
          rollTime: event.rollTime,
          endTime: aWeekLater(event.rollTime),
          description: event.description
        }
      })
    } else if (action === 'doc') {
      return await db.doc(event._id).get()
    } else if (action === 'fdoc') {
      var curTime = Date.now()
      var record = await db.doc(event._id).get()

      record.data.startTimeFormatted = formatTime(record.data.startTime)
      record.data.rollTimeFormatted = formatTime(record.data.rollTime)

      record.data.diffStart = curTime - record.data.startTime
      record.data.diffRoll = curTime - record.data.rollTime
      record.data.diffEnd = curTime - record.data.endTime

      if (record.data.diffStart < 0)
        record.data.status = 1
      else if (record.data.diffStart >= 0 && record.data.diffRoll < 0)
        record.data.status = 0
      else if (record.data.diffRoll >= 0) 
        record.data.status = 2
      else
        record.data.status = -1
      record.data._ended = record.data.diffEnd >= 0
      
      return record
    } else if (action === 'get') {
      var eventRecords = {
        wait: [],
        current: [],
        end: []
      }
      var records = await db.get()
      var curTime = Date.now()

      await records.data.forEach((item, index, arr) => {
        item.startTimeFormatted = formatTime(item.startTime)
        item.rollTimeFormatted = formatTime(item.rollTime)
        if (item.startTime > curTime)
          eventRecords.wait.push(item)
        else if (item.startTime <= curTime && curTime <= item.rollTime)
          eventRecords.current.push(item)
        else if (item.rollTime < curTime)
          eventRecords.end.push(item)
      })

      return eventRecords
    }
  } catch (e) {
    console.log(e)
  }
}