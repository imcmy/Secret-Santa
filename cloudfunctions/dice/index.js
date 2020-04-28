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

const dice = async _eid => {
  var records = await db.where({ _eid: _eid }).get()

  records = records.data
  shuffle(records)
  records.map((value, key, _) => { value.myno = key + 1 })

  shuffle(records)
  var diced = records.map(r => { return r.myno })
  diced.push(diced[0])
  eventDB.doc(_eid).update({ data: { result: diced } })
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
  var curTime = new Date(new Date().getTime() + 28800 * 1000)
  var events = await eventDB.where({rolled: false}).get()
  for (var i = 0, len = events.data.length; i < len; i++) {
    var eve = events.data[i]
    var rollTime = new Date(eve.rollTime)
    if (curTime >= rollTime) {
      await dice(eve._id)
      await eventDB.doc(eve._id).update({ data: { rolled: true } })
    } 
  }
}