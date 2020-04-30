// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database().collection('pair')
const eventDB = cloud.database().collection('event')

const shuffle = arr => {
  let i = arr.length;
  while (i) {
    let j = Math.floor(Math.random() * i--);
    [arr[j], arr[i]] = [arr[i], arr[j]];
  }
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

const dice = async _eid => {
  var records = await db.where({ _eid: _eid }).get()

  records = records.data

  shuffle(records)
  records.map((value, key, _) => { value.myno = key + 1 })

  shuffle(records)
  var idx_diced = records.map(r => { return r.myno })
  idx_diced.push(idx_diced[0])
  var _names = unPackQuery(await cloud.callFunction({
    name: 'userdbo',
    data: {
      "action": "queryList",
      "list": records.map(r => { return r.sid })
    }
  }))
  _names[0].push(_names[0][0])
  var names = Array.from(_names[1])
  shuffle(names)
  
  eventDB.doc(_eid).update({
    data: {
      idx_diced: idx_diced,
      _names_diced: _names[0],
      names: names
    }
  })
  for (var i = 0, len = records.length; i < len; i++) {
    nextKey = (i == len - 1) ? 0 : i + 1
    await db.doc(records[i]._id).update({
      data: {
        myno: records[i].myno,
        itno: records[nextKey].myno,
        rid: records[nextKey].sid,
      }
    })
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  var curTime = new Date().getTime()
  var events = await eventDB.where({ rolled: false, audited: true }).get()
  for (var i = 0, len = events.data.length; i < len; i++) {
    var eve = events.data[i]
    if (curTime >= eve.rollTime) {
      await dice(eve._id)
      await eventDB.doc(eve._id).update({ data: { rolled: true } })
    }
  }
}